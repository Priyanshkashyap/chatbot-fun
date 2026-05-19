"use client";

import axios from "axios";
import { useState } from "react";

export default function Home() {

  // Current textarea input
  const [input, setInput] = useState("");

  // Chat history
  const [messages, setMessages] = useState<
    {
      role: string;
      content: string;
    }[]
  >([]);

  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    try {

      setLoading(true);

      // Current user message
      const userMessage = {
        role: "user",
        content: input,
      };

      // Add user message immediately to UI
      setMessages((prev) => [
        ...prev,
        userMessage,
      ]);

      // Send full conversation to backend
      const response = await axios.post(
        "/api/chat",
        {
          messages: [
            ...messages,
            userMessage,  // UI state variable and api call me its not synced so we change the variable separately
          ],
        }
      );

      // Assistant reply
      const assistantMessage = {
        role: "assistant",
        content: response.data.reply,
      };

      // Add assistant message to UI
      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

      // Clear textarea
      setInput("");

    } catch (error) {

      console.error(
        "Error sending message:",
        error
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="p-10 max-w-xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        AI Chatbot
      </h1>

      {/* Input */}
      <textarea
        className="border p-3 w-full"
        rows={5}
        value={input}
        onChange={(e) =>
          setInput(e.target.value)
        }
      />

      {/* Send button */}
      <button
        onClick={sendMessage}
        className="bg-black text-white px-4 py-2 mt-4"
      >
        Send
      </button>

      {/* Messages */}
      <div className="mt-8 space-y-4">

        {messages.map((msg, index) => (

          <div
            key={index}
            className="border p-4 rounded"
          >

            <p className="font-bold mb-2">
              {msg.role}
            </p>

            <p>{msg.content}</p>

          </div>

        ))}

        {loading && (
          <p>Thinking...</p>
        )}

      </div>

    </div>
  );
}