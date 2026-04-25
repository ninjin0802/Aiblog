import React from 'react';
import { fmtDate } from './shared.jsx';
// Variant B — "Midnight Notebook"
// Deep navy bg, warm coral/amber accents, monospace for metadata,
// serif-feeling monospace for headlines. Inspired by aesthetic #5.
// Card-based, cozier than Variant A.

const VB = {
  bg: "#12132b",
  bgDeep: "#0c0d22",
  card: "#1a1c38",
  cardAlt: "#22244a",
  border: "#2a2d55",
  text: "#ecebff",
  dim: "#9ea0d0",
  faint: "#5b5f94",
  coral: "#ff6b6b",
  amber: "#ffb454",
  lilac: "#c8a6ff",
  mint: "#8fd4a7",
  light: {
    bg: "#f5f3ef",
    bgDeep: "#ebe7de",
    card: "#ffffff",
    cardAlt: "#faf7f0",
    border: "#e0d9c8",
    text: "#1a1a2e",
    dim: "#6a6880",
    faint: "#a8a498",
    coral: "#d83a3a",
    amber: "#b87020",
    lilac: "#6b4a9a",
    mint: "#3d7a55",
  },
};

function useVBPalette(dark) { return dark ? VB : VB.light; }

function VariantB({ dark = true, onPostClick, onToggleDark, onNavigate, activePostId, posts: postsProp, meta }) {
  const P = useVBPalette(dark);
  const posts = postsProp ?? window.BLOG_POSTS;
  const [filter, setFilter] = React.useState("all");

  const filtered = posts.filter((p) => filter === "all" ? true : p.category === filter);
  const [featured, ...rest] = filtered;

  // Calculate dynamic stats
  let wordsJa = 0;
  let wordsEn = 0;
  posts.forEach((p) => {
    wordsJa += (p.title_ja?.length || 0) + (p.excerpt_ja?.length || 0);
    wordsEn += (p.title_en?.split(/\s+/).filter(Boolean).length || 0) + (p.excerpt_en?.split(/\s+/).filter(Boolean).length || 0);
    (p.blocks || []).forEach((b) => {
      if (b.text) {
        wordsJa += b.text.length;
        wordsEn += b.text.split(/\s+/).filter(Boolean).length;
      }
    });
  });

  return (
    <div style={{
      background: P.bg, color: P.text,
      fontFamily: '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace',
      fontSize: 14, lineHeight: 1.6,
      minHeight: "100%", width: "100%",
    }}>
      <style>{`
        @media (max-width: 820px) {
          .vb-header {
            padding: 12px 16px !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            position: relative !important;
            align-items: center !important;
          }
          .vb-header-nav {
            order: 3;
            width: 100%;
            justify-content: flex-start !important;
          }
          .vb-header-links {
            display: none !important;
          }
          .vb-content {
            padding: 20px 16px 100px !important;
          }
          .vb-greeting {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            margin-bottom: 24px !important;
          }
          .vb-greeting-stats {
            display: none !important;
          }
          .vb-h1 {
            font-size: 26px !important;
          }
          .vb-featured-card {
            padding: 20px 16px !important;
            margin-bottom: 24px !important;
          }
          .vb-featured-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .vb-featured-title {
            font-size: 20px !important;
          }
          .vb-ascii {
            display: none !important;
          }
          .vb-post-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .vb-card {
            padding: 16px !important;
          }
        }
      `}</style>
      {/* ── Top bar ── */}
      <header className="vb-header" style={{
        padding: "22px 48px",
        borderBottom: `1px solid ${P.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: P.bgDeep,
        position: "sticky", top: 0, zIndex: 10,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          {/* Moon + planet glyph */}
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="9" fill={P.amber} />
            <circle cx="18" cy="12" r="7" fill={P.bg} />
          </svg>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>
              午前3時のノート
            </div>
            <div style={{ fontSize: 11, color: P.dim, letterSpacing: 1, marginTop: 2 }}>
              MIDNIGHT · NOTEBOOK · EST. 2019
            </div>
          </div>
        </div>

        <nav className="vb-header-nav" style={{ display: "flex", gap: 4, fontSize: 12 }}>
          {[
            { k: "all", l: "all / すべて" },
            { k: "技術", l: "tech / 技術" },
            { k: "日常", l: "diary / 日常" },
          ].map((it) => {
            const active = filter === it.k;
            return (
              <button
                key={it.k}
                onClick={() => setFilter(it.k)}
                style={{
                  fontFamily: "inherit", fontSize: 12,
                  background: active ? P.card : "transparent",
                  color: active ? P.amber : P.dim,
                  border: `1px solid ${active ? P.amber + "55" : "transparent"}`,
                  padding: "6px 14px", borderRadius: 2, cursor: "pointer",
                  letterSpacing: 0.3,
                }}
              >{it.l}</button>
            );
          })}
        </nav>

        <div className="vb-header-links" style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 12, color: P.dim }}>
          <button 
            onClick={() => onNavigate?.("about")}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: "inherit", fontFamily: "inherit", padding: 0 }}
          >about</button>
          <button 
            onClick={() => onNavigate?.("archive")}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: "inherit", fontFamily: "inherit", padding: 0 }}
          >archive</button>
          <a href="/feed.xml" target="_blank" rel="noopener noreferrer"
            style={{ color: P.amber, textDecoration: "none" }}>⚛ rss</a>
          <button
            onClick={onToggleDark}
            style={{
              fontFamily: "inherit", fontSize: 12, cursor: "pointer",
              background: "transparent", color: P.dim,
              border: `1px solid ${P.border}`, padding: "4px 10px", borderRadius: 2,
            }}
          >{dark ? "☾" : "☀"}</button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="vb-content" style={{ maxWidth: 1160, margin: "0 auto", padding: "56px 48px 80px" }}>
        {/* Greeting */}
        <div className="vb-greeting" style={{ marginBottom: 48, display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "end" }}>
          <div>
            {(meta?.avatar || window.BLOG_META?.avatar) && (
              <img src={meta?.avatar || window.BLOG_META?.avatar} alt="avatar" style={{
                width: 56, height: 56, objectFit: "cover",
                border: `1px solid ${P.border}`, marginBottom: 16, display: "block",
              }} />
            )}
            <div style={{ color: P.coral, fontSize: 12, letterSpacing: 2, marginBottom: 14 }}>
              // NOW PLAYING — 2026.04
            </div>
            <h1 className="vb-h1" style={{
              fontSize: 44, margin: 0, lineHeight: 1.15,
              fontWeight: 500, letterSpacing: -0.6,
            }}>
              にんじん's AI Blog
            </h1>
            <div style={{
              fontSize: 15, color: P.dim, marginTop: 16,
              fontStyle: "italic", maxWidth: 560,
            }}>
              {"\n"}
            </div>
          </div>

          <div className="vb-greeting-stats" style={{ textAlign: "right", fontSize: 12, color: P.faint, lineHeight: 1.9 }}>
            <div>◉ {posts.length} posts</div>
            <div>◉ {Math.round((wordsJa + wordsEn) / 1000)}k words</div>
          </div>
        </div>

        {/* Featured post — wide card */}
        {featured && (
          <button
            onClick={() => onPostClick && onPostClick(featured.id)}
            className="vb-featured-card"
            style={{
              display: "block", width: "100%", textAlign: "left",
              background: P.card,
              border: `1px solid ${P.border}`,
              padding: "32px 36px", cursor: "pointer",
              color: P.text, fontFamily: "inherit", fontSize: 14,
              marginBottom: 40,
              position: "relative",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, width: 6, height: "100%",
              background: featured.category === "技術" ? P.lilac : P.coral,
            }} />
            <div className="vb-featured-grid" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 40 }}>
              <div>
                <div style={{
                  fontSize: 11, letterSpacing: 2, color: P.amber,
                  marginBottom: 14,
                }}>
                  ★ FEATURED — {featured.category === "技術" ? "TECH LOG" : "DIARY"}
                </div>
                <div className="vb-featured-title" style={{
                  fontSize: 28, fontWeight: 500, lineHeight: 1.25,
                  letterSpacing: -0.3, marginBottom: 8,
                }}>
                  {featured.title_ja}
                </div>
                <div style={{
                  fontSize: 16, fontStyle: "italic", color: P.dim, marginBottom: 18,
                }}>
                  {featured.title_en}
                </div>
                <div style={{ color: P.text, opacity: 0.85, fontSize: 14, marginBottom: 16 }}>
                  {featured.excerpt_ja}
                </div>
                <div style={{ display: "flex", gap: 20, color: P.faint, fontSize: 12 }}>
                  <span>{fmtDate(featured.date)}</span>
                  <span>·</span>
                  <span>{featured.readTime} min</span>
                  <span>·</span>
                  <span>{featured.comments} replies</span>
                  {featured.views > 0 && <><span>·</span><span>{featured.views.toLocaleString()} views</span></>}
                </div>
              </div>

              {/* ASCII-art placeholder for featured imagery */}
              <div className="vb-ascii" style={{
                background: P.bgDeep, border: `1px solid ${P.border}`,
                padding: 20, fontSize: 10, lineHeight: 1.2,
                color: P.amber, whiteSpace: "pre", fontFamily: "inherit",
                overflow: "hidden",
              }}>
{`  ╭──────────────╮
  │  ◉  ◉    ◦   │
  │              │
  │    ~~~~~     │
  │   (     )    │
  │    '---'     │
  │              │
  │  rust ▨▨▨▨░  │
  ╰──────────────╯
  fig.01 — lifetime`}
              </div>
            </div>
          </button>
        )}

        {/* Section header */}
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          marginBottom: 20, paddingBottom: 12,
          borderBottom: `1px dashed ${P.border}`,
        }}>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.2 }}>
            最近の投稿 <span style={{ color: P.faint, fontSize: 13, fontWeight: 400 }}>/ Recent entries</span>
          </div>
          <div style={{ color: P.dim, fontSize: 12 }}>{rest.length} posts</div>
        </div>

        {/* Grid of rest */}
        <div className="vb-post-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
        }}>
          {rest.map((p) => {
            const isActive = p.id === activePostId;
            const accent = p.category === "技術" ? P.lilac : P.coral;
            return (
              <button
                key={p.id}
                onClick={() => onPostClick && onPostClick(p.id)}
                className="vb-card"
                style={{
                  textAlign: "left", cursor: "pointer",
                  background: isActive ? P.cardAlt : P.card,
                  border: `1px solid ${isActive ? accent + "80" : P.border}`,
                  padding: "22px 24px 20px",
                  fontFamily: "inherit", fontSize: 14,
                  color: P.text, position: "relative",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 11, color: P.faint, letterSpacing: 0.8,
                  marginBottom: 14,
                }}>
                  <span style={{ color: accent }}>
                    {p.category === "技術" ? "⟨ tech ⟩" : "⟨ diary ⟩"}
                  </span>
                  <span>{fmtDate(p.date)}</span>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 500, lineHeight: 1.3,
                  letterSpacing: -0.2, marginBottom: 4,
                }}>
                  {p.title_ja}
                </div>
                <div style={{
                  fontSize: 13, color: P.dim, fontStyle: "italic",
                  marginBottom: 12,
                }}>
                  {p.title_en}
                </div>
                <div style={{ color: P.text, opacity: 0.75, fontSize: 13, marginBottom: 14, lineHeight: 1.55 }}>
                  {p.excerpt_en}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  paddingTop: 12, borderTop: `1px dashed ${P.border}`,
                  fontSize: 11, color: P.faint,
                }}>
                  <span>{p.tags.map((t) => `#${t}`).join(" ")}</span>
                  <span>{p.readTime}m · {p.comments}💬{p.views > 0 ? ` · ${p.views.toLocaleString()}👁` : ""}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VariantB, VB });

export default VariantB;
export { VB };
