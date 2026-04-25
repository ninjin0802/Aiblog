import React from 'react';
import { Tag, fmtDate } from './shared.jsx';
// Variant C — "static.md"
// Brutalist / docs-style: split pane, file-tree on left, rendered markdown on right.
// Monospace throughout. Dense. Feels like reading source files.
// The "reading code" aesthetic, not the "personal blog" aesthetic.

const VC = {
  bg: "#f7f5f0",
  bgAlt: "#efece4",
  sidebar: "#1c1c1c",
  sidebarAlt: "#262626",
  sidebarText: "#d8d2c5",
  sidebarDim: "#7a7368",
  sidebarFaint: "#4a443b",
  text: "#1c1c1c",
  dim: "#5a544a",
  faint: "#a39e92",
  rule: "#d5cfbf",
  accent: "#c1272d",
  accentAlt: "#1f5f2a",
  highlight: "#fff1a8",
  dark: {
    bg: "#181716",
    bgAlt: "#121110",
    sidebar: "#0a0908",
    sidebarAlt: "#141312",
    sidebarText: "#c9c3b6",
    sidebarDim: "#6a6458",
    sidebarFaint: "#3d382e",
    text: "#e4dfd3",
    dim: "#9a9488",
    faint: "#5a544a",
    rule: "#2a2824",
    accent: "#ff5a5f",
    accentAlt: "#7ec584",
    highlight: "#3a3620",
  },
};

function useVCPalette(dark) { return dark ? VC.dark : VC; }

function VariantC({ dark = false, onPostClick, onToggleDark, activePostId, posts: postsProp, meta }) {
  const P = useVCPalette(dark);
  const posts = postsProp ?? window.BLOG_POSTS;
  const [openFolders, setOpenFolders] = React.useState({ tech: true, diary: true, meta: false });
  const [mobileFilter, setMobileFilter] = React.useState("all");

  // Group posts by category for the file tree
  const tech = posts.filter((p) => p.category === "技術");
  const diary = posts.filter((p) => p.category === "日常");

  return (
    <div className="vc-container" style={{
      background: P.bg, color: P.text,
      fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
      fontSize: 13, lineHeight: 1.55,
      minHeight: "100%", width: "100%",
      display: "grid", gridTemplateColumns: "280px 1fr",
    }}>
      <style>{`
        .vc-mobile-bar { display: none; }
        @media (max-width: 820px) {
          .vc-container {
            grid-template-columns: 1fr !important;
          }
          .vc-sidebar {
            display: none !important;
          }
          .vc-mobile-bar {
            display: flex !important;
            gap: 4px;
            padding: 10px 16px;
            background: ${P.sidebar};
            border-bottom: 1px solid ${P.sidebarFaint};
            overflow-x: auto;
            flex-wrap: nowrap;
          }
          .vc-main {
            padding: 20px 16px 100px !important;
          }
          .vc-frontmatter {
            display: none !important;
          }
          .vc-h1 {
            font-size: 22px !important;
            margin-bottom: 4px !important;
          }
        }
      `}</style>
      {/* ── Mobile filter bar (hidden on desktop) ── */}
      <div className="vc-mobile-bar">
        {[
          { k: "all", l: "▣ all" },
          { k: "tech", l: "▣ tech" },
          { k: "diary", l: "▣ diary" },
        ].map((f) => {
          const active = mobileFilter === f.k;
          return (
            <button key={f.k} onClick={() => setMobileFilter(f.k)} style={{
              background: active ? P.sidebarAlt : "transparent",
              color: active ? P.sidebarText : P.sidebarDim,
              border: `1px solid ${active ? P.sidebarFaint : "transparent"}`,
              fontFamily: "inherit", fontSize: 11,
              padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap",
              borderLeft: active ? `2px solid ${P.accent}` : "2px solid transparent",
            }}>{f.l}</button>
          );
        })}
        <button onClick={onToggleDark} style={{
          marginLeft: "auto", background: "transparent", border: "none",
          color: P.sidebarDim, fontFamily: "inherit", fontSize: 11, cursor: "pointer",
          whiteSpace: "nowrap",
        }}>[{dark ? "dark" : "light"}]</button>
      </div>

      {/* ── File-tree sidebar ── */}
      <aside className="vc-sidebar" style={{
        background: P.sidebar, color: P.sidebarText,
        padding: "20px 0", fontSize: 12,
        borderRight: `1px solid ${P.rule}`,
        position: "sticky", top: 0, height: "100vh",
        overflow: "auto",
        display: "flex", flexDirection: "column",
      }}>
        {/* Traffic-light-ish header */}
        <div style={{
          padding: "0 16px 16px",
          borderBottom: `1px solid ${P.sidebarFaint}`,
          marginBottom: 8,
        }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <div style={{ fontSize: 11, color: P.sidebarDim, letterSpacing: 0.5 }}>
            akira.dev — zsh — 80×40
          </div>
        </div>

        <div style={{ padding: "0 16px 8px", color: P.sidebarDim, fontSize: 10, letterSpacing: 1 }}>
          EXPLORER
        </div>

        {/* Tree root */}
        <TreeNode P={P} label="~/blog" depth={0} bold>
          <TreeFolder
            P={P} name="tech" count={tech.length}
            open={openFolders.tech}
            onToggle={() => setOpenFolders((f) => ({ ...f, tech: !f.tech }))}
          >
            {tech.map((p) => (
              <TreeFile
                key={p.id} P={P}
                active={p.id === activePostId}
                onClick={() => onPostClick && onPostClick(p.id)}
                name={`${p.id}.md`}
                hint={p.title_en}
              />
            ))}
          </TreeFolder>
          <TreeFolder
            P={P} name="diary" count={diary.length}
            open={openFolders.diary}
            onToggle={() => setOpenFolders((f) => ({ ...f, diary: !f.diary }))}
          >
            {diary.map((p) => (
              <TreeFile
                key={p.id} P={P}
                active={p.id === activePostId}
                onClick={() => onPostClick && onPostClick(p.id)}
                name={`${p.id}.md`}
                hint={p.title_en}
              />
            ))}
          </TreeFolder>
          <TreeFolder
            P={P} name="meta" count={3}
            open={openFolders.meta}
            onToggle={() => setOpenFolders((f) => ({ ...f, meta: !f.meta }))}
          >
            <TreeFile P={P} name="about.md" />
            <TreeFile P={P} name="colophon.md" />
            <TreeFile P={P} name="feed.xml" onClick={() => window.open('/feed.xml', '_blank')} />
          </TreeFolder>
        </TreeNode>

        <div style={{ flex: 1 }} />

        {/* Status bar */}
        <div style={{
          borderTop: `1px solid ${P.sidebarFaint}`,
          padding: "10px 16px",
          fontSize: 10, color: P.sidebarDim,
          display: "flex", justifyContent: "space-between",
        }}>
          <span>main*</span>
          <button
            onClick={onToggleDark}
            style={{
              background: "transparent", border: "none", color: P.sidebarDim,
              fontFamily: "inherit", fontSize: 10, cursor: "pointer", padding: 0,
            }}
          >[{dark ? "dark" : "light"}]</button>
        </div>
      </aside>

      {/* ── Main: "rendered" markdown feed ── */}
      <main className="vc-main" style={{
        padding: "40px 56px 80px",
        maxWidth: 920,
      }}>
        {/* front-matter */}
        <div className="vc-frontmatter" style={{
          background: P.bgAlt, border: `1px solid ${P.rule}`,
          padding: "14px 20px", marginBottom: 40,
          fontSize: 12, color: P.dim,
        }}>
          {(meta?.avatar || window.BLOG_META?.avatar) && (
            <img src={meta?.avatar || window.BLOG_META?.avatar} alt="avatar" style={{
              width: 48, height: 48, objectFit: "cover",
              border: `1px solid ${P.rule}`, marginBottom: 10, display: "block",
            }} />
          )}
          <div style={{ color: P.faint, marginBottom: 6 }}>---</div>
          <div><span style={{ color: P.accent }}>title</span>: {window.BLOG_META.author_en}'s notebook</div>
          <div><span style={{ color: P.accent }}>author</span>: {window.BLOG_META.author_ja} / {window.BLOG_META.author_en}</div>
          <div><span style={{ color: P.accent }}>tagline</span>: {window.BLOG_META.bio_en}</div>
          <div><span style={{ color: P.accent }}>since</span>: {window.BLOG_META.joined}</div>
          <div><span style={{ color: P.accent }}>lang</span>: [ja, en]</div>
          <div style={{ color: P.faint, marginTop: 6 }}>---</div>
        </div>

        {/* H1 */}
        <h1 className="vc-h1" style={{
          fontSize: 32, fontWeight: 700, margin: "0 0 8px",
          letterSpacing: -0.5, lineHeight: 1.2,
        }}>
          # index.md
        </h1>
        <div style={{ color: P.dim, fontSize: 13, marginBottom: 36 }}>
          最近の記事 · Recent entries · <span style={{ color: P.accent }}>{posts.length} files</span>
        </div>

        {/* Post entries — rendered-markdown feel */}
        {posts.filter((p) => {
          if (mobileFilter === "tech") return p.category === "技術";
          if (mobileFilter === "diary") return p.category === "日常";
          return true;
        }).map((p, i, arr) => (
          <article key={p.id} style={{
            marginBottom: 44,
            paddingBottom: 44,
            borderBottom: i === arr.length - 1 ? "none" : `1px solid ${P.rule}`,
          }}>
            {/* file path breadcrumb */}
            <div style={{ color: P.faint, fontSize: 11, marginBottom: 10 }}>
              ./{p.category === "技術" ? "tech" : "diary"}/{p.id}.md
              <span style={{ marginLeft: 12, color: P.dim }}>
                · {fmtDate(p.date)} · {p.readTime} min read{p.views > 0 ? ` · ${p.views.toLocaleString()} views` : ""}
              </span>
            </div>

            {/* H2 */}
            <h2
              onClick={() => onPostClick && onPostClick(p.id)}
              style={{
                fontSize: 22, fontWeight: 600, margin: "0 0 4px",
                letterSpacing: -0.3, lineHeight: 1.3,
                color: activePostId === p.id ? P.accent : P.text,
                cursor: "pointer",
              }}
            >
              ## {p.title_ja}
            </h2>
            <div style={{
              fontSize: 14, fontStyle: "italic", color: P.dim,
              marginBottom: 14,
            }}>
              <span style={{ color: P.faint }}>en:</span> {p.title_en}
            </div>

            {/* Rendered "blockquote" excerpt */}
            <div style={{
              borderLeft: `3px solid ${p.category === "技術" ? P.accentAlt : P.accent}`,
              paddingLeft: 16, marginBottom: 14,
              color: P.text, fontSize: 14, lineHeight: 1.7,
            }}>
              {p.excerpt_ja}
              <div style={{ color: P.dim, fontSize: 13, marginTop: 6, fontStyle: "italic" }}>
                {p.excerpt_en}
              </div>
            </div>

            {/* Tag + meta line */}
            <div style={{
              display: "flex", gap: 14, alignItems: "center",
              fontSize: 11, color: P.faint, flexWrap: "wrap",
            }}>
              <span style={{
                background: p.category === "技術" ? P.accentAlt + "22" : P.accent + "22",
                color: p.category === "技術" ? P.accentAlt : P.accent,
                padding: "2px 8px", fontWeight: 600, letterSpacing: 0.5,
              }}>
                {p.category === "技術" ? "TECH" : "DIARY"}
              </span>
              <span>
                {p.tags.map((t) => (
                  <span key={t} style={{ marginRight: 8, color: P.dim }}>#{t}</span>
                ))}
              </span>
              <span style={{ marginLeft: "auto", color: P.dim }}>
                [{p.comments} comments]
              </span>
              <button
                onClick={() => onPostClick && onPostClick(p.id)}
                style={{
                  background: "transparent", border: `1px solid ${P.rule}`,
                  color: P.text, fontFamily: "inherit", fontSize: 11,
                  padding: "3px 10px", cursor: "pointer",
                }}
              >
                cat {p.id}.md →
              </button>
            </div>
          </article>
        ))}

        {/* EOF marker */}
        <div style={{
          marginTop: 24, textAlign: "center",
          color: P.faint, fontSize: 11, letterSpacing: 1,
        }}>
          — EOF — <span style={{ color: P.accent }}>■</span>
        </div>
      </main>
    </div>
  );
}

// ── Tree subcomponents ───────────────────────────────────────
function TreeNode({ P, label, children, bold, depth = 0 }) {
  return (
    <div>
      <div style={{
        padding: `4px 16px 4px ${16 + depth * 12}px`,
        color: P.sidebarText,
        fontWeight: bold ? 600 : 400,
        fontSize: 11, letterSpacing: 0.2,
      }}>
        <span style={{ color: P.sidebarDim, marginRight: 6 }}>▾</span>
        {label}
      </div>
      {children}
    </div>
  );
}

function TreeFolder({ P, name, count, open, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", width: "100%",
          padding: "3px 16px 3px 26px", gap: 4,
          background: "transparent", border: "none",
          color: P.sidebarText, fontFamily: "inherit", fontSize: 12,
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ color: P.sidebarDim, width: 10 }}>{open ? "▾" : "▸"}</span>
        <span style={{ color: "#ffb454" }}>▣</span>
        <span>{name}</span>
        <span style={{ marginLeft: "auto", color: P.sidebarFaint, fontSize: 10 }}>{count}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function TreeFile({ P, name, hint, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", width: "100%",
        padding: "3px 16px 3px 44px",
        background: active ? P.sidebarAlt : "transparent",
        borderLeft: `2px solid ${active ? "#ff5a5f" : "transparent"}`,
        border: "none", color: active ? "#ffffff" : P.sidebarDim,
        fontFamily: "inherit", fontSize: 11.5,
        cursor: "pointer", textAlign: "left",
        gap: 0,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = P.sidebarAlt; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span>
        <span style={{ color: "#9ea0d0", marginRight: 6 }}>◈</span>
        {name}
      </span>
      {hint && (
        <span style={{
          fontSize: 10, color: P.sidebarFaint, paddingLeft: 18,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          maxWidth: 220,
        }}>
          {hint}
        </span>
      )}
    </button>
  );
}

Object.assign(window, { VariantC, VC });

export default VariantC;
export { VC };
