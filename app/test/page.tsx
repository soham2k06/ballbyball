"use client";

import { useState } from "react";

// TODO: Remove this page

function TestPage() {
  const [name, setName] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Test cases</h1>
      <input
        type="text"
        placeholder="Enter..."
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={() => setIsDarkMode(!isDarkMode)}>Update Mode</button>
      <p>Mode: {isDarkMode ? "dark" : "light"}</p>
    </div>
  );
}

export default TestPage;
