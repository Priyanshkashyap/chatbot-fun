import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,

  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const completion =
      await client.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [

          // System prompt
          {
            role: "system",
            content:
              "You are a helpful AI tutor.",//  send everytime as llm forgets everything thus sees entire chat at once
          },

          // Entire conversation history
          ...body.messages,

        ],

      });

    return NextResponse.json({
      reply:
        completion.choices[0].message.content,
    });

  } catch (error: any) {

    console.log(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );

  }
}