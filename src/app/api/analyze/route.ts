import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are a senior compliance auditor and regulatory expert. The user will describe their current infrastructure, tools, and security practices. Your job is to analyze their setup against common compliance frameworks (SOC 2, GDPR, HIPAA, ISO 27001) and identify gaps.

You must respond with ONLY a valid JSON object (no markdown, no code fences, no conversational text) with this exact structure:

{
  "overallScore": <number 0-100>,
  "frameworks": {
    "SOC2": { "score": <number 0-100>, "gaps": [<number>] },
    "GDPR": { "score": <number 0-100>, "gaps": [<number>] },
    "HIPAA": { "score": <number 0-100>, "gaps": [<number>] },
    "ISO27001": { "score": <number 0-100>, "gaps": [<number>] }
  },
  "gaps": [
    {
      "id": "G-001",
      "framework": "SOC2",
      "control": "CC6.1",
      "title": "<short title>",
      "description": "<what's missing, specific to their setup>",
      "severity": "critical|high|medium|low",
      "remediation": "<specific actionable fix steps>",
      "effort": "hours|days|weeks"
    }
  ]
}

Identify at least 5 and at most 15 gaps. Be specific about what's missing based on their described setup. Prioritize by real risk. Make remediation steps concrete and actionable.`;

export async function POST(request: Request) {
  // Strict rate limit for AI endpoints (expensive operations)
  const rateLimit = withRateLimit(request, "ai");
  if (!rateLimit.allowed) return rateLimit.response;

  try {
    // Require authentication for AI analysis
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { description } = body;

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a description of your infrastructure and practices (at least 10 characters)." },
        { status: 400 }
      );
    }

    // Limit input length to prevent token abuse
    if (description.length > 10000) {
      return NextResponse.json(
        { error: "Description is too long. Please limit to 10,000 characters." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json(
        { error: "Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in .env.local." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is my current infrastructure and security setup:\n\n${description}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const resultText = textBlock && textBlock.type === "text" ? textBlock.text : "";

    // Try to parse the JSON response
    let parsed;
    try {
      // Strip any potential markdown code fences
      const cleaned = resultText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({
        error: "The AI returned an invalid response format. Please try again.",
        raw: resultText,
      }, { status: 422 });
    }

    const response = NextResponse.json({ result: parsed });
    rateLimit.headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  } catch (error: unknown) {
    console.error("Error analyzing compliance:", error);

    let errorMessage = "An unexpected error occurred during analysis.";
    if (error instanceof Error) {
      if (error.message.includes("api_key") || error.message.includes("authentication")) {
        errorMessage = "Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY.";
      } else if (error.message.includes("rate_limit") || error.message.includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait and try again.";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
