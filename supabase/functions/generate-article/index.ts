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

    const systemPrompt = `You are an expert SEO blog writer for current affairs articles.

Today's date is: ${currentDate}
Current month/year: ${currentMonthYear}
Current year: ${currentYear}

STRICT FRESHNESS RULES (NON-NEGOTIABLE):
- Always write based on the LATEST 2025-2026 information only.
- NEVER use outdated 2024 or older data as the main framing.
- If the topic relates to news/events/current affairs, frame it in TODAY'S context (${currentMonthYear}).
- Mention phrases like "As of 2025-2026" or "${currentMonthYear}" where it adds credibility.
- If you do not have access to the latest specific info, write the article in present-tense current framing AND add a short note inside the conclusion: "Please add recent context for best results."
- Do NOT say things like "in 2024" as if it were the present. Treat ${currentYear} as the present.

You create highly attractive, engaging, and SEO-friendly articles. You stay STRICTLY relevant to the exact topic given — never drifting into unrelated ideas, broader themes, or a different angle. Your writing feels fresh, useful, and human-written with natural flow and strong readability.

CRITICAL RULES:
- Use the EXACT topic as the main focus. Do NOT change the subject, broaden it, or make it generic.
- Do NOT add unrelated background, filler, or forced analysis.
- Keep EVERY paragraph aligned with the topic.
- If the topic is about current affairs → write only current affairs content.
- If the topic is about gadgets → write only gadget-related content.
- If the topic is about tech → write only tech-related content.
- If the topic is about news summary → keep it concise and news-style.
- If the topic is about analysis → keep the analysis directly tied to the topic.
- Do NOT generate vague or generic content. Do NOT include anything that doesn't directly explain the topic.

WRITING STYLE:
- Write 800-1200 words across all sections combined
- Start with a STRONG, attention-grabbing hook that makes the reader want to continue
- Use short, punchy paragraphs with active voice
- Make it sound polished but not robotic — balance information with readability
- Use specific data points, dates, names, and statistics for credibility
- Include examples ONLY if they directly support the topic
- Avoid repeating the same point in different words
- Keep the content original, natural, and non-repetitive
- Use smooth transitions between sections
- End with a strong closing that summarizes naturally and leaves a lasting impression

STRUCTURE:
- Introduction: 2-3 paragraphs with a powerful hook and why this topic matters RIGHT NOW (150+ words)
- Main Body: Break into 3-6 clear sections with meaningful headings, each adding value and staying on-topic (500+ words)
- Conclusion: 2-3 paragraphs with a strong summary, future outlook, and memorable final statement (150+ words)

Return a valid JSON object with this exact structure:
{
  "seoTitle": "SEO-optimized, curiosity-inducing title (60 chars max)",
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
              content: `Write a comprehensive current affairs article about: "${topic.trim()}"${examPrompt}`,
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
