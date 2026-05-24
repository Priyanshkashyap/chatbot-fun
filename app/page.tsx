"use client";

import { useState } from "react";
import axios from "axios";
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

  try {

    setLoading(true);

    const userMessage = {
      role: "user",
      content: input,
    };

    // Add user message
    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    // Send request
    const response =
      await axios.post(
        "/api/chat",
        {
          messages: [
            ...messages,
            userMessage,
          ],
        }
      );

    // Assistant reply
    const assistantMessage = {
      role: "assistant",
      content: response.data.reply,
    };

    // Add assistant reply
    setMessages((prev) => [
      ...prev,
      assistantMessage,
    ]);

    setInput("");

  } catch (error) {

    console.log(error);

  } finally {

    setLoading(false);

  }
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