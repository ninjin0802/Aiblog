import React from 'react';
// Shared utilities, tokens, and small components used across blog variants.

const fmtDate = (iso) => {
  if (!iso) return "....-..-..";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "....-..-..";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${m}.${day}`;
};

const fmtDateLong = (iso, lang = "en") => {
  const d = new Date(iso);
  if (lang === "ja") {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// Tiny character-cell ASCII/pixel dividers + chrome used across variants.
function HR({ color = "currentColor", dash = "─", cols = 60, style = {} }) {
  return (
    <div style={{ color, opacity: 0.3, overflow: "hidden", whiteSpace: "nowrap", ...style }}>
      {dash.repeat(cols)}
    </div>
  );
}

// Terminal-style caret
function Caret({ color = "currentColor" }) {
  return (
    <span style={{
      display: "inline-block", width: "0.55em", height: "1em",
      background: color, verticalAlign: "text-bottom",
      animation: "caretBlink 1.1s steps(2) infinite",
    }} />
  );
}

// Small tag chip
function Tag({ children, onClick, color = "currentColor", style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "inherit", fontSize: "0.75em",
        color, background: "transparent",
        border: `1px solid ${color}33`,
        padding: "2px 8px", borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        letterSpacing: 0.2,
        ...style,
      }}
    >#{children}</button>
  );
}

Object.assign(window, { fmtDate, fmtDateLong, HR, Caret, Tag });
export { fmtDate, fmtDateLong, HR, Caret, Tag };
