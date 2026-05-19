"use client";
 import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
 

async function sendMessage() {
  try {
    setLoading(true);
    const response = await axios.post("/api/chat", {
      message,
    });
    setLoading(false);
    setReply(response.data.reply);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        AI Chatbot
      </h1>

      <textarea
        className="border p-3 w-full"
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={sendMessage}
        className="bg-black text-white px-4 py-2 mt-4"
      >
        Send
      </button>

      <div className="mt-8 border p-4 rounded">
         {loading ? (<p>Thinking...</p>) : (
         <p>{reply}</p>
        )}
      </div>
    </div>
  );
}