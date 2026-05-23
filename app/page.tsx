"use client";

import { useState } from "react";

export default function Home() {

  // Current textarea input
  const [input, setInput] = useState("");

  // Custom chatbot personality
  const [systemPrompt, setSystemPrompt] =
    useState("You are a helpful AI tutor.");

  // Chat history
  const [messages, setMessages] = useState<
    {
      role: string;
      content: string;
    }[]
  >([]);

  // Creativity
  const [temperature, setTemperature] =
    useState(0.7);

  const [loading, setLoading] =
    useState(false);

  async function sendMessage() {

    if (!input.trim()) return; // checks for whitespace input too

    setLoading(true);

    // User message
    const userMessage = {
      role: "user",
      content: input,
    };

    // Add user message instantly
    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    // Clear textarea
    setInput("");

    const response = await fetch("/api/chat", { //Axios does not support streaming responses in the browser as cleanly as fetch.
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messages: [
        ...messages,
        userMessage,
                  ],
        systemPrompt,
        temperature,
}),
    });

    const reader =
      response.body?.getReader(); // so return from Response gets received by frontend as response.body..getReader() gives you a tool to manually read chunks from that stream.

    if (!reader) {
      setLoading(false);
      return;
    }

    const decoder = new TextDecoder();//decode the bytes sent here

    let streamedText = "";// This stores the FULL assistant response progressively.

    // Empty assistant message placeholder
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant", // kuch bhi reply se pehle assistant ka naam ayega na bas bina message ke
        content: "",
      },
    ]);

    while (true) {

      const { done, value } =
        await reader.read(); // till we are reading the stream done is false and theres a value. when everything is read , done is true and value becomes undefined

      if (done) break;

      const chunkValue =
        decoder.decode(value); // decodes

      streamedText += chunkValue;// string joining

      // Update latest assistant message
      setMessages((prev) => {

        const updated = [...prev]; // React state must be immutable.Instead create a new array.

        updated[updated.length - 1] = {
          role: "assistant",
          content: streamedText, // thus dhire dhire streamed text gets added to the last index of 
        };

        return updated;
      });
    }

    setLoading(false);
  }

  return (

    <div className="p-10 max-w-2xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        AI Chatbot
      </h1>

      {/* System Prompt */}
      <input
        className="border p-3 w-full mb-4"
        value={systemPrompt}
        onChange={(e) =>
          setSystemPrompt(e.target.value)
        }
      />

      {/* User Input */}
      <textarea
        className="border p-3 w-full"
        rows={5}
        value={input}
        onChange={(e) =>
          setInput(e.target.value)
        }
      />

      {/* Temperature */}
      <div className="mt-4">

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) =>
            setTemperature(
              Number(e.target.value)
            )
          }
        />

        <p>
          Temperature: {temperature}
        </p>

      </div>

      {/* Send Button */}
      <button
        onClick={sendMessage}
        disabled={loading}
        className="bg-black text-white px-4 py-2 mt-4 disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {/* Chat Messages */}
      <div className="mt-8 space-y-4">

        {messages.map((msg, index) => (

          <div
            key={index}
            className={`border p-4 rounded `}
          >

            <p className="font-bold mb-2">
              {msg.role}
            </p>

            <p className="whitespace-pre-wrap">
              {msg.content}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}