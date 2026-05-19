import OpenAI from "openai"; // Even though you are using Groq here, Groq provides an OpenAI-compatible API, so this OpenAI SDK can still be used.
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
// means Use my Groq key and send requests to Groq’s API.
export async function POST(req: Request) {
  try {
    const body = await req.json();// This reads the incoming request body and converts it to JavaScript object form(which is not so different from normal form jsut refines it)

    const completion =
      await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        // chooses which model to use and use the chat-completions endpoint and wait for the model to generate a reply.completion will store the full model response
        messages: [
          {
            role: "system",
            content: "You are a helpful AI tutor.",
          },
          {
            role: "user",
            content: body.message,
          },
        ],
      });

    return NextResponse.json({
      reply: // can be named anything
        completion.choices[0].message.content, // extracts the model’s reply text
        //the API returns a list of possible completions usually the first one is the answer you want thus [0]
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