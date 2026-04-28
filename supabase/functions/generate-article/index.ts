import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper: fetch with timeout (avoids hanging the edge function)
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Try multiple models in order until one succeeds (handles model availability issues)
async function callAIWithFallback(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number,
) {
  const models = [
    "google/gemini-2.5-flash",
    "google/gemini-3-flash-preview",
    "google/gemini-2.5-flash-lite",
  ];

  let lastError: { status: number; text: string } | null = null;

  for (const model of models) {
    try {
      const res = await fetchWithTimeout(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        },
        timeoutMs,
      );

      if (res.ok) {
        console.log(`Article generated successfully with model: ${model}`);
        return { response: res, model };
      }

      // Surface rate-limit / payment errors immediately — fallback won't help
      if (res.status === 429 || res.status === 402) {
        return { response: res, model };
      }

      const errorText = await res.text();
      console.error(`Model ${model} failed (${res.status}):`, errorText);
      lastError = { status: res.status, text: errorText };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Model ${model} threw:`, msg);
      lastError = { status: 599, text: msg };
    }
  }

  throw new Error(
    `All AI models failed. Last error: ${lastError?.status} ${lastError?.text ?? "unknown"}`,
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { topic, examMode, examType, language } = body;
    const articleLanguage = language || "English";

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap topic length to keep prompts manageable & avoid crashes from huge inputs
    const safeTopic = topic.trim().slice(0, 200);

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
      ? `\n\nIMPORTANT: Write the ENTIRE article content in ${articleLanguage}. All fields MUST be written in ${articleLanguage}.`
      : "";

    const now = new Date();
    const currentDate = now.toDateString();
    const currentYear = now.getFullYear();
    const currentMonthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    const systemPrompt = `You are an experienced Indian journalist and blogger writing 100% human-style articles that easily pass AI detection tools. You are NOT an AI assistant — you write like a real person from India who has personally researched the topic.

Today's date is: ${currentDate}
Current month/year: ${currentMonthYear}
Current year: ${currentYear}

STRICT FRESHNESS RULES:
- Treat ${currentYear} as the present. Never frame 2024 or older as "today".
- Naturally drop phrases like "as of ${currentMonthYear}" where it fits.

HUMAN WRITING RULES (most important):
1. Write conversationally, like explaining to a friend over chai.
2. Add personal opinions: "I think", "honestly", "if you ask me".
3. Include Indian context (UPI, Mumbai, Bangalore startups, monsoon, cricket) where it fits.
4. Short paragraphs (2-3 lines). Mix sentence lengths constantly.
5. Use informal transitions: "Now here's the thing…", "Let's be honest…", "But wait —".
6. NEVER use: "In conclusion", "Furthermore", "Moreover", "It is worth noting", "delve into", "tapestry", "testament to", "ever-evolving".
7. Add subtle imperfections — casual asides, em-dash thoughts.
8. Stay STRICTLY on the exact topic. No drift.

STRUCTURE:
- Hook intro (150+ words)
- Background, story-style (200+ words)
- 7-8 detailed key points
- Analysis with personal insight (300+ words)
- Conversational conclusion, no "In conclusion" (150+ words)

Total: 900-1200 words.

Return ONLY a valid JSON object (no markdown, no code fences) with this structure:
{
  "seoTitle": "SEO title including ${currentYear} or 2025-2026 (60 chars max)",
  "metaDescription": "Compelling meta description (160 chars max)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "introduction": "150+ words",
  "background": "200+ words",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5", "point 6", "point 7", "point 8"],
  "analysis": "300+ words",
  "conclusion": "150+ words"${examMode ? `,
  "examSection": {
    "type": "${examType || "UPSC"}",
    "facts": ["fact1", "fact2", "fact3", "fact4", "fact5"],
    "keyData": ["data1", "data2", "data3", "data4", "data5"],
    "questions": ["q1", "q2", "q3", "q4", "q5"]
  }` : ""}
}${languageInstruction}`;

    const userPrompt = `Today is ${currentDate}. Write a 100% human-style article (900-1200 words) on this EXACT topic: "${safeTopic}". Write like an experienced Indian journalist — conversational, opinionated, with Indian context where it naturally fits. Frame everything in ${currentMonthYear}. Vary sentence length, add personal opinions, use short paragraphs, avoid robotic AI phrases.${examPrompt}`;

    // Generate article (with model fallback + 110s timeout) and image in parallel.
    // Image is best-effort — its failure must NOT break the article response.
    const articlePromise = callAIWithFallback(
      LOVABLE_API_KEY,
      systemPrompt,
      userPrompt,
      110_000,
    );

    const imagePromise = fetchWithTimeout(
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
              content: `Generate a professional, visually striking editorial illustration for a news article about: "${safeTopic}". Photorealistic or high-quality digital art, dramatic and eye-catching. No text or watermarks.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      },
      90_000,
    ).catch((err) => {
      console.error("Image fetch threw:", err instanceof Error ? err.message : err);
      return null;
    });

    const [articleResult, imageResponse] = await Promise.all([
      articlePromise,
      imagePromise,
    ]);

    const articleResponse = articleResult.response;

    if (!articleResponse.ok) {
      if (articleResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (articleResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errorText = await articleResponse.text().catch(() => "");
      console.error("AI gateway error:", articleResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: `AI service returned ${articleResponse.status}. Please try again.`,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await articleResponse.json();
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty AI response:", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "AI returned an empty response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let article;
    try {
      article = JSON.parse(content);
    } catch (parseErr) {
      // Try to extract a JSON object substring as a fallback
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          article = JSON.parse(match[0]);
        } catch {
          console.error("JSON parse failed:", parseErr, "Content:", content.slice(0, 500));
          return new Response(
            JSON.stringify({
              error: "AI returned invalid JSON. Please try again.",
            }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      } else {
        console.error("No JSON found in AI response:", content.slice(0, 500));
        return new Response(
          JSON.stringify({ error: "AI returned invalid format. Please try again." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Process image response (best-effort)
    let heroImage: string | null = null;
    try {
      if (imageResponse && imageResponse.ok) {
        const imageData = await imageResponse.json();
        const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imageUrl) heroImage = imageUrl;
      } else if (imageResponse) {
        console.error("Image generation failed:", imageResponse.status);
      }
    } catch (imgErr) {
      console.error("Image processing error:", imgErr);
    }

    if (heroImage) article.heroImage = heroImage;

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
