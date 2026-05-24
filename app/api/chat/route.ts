import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL:
    "https://api.groq.com/openai/v1",
});
function getWeather(city: string) {

  return `Weather in ${city} is 35°C`;

}
function calculator(
  expression: string
) {

  return eval(expression); // takes string and returns output as math

}

export async function POST(
  req: Request
) {

  const body = await req.json();

  const completion =
    await client.chat.completions.create({ // llms should receieve messages in string only

      model:
        "llama-3.3-70b-versatile",

      messages: [

        {
          role: "system",

          content: `
You are an AI assistant.

Available tools:

1. calculator
- use for math calculations

Format:
{
  "tool": "calculator",
  "input": "25 * 16"
}

2. weather
- use for weather questions

Format:
{
  "tool": "weather",
  "city": "Delhi"
}

ONLY respond in valid JSON.
`,
        },

        ...body.messages,

      ],

    });

  const rawReply =
    completion.choices[0].message.content;

  const parsedReply =
    JSON.parse(rawReply || "{}");

  if (
    parsedReply.tool ===
    "calculator"
  ) {

  const result = String(
  calculator(parsedReply.input)
);

    return Response.json({
      reply: result,
    });

  }
if (
    parsedReply.tool ===
    "weather"
  ) {

    const result = getWeather(
      parsedReply.city
    );

    return Response.json({
      reply: result,
    });

  }
  return Response.json({
    reply: rawReply, 
  });

}
// u should have checks for every single possible thing whether it is the intended data type or not no matter how trustworthy it seems
//Build A Real Agent Loop by sending the parsed replies again to ai and generate another answer sentence from it (can make a long chain of llm api calls too using different tools)