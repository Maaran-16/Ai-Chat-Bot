import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { products } from "@/data/products";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { message } = await req.json();

  const prompt = `
You are an AI shopping assistant.

User Query: ${message}

Available Products:
${JSON.stringify(products)}

Instructions:
- Suggest relevant products
- Keep answer short
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to get a response from Gemini.";
    console.error("Gemini API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}