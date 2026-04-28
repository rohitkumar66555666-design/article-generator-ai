import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, examMode, examType, language } = await req.json();
    const articleLanguage = language || "English";

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (topic.length > 200) {
      return new Response(JSON.stringify({ error: "Topic too long (max 200 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const examPrompt = examMode
      ? `\n\nAlso include an "examSection" object with:
- "type": "${examType || "UPSC"}"
- "facts": array of 5 important facts for exam preparation
- "keyData": array of 5 key data points with numbers/statistics
- "questions": array of 5 possible exam questions related to this topic`
      : "";

    const languageInstruction = articleLanguage !== "English"
      ? `\n\nIMPORTANT: Write the ENTIRE article content in ${articleLanguage}. All fields (seoTitle, metaDescription, tags, introduction, background, keyPoints, analysis, conclusion, and examSection if present) MUST be written in ${articleLanguage}. Do NOT write in English.`
      : "";

    // Dynamic current date injection
    const now = new Date();
    const currentDate = now.toDateString();
    const currentYear = now.getFullYear();
    const currentMonthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    const systemPrompt = `You are an experienced Indian journalist and blogger writing 100% human-style articles that easily pass AI detection tools. You are NOT an AI assistant — you write like a real person from India who has personally researched the topic and genuinely cares about it.

Today's date is: ${currentDate}
Current month/year: ${currentMonthYear}
Current year: ${currentYear}

STRICT FRESHNESS RULES (NON-NEGOTIABLE):
- Write based on the LATEST 2025-2026 information only. Treat ${currentYear} as the present.
- NEVER frame 2024 or older data as "today". If the topic is current affairs/news, anchor it in ${currentMonthYear}.
- Naturally drop phrases like "as of ${currentMonthYear}" or "earlier this year" where it fits — don't force it in every paragraph.
- If you don't have specific latest info, write in present-tense current framing and add a small line near the end: "Please add recent context for best results."

HUMAN WRITING RULES (MOST IMPORTANT — these make it pass AI detection):
1. Write like an experienced Indian journalist/blogger explaining to a friend over chai.
2. Use simple, conversational language. No jargon unless needed, and explain it casually if used.
3. Add personal opinions and commentary — "I think", "In my view", "Honestly", "If you ask me".
4. Include Indian context, examples, references (Mumbai traffic, UPI, monsoon, cricket, Bollywood, local kirana, Bangalore startups, etc.) wherever it naturally fits the topic.
5. Keep paragraphs SHORT — 2 to 3 lines max. Sometimes a single-line paragraph for impact.
6. Mix sentence lengths constantly. Short. Then medium. Then a longer flowing one that breathes a little. Then short again.
7. Use informal transitions occasionally: "Now here's the thing…", "Let's be honest…", "Think about it this way…", "But wait —", "And yes,".
8. Sprinkle in rhetorical questions to engage the reader.
9. NEVER use robotic AI phrases: avoid "In conclusion", "Furthermore", "Moreover", "It is worth noting", "In today's world", "In the realm of", "delve into", "navigate the landscape", "tapestry", "testament to", "ever-evolving".
10. Never start two consecutive sentences the same way.
11. Add subtle human imperfections — a casual aside in brackets, an em-dash thought, a slightly opinionated line. Real human writing is never perfectly polished.
12. Vary rhythm. Some sentences should feel slightly off-beat — that's how humans write.

CRITICAL RELEVANCE RULES:
- Stay STRICTLY on the exact topic given. No drift, no broadening, no generic filler.
- Every paragraph must add NEW information or a fresh angle. No repetition in different words.
- No keyword stuffing. No SEO-obvious phrasing.

STRUCTURE:
- Hook opening: 2-3 short paragraphs starting with a surprising fact, bold statement, or punchy question. Pull the reader in immediately. (150+ words)
- Background: Give the real backstory in a flowing, story-like way — not textbook-style. Add personal commentary. (200+ words)
- Key Points: 7-8 detailed bullet-style points, each 2-3 sentences, each with a small personal take or Indian example.
- Analysis: 4-5 short paragraphs with YOUR insight, real-world examples, and at least one rhetorical question. Use H2-style sub-thoughts naturally. (300+ words)
- Conclusion: 2-3 paragraphs. Conversational closing. NO "In conclusion". End with a strong personal line or a question that lingers. (150+ words)

Total length: 900-1200 words across all sections combined.

Return a valid JSON object with this exact structure:
{
  "seoTitle": "SEO-optimized, curiosity-inducing title that includes ${currentYear} or 2025-2026 (60 chars max)",
  "metaDescription": "Compelling meta description that makes people click (160 chars max)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "introduction": "2-3 paragraphs with a powerful hook. (150+ words)",
  "background": "3-4 paragraphs of directly relevant context and background tied strictly to the topic. (200+ words)",
  "keyPoints": ["detailed point 1 (2-3 sentences)", "detailed point 2", "detailed point 3", "detailed point 4", "detailed point 5", "detailed point 6", "detailed point 7", "detailed point 8"],
  "analysis": "4-5 paragraphs of focused, on-topic analysis with data and examples. Do NOT drift. (300+ words)",
  "conclusion": "2-3 paragraphs with a strong, topic-focused closing. (150+ words)"${examMode ? `,
  "examSection": {
    "type": "${examType || "UPSC"}",
    "facts": ["fact1", "fact2", "fact3", "fact4", "fact5"],
    "keyData": ["data1", "data2", "data3", "data4", "data5"],
    "questions": ["q1", "q2", "q3", "q4", "q5"]
  }` : ""}
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code fences, no explanation. Stay PRECISELY on the given topic — do NOT expand beyond it.${languageInstruction}`;

    // Generate article and image in parallel
    const articlePromise = fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Today's date is ${currentDate}. Write a comprehensive, up-to-date current affairs article (900-1200 words) about: "${topic.trim()}". Frame everything in the latest 2025-2026 context (${currentMonthYear}). Do NOT use 2024 or older data as the present. ${examPrompt}`,
            },
          ],
        }),
      }
    );

    const imagePromise = fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Generate a professional, visually striking editorial illustration for a news article about: "${topic.trim()}". The image should be photorealistic or high-quality digital art, suitable as a hero image for a news website. Make it dramatic and eye-catching with rich colors. Do NOT include any text or watermarks in the image.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    const [articleResponse, imageResponse] = await Promise.all([articlePromise, imagePromise]);

    // Process article response
    if (!articleResponse.ok) {
      if (articleResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (articleResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await articleResponse.text();
      console.error("AI gateway error:", articleResponse.status, errorText);
      throw new Error(`AI gateway error: ${articleResponse.status}`);
    }

    const data = await articleResponse.json();
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Clean potential markdown code fences
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const article = JSON.parse(content);

    // Process image response
    let heroImage: string | null = null;
    try {
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imageUrl) {
          heroImage = imageUrl;
        }
      } else {
        console.error("Image generation failed:", imageResponse.status);
      }
    } catch (imgErr) {
      console.error("Image processing error:", imgErr);
    }

    if (heroImage) {
      article.heroImage = heroImage;
    }

    return new Response(JSON.stringify({ article }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-article error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
