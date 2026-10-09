"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function ApiTest({ path }: { path: string }) {
  const { getToken } = useAuth();
  const [result, setResult] = useState("");

  async function callApi() {
    setResult("Calling...");
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(`${res.status}: ${JSON.stringify(await res.json(), null, 2)}`);
    } catch {
      setResult("Request failed. Is the server running?");
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={callApi}
        className="rounded-lg bg-black px-4 py-2 text-sm text-white"
      >
        Test API: {path}
      </button>
      {result && (
        <pre className="mt-3 rounded-lg bg-gray-100 p-3 text-xs">{result}</pre>
      )}
    </div>
  );
}