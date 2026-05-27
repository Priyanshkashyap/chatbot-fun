import OpenAI from "openai";
import { promptt } from "@/app/prompt";
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL:
    "https://api.groq.com/openai/v1",
});

// WEATHER TOOL
function getWeather(city: string) {

  return `Weather in ${city} is 35°C`;

}

// CALCULATOR TOOL
function calculator(
  expression: string
) {

  return eval(expression);

}

// TOOL REGISTRY
const tools = {
  calculator,
  weather: getWeather,
};

export async function POST(
  req: Request
) {

  try {

    const body = await req.json();

    // ONLY KEEP LAST 10 MESSAGES
    const recentMessages =
      body.messages
        .slice(-10)
        .map((msg: any) => ({

          ...msg,

          // LLMs only accept strings
          content:
            typeof msg.content ===
            "string"
              ? msg.content
              : JSON.stringify(
                  msg.content
                ),

        }));

    // FIRST LLM CALL
    const completion =
      await client.chat.completions.create({

        model:
          "llama-3.3-70b-versatile",

        messages: [

          {
            role: "system",

            content: promptt,
          },

          ...recentMessages,

        ],

      });

    const rawReply =
      completion.choices[0]
        .message.content;

    // SAFE JSON PARSING
    let parsedReply;

    try {

      parsedReply =
        JSON.parse(
          rawReply || "{}"
        );

    } catch {

      return Response.json({
        reply:
          "Invalid JSON from AI",
      });

    }
 
    const toolName =
      parsedReply.tool as keyof typeof tools; // "Trust me TypeScript,this value WILL be one of the valid tool keys."

    // CHECK TOOL EXISTS
    if (!tools[toolName]) {
      // tools is an object
      return Response.json({
        reply:
          "Invalid tool requested",
      });

    }

    // VALIDATE CALCULATOR INPUT
    if (
      toolName ===
        "calculator" &&
      typeof parsedReply.input !==
        "string"
    ) {

      return Response.json({
        reply:
          "Invalid calculator input",
      });

    }

    // VALIDATE WEATHER INPUT
    if (
      toolName === "weather" &&
      typeof parsedReply.city !==
        "string"
    ) {

      return Response.json({
        reply:
          "Invalid weather input",
      });

    }

    const selectedTool =
      tools[toolName];

    let result;

    // TOOL EXECUTION
    try {

      if (
        toolName ===
        "calculator"
      ) {

        result = String(
          selectedTool(
            parsedReply.input
          )
        );

      }

      if (
        toolName === "weather"
      ) {

        result = selectedTool(
          parsedReply.city
        );

      }

    } catch {

      return Response.json({
        reply:
          "Tool execution failed",
      });

    }

    // SECOND LLM CALL
    // AI sees tool result and responds naturally
    const finalCompletion =
      await client.chat.completions.create({

        model:
          "llama-3.3-70b-versatile",

        messages: [

          {
            role: "system",

            content:
              "You are a helpful AI assistant.",
          },

          ...recentMessages,

          {
            role: "assistant",

            content:
              JSON.stringify(
                parsedReply
              ),
          },

          {
            role: "user",

            content:
              `Tool result: ${result}`,
          },

        ],

      });

    const finalReply =
      finalCompletion
        .choices[0]
        .message.content;

    return Response.json({
      reply: finalReply,
    });

  } catch (error: any) {

    console.log(error);

    return Response.json(
      {
        error: error.message,
      },
      { status: 500 }
    );

  }

}
