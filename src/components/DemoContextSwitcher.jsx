"use client";

import { useEffect, useState } from "react";

const defaultContext = {
  country: "uk",
  audience: "individual",
  interest: "retirement",
};

export function DemoContextSwitcher() {
  const [context, setContext] = useState(defaultContext);

  useEffect(() => {
    const saved = localStorage.getItem("demo_context");
    if (saved) {
      setContext(JSON.parse(saved));
    }
  }, []);

  function updateContext(key, value) {
    const next = {
      ...context,
      [key]: value,
    };

    setContext(next);
    localStorage.setItem("demo_context", JSON.stringify(next));

    window.dispatchEvent(
      new CustomEvent("demo_context_changed", {
        detail: next,
      })
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        background: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        fontFamily: "Arial, sans-serif",
        width: "240px",
      }}
    >
      <strong style={{ display: "block", marginBottom: "12px" }}>
        Demo Context
      </strong>

      <label>Country</label>
      <select
        value={context.country}
        onChange={(e) => updateContext("country", e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      >
        <option value="uk">UK</option>
        <option value="france">France</option>
        <option value="spain">Spain</option>
      </select>

      <label>Audience</label>
      <select
        value={context.audience}
        onChange={(e) => updateContext("audience", e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      >
        <option value="individual">Individual</option>
        <option value="institutional">Institutional</option>
        <option value="intermediary">Intermediary</option>
      </select>

      <label>Interest</label>
      <select
        value={context.interest}
        onChange={(e) => updateContext("interest", e.target.value)}
        style={{ width: "100%" }}
      >
        <option value="retirement">Retirement</option>
        <option value="private_assets">Private Assets</option>
        <option value="model_portfolios">Model Portfolios</option>
      </select>
    </div>
  );
}