import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a senior construction and manufacturing estimator. You will be given a PDF blueprint, schematic, or RFP document. Your job is to extract EVERY actionable specification, material, dimension, quantity, and special note. Output ONLY a valid Markdown table with the following columns: | Item # | Description / Material | Dimensions / Size | Quantity | Special Notes |. If the document is blank or not a blueprint, output exactly: 'Error: Could not extract valid specifications from this document.' Do not include any conversational text before or after the table.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pdfBase64 } = body;

    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      return NextResponse.json(
        { error: "No PDF data provided. Please upload a valid PDF file." },
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
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              type: "text",
              text: "Please extract all specifications from this document into the table format described in your instructions.",
            },
          ],
        },
      ],
    });

    // Extract the text content from the response
    const textBlock = message.content.find((block) => block.type === "text");
    const resultText = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({ result: resultText });
  } catch (error: unknown) {
    console.error("Error processing PDF:", error);

    let errorMessage = "An unexpected error occurred while processing the PDF.";
    if (error instanceof Error) {
      if (error.message.includes("api_key") || error.message.includes("authentication")) {
        errorMessage = "Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY in .env.local.";
      } else if (error.message.includes("rate_limit") || error.message.includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (error.message.includes("overloaded") || error.message.includes("529")) {
        errorMessage = "The AI service is currently overloaded. Please try again in a few moments.";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
