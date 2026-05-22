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
              `
          You are a support ticket classifier.

          ONLY respond in valid JSON.

          Response format:

         {
          "category": "billing | refund | technical | general",
          "priority": "low | medium | high"
         }
         `,
          },

         
          {
    role: "user",

    content:
      body.messages.at(-1)?.content, // only the latest message
  },
  

        ],
        temperature: body.temperature,
      });
     const rawReply = completion.choices[0].message.content;
     const parsedReply = JSON.parse(rawReply || "{}"); // we wanna make into json format
    return NextResponse.json({
      reply:
        parsedReply,
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

/* Few-shot prompting teaches the model:

format
behavior
style
structure
expectations

without training a model. */