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
    const { topic, examMode, examType } = await req.json();

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

    const systemPrompt = `You are an expert current affairs article writer for Indian blogs and exam preparation websites. Generate comprehensive, SEO-optimized articles.

Return a valid JSON object with this exact structure:
{
  "seoTitle": "SEO-optimized title (60 chars max)",
  "metaDescription": "SEO meta description (160 chars max)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "introduction": "2-3 paragraph introduction",
  "background": "2-3 paragraph historical/contextual background",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5", "point 6"],
  "analysis": "3-4 paragraph detailed analysis",
  "conclusion": "2 paragraph conclusion"${examMode ? `,
  "examSection": {
    "type": "${examType || "UPSC"}",
    "facts": ["fact1", "fact2", "fact3", "fact4", "fact5"],
    "keyData": ["data1", "data2", "data3", "data4", "data5"],
    "questions": ["q1", "q2", "q3", "q4", "q5"]
  }` : ""}
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code fences, no explanation.`;

    const response = await fetch(
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

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Clean potential markdown code fences
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const article = JSON.parse(content);

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
