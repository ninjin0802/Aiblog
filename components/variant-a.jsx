import React from 'react';
import { Caret, Tag, HR, fmtDate, fmtDateLong } from './shared.jsx';
// Variant A — "$HOME/log"
// Terminal / code-editor aesthetic. Dark bg, orange accent, tight rhythm.
// Inspired by aesthetic option #2: black bg, orange block, monospace list.

const VA = {
  bg: "#0b0d10",
  panel: "#12151a",
  panelAlt: "#161a20",
  border: "#1f2530",
  text: "#d7dde3",
  dim: "#7a8390",
  faint: "#4a525c",
  accent: "#f97316",
  accentDim: "#b45309",
  ok: "#7ec584",
  mag: "#c678dd",
  cyan: "#56b6c2",
  light: {
    bg: "#fafaf7",
    panel: "#ffffff",
    panelAlt: "#f3f2ed",
    border: "#e2ddd2",
    text: "#1a1a1a",
    dim: "#6b6b64",
    faint: "#a8a69a",
    accent: "#d2480b",
    accentDim: "#b84a1a",
    ok: "#3a7a3a",
    mag: "#7a3e9a",
    cyan: "#2a6b75",
  },
};

function useVAPalette(dark) {
  return dark ? VA : VA.light;
}

function VariantA({ dark = true, onPostClick, onToggleDark, activePostId, lang = "both", posts: postsProp, meta }) {
  const P = useVAPalette(dark);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all"); // all | 日常 | 技術
  const posts = postsProp ?? window.BLOG_POSTS;

  const filtered = posts.filter((p) => {
    if (filter !== "all" && p.category !== filter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.title_ja.toLowerCase().includes(q) ||
      p.title_en.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="va-container" style={{
      background: P.bg, color: P.text,
      fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
      fontSize: 13, lineHeight: 1.55,
      minHeight: "100%", width: "100%",
      display: "grid", gridTemplateColumns: "260px 1fr",
    }}>
      <style>{`
        @media (max-width: 820px) {
          .va-container {
            grid-template-columns: 1fr !important;
          }
          .va-sidebar {
            position: relative !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid ${P.border} !important;
            padding: 16px !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
            align-items: center !important;
          }
          .va-sidebar-identity {
            flex: 1;
            min-width: 140px;
          }
          .va-sidebar-nav {
            flex-direction: row !important;
            gap: 4px !important;
          }
          .va-sidebar-search {
            width: 100% !important;
            order: 10;
          }
          .va-sidebar-footer {
            display: none !important;
          }
          .va-sidebar-toggle {
            margin-left: auto;
          }
          .va-main {
            padding: 20px 16px 100px !important;
          }
          .va-list-header, .va-list-item {
            grid-template-columns: 80px 1fr !important;
            gap: 8px !important;
          }
          .va-hide-mobile {
            display: none !important;
          }
        }
      `}</style>
      {/* ── Left rail: identity + nav ── */}
      <aside className="va-sidebar" style={{
        borderRight: `1px solid ${P.border}`,
        padding: "28px 22px",
        display: "flex", flexDirection: "column", gap: 24,
        position: "sticky", top: 0, height: "100vh",
        overflow: "auto",
      }}>
        <div className="va-sidebar-identity">
          {(meta?.avatar || window.BLOG_META?.avatar) && (
            <img src={meta?.avatar || window.BLOG_META?.avatar} alt="avatar" style={{
              width: 48, height: 48, objectFit: "cover",
              border: `1px solid ${P.border}`, marginBottom: 10, display: "block",
            }} />
          )}
          <div style={{ color: P.accent, fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
            ~/akira
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>
            $HOME/log<Caret color={P.accent} />
          </div>
        </div>

        {/* nav */}
        <nav className="va-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
          {[
            { k: "all", label_en: "all posts", label_ja: "すべて", n: posts.length },
            { k: "技術", label_en: "tech", label_ja: "技術", n: posts.filter(p => p.category === "技術").length },
            { k: "日常", label_en: "diary", label_ja: "日常", n: posts.filter(p => p.category === "日常").length },
          ].map((it) => {
            const active = filter === it.k;
            return (
              <button
                key={it.k}
                onClick={() => setFilter(it.k)}
                style={{
                  textAlign: "left", fontFamily: "inherit", fontSize: 12,
                  background: active ? P.panelAlt : "transparent",
                  color: active ? P.text : P.dim,
                  border: "none", padding: "6px 10px", borderRadius: 2,
                  display: "flex", justifyContent: "space-between", cursor: "pointer",
                  borderLeft: `2px solid ${active ? P.accent : "transparent"}`,
                }}
              >
                <span>
                  <span style={{ color: active ? P.accent : P.faint, marginRight: 8 }}>
                    {active ? "▸" : " "}
                  </span>
                  {it.label_en} <span style={{ color: P.faint }}>/ {it.label_ja}</span>
                </span>
                <span style={{ color: P.faint }}>{String(it.n).padStart(2, "0")}</span>
              </button>
            );
          })}
        </nav>

        {/* search */}
        <div className="va-sidebar-search">
          <div style={{ color: P.faint, fontSize: 11, marginBottom: 6 }}>/* search */</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            border: `1px solid ${P.border}`, padding: "6px 10px",
            background: P.panel,
          }}>
            <span style={{ color: P.accent }}>/</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="grep posts..."
              style={{
                background: "transparent", border: "none", outline: "none",
                color: P.text, fontFamily: "inherit", fontSize: 12,
                flex: 1, minWidth: 0, padding: 0,
              }}
            />
            <span style={{ color: P.faint, fontSize: 10 }}>⌘K</span>
          </div>
        </div>

        {/* meta links removed */}

        <div style={{ flex: 1 }} />

        {/* dark toggle */}
        <button
          className="va-sidebar-toggle"
          onClick={onToggleDark}
          style={{
            fontFamily: "inherit", fontSize: 11, textAlign: "left",
            background: "transparent", color: P.dim,
            border: `1px dashed ${P.border}`, padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          [ {dark ? "●○" : "○●"} ] theme: {dark ? "dark" : "light"}
        </button>

        <div className="va-sidebar-footer" style={{ color: P.faint, fontSize: 10, lineHeight: 1.8 }}>
          <div>{posts.length} posts</div>
          <div>EST. {window.BLOG_META?.joined ?? "—"} · {window.BLOG_META?.location ?? "—"}</div>
        </div>
      </aside>

      {/* ── Main column: post list ── */}
      <main className="va-main" style={{ padding: "28px 36px 80px", maxWidth: 920 }}>
        {/* breadcrumb / header */}
        <div style={{ color: P.dim, fontSize: 12, marginBottom: 20 }}>
          <span style={{ color: P.accent }}>$</span> ls -lah ./posts/
          {filter !== "all" && <span> | grep {filter}</span>}
          {query && <span> | grep "{query}"</span>}
        </div>

        {/* column header — mimics `ls -l` */}
        <div className="va-list-header" style={{
          display: "grid",
          gridTemplateColumns: "88px 70px 1fr 120px 52px",
          gap: 16, color: P.faint, fontSize: 11,
          padding: "8px 12px",
          borderBottom: `1px solid ${P.border}`,
        }}>
          <span>date</span>
          <span className="va-hide-mobile">kind</span>
          <span>title</span>
          <span className="va-hide-mobile">tags</span>
          <span className="va-hide-mobile" style={{ textAlign: "right" }}>read</span>
        </div>

        {/* list */}
        <div>
          {filtered.map((p, i) => {
            const isActive = p.id === activePostId;
            return (
              <button
                key={p.id}
                onClick={() => onPostClick && onPostClick(p.id)}
                className="va-list-item"
                style={{
                  display: "grid", width: "100%",
                  gridTemplateColumns: "88px 70px 1fr 120px 52px",
                  gap: 16, padding: "14px 12px",
                  background: isActive ? P.panelAlt : "transparent",
                  border: "none", borderBottom: `1px solid ${P.border}`,
                  color: P.text, textAlign: "left", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13,
                  alignItems: "start",
                  borderLeft: `2px solid ${isActive ? P.accent : "transparent"}`,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = P.panel; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ color: P.dim, fontSize: 12, paddingTop: 2 }}>{fmtDate(p.date)}</span>
                <span className="va-hide-mobile" style={{
                  fontSize: 11, padding: "2px 6px",
                  color: p.category === "技術" ? P.cyan : P.accent,
                  border: `1px solid ${(p.category === "技術" ? P.cyan : P.accent) + "44"}`,
                  justifySelf: "start", alignSelf: "start",
                  marginTop: 2,
                }}>
                  {p.category === "技術" ? "tech" : "diary"}
                </span>
                <span>
                  <div style={{ color: P.text, lineHeight: 1.4 }}>
                    {p.title_ja}
                  </div>
                  <div style={{ color: P.dim, fontSize: 12, fontStyle: "italic", marginTop: 2 }}>
                    {p.title_en}
                  </div>
                </span>
                <span className="va-hide-mobile" style={{ color: P.faint, fontSize: 11, paddingTop: 2 }}>
                  {p.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}
                </span>
                <span className="va-hide-mobile" style={{ color: P.dim, textAlign: "right", fontSize: 12, paddingTop: 2 }}>
                  {p.readTime}m{p.views > 0 ? ` · ${p.views.toLocaleString()}👁` : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* footer prompt */}
        <div style={{ marginTop: 28, color: P.dim, fontSize: 12 }}>
          <span style={{ color: P.accent }}>$</span> _ <Caret color={P.accent} />
          <span style={{ marginLeft: 14, color: P.faint }}>
            // {filtered.length} / {posts.length} posts shown
          </span>
        </div>
      </main>

      <style>{`@keyframes caretBlink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

Object.assign(window, { VariantA, VA });
export { VA };
export default VariantA;
