import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {

  const body = await req.json(); // sidha reads and converts body only

  const completion = await client.chat.completions.create({ // sending to groq servers
    model: "llama-3.3-70b-versatile",

      messages: [

        {
          role: "system",
          content: body.systemPrompt,
        },

        ...body.messages,
      ],

    stream: true,
  });

  const encoder = new TextEncoder();// ReadableStream can only send: binary data,bytes,Uint8Array,NOT normal JavaScript strings.So TextEncoder converts:string into bytes

  const stream = new ReadableStream({// You are creating a live data stream i.e. a server pipe where data can be pushed continuously.
    async start(controller) { // start() runs immediately when the frontend connects to this stream.The controller is used to control the stream.

      for await (const chunk of completion) {// completion is an async iterable stream coming from Groq/OpenAI.for await waits for each chunk automatically.

        const text =
          chunk.choices[0]?.delta?.content || ""; // extracts from each chunk.?. prevents crashes as Sometimes chunks contain metadata instead of text.Why || "" as Sometimes content is undefined.

        controller.enqueue( // push data into stream and thus frontend continously 
          encoder.encode(text) // encodes from string to bytes for eg
        );
      }

      controller.close();// end stream
    },
  });

  return new Response(stream); // sending streams over time and not entire json object at once so dont use nextResponse
}