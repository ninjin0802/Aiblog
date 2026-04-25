import React from 'react';
// About + Archive pages. Receive palette, render consistently across variants.

function AboutPage({ palette: P, onBack, posts = [], meta }) {
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
  const M = { ...(window.BLOG_META ?? {}), ...(meta ?? {}), stats: window.BLOG_META?.stats ?? { posts: 0, words_ja: 0, words_en: 0, subscribers: 0 } };

  // Calculate dynamic stats
  const postsCount = posts.length;
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

  const stats = [
    { label: "posts", value: postsCount },
    { label: "words (ja)", value: wordsJa.toLocaleString() },
    { label: "words (en)", value: wordsEn.toLocaleString() },
    { label: "readers", value: M.stats.subscribers.toLocaleString() },
  ];

  return (
    <div style={{
      background: P.bg, color: P.text,
      fontFamily: mono, fontSize: 14, lineHeight: 1.7,
      minHeight: "100%", width: "100%",
    }}>
      <div style={{
        borderBottom: `1px solid ${P.border || P.rule}`,
        padding: "16px 36px", fontSize: 12, color: P.dim,
        background: P.bgDeep || P.bgAlt || P.bg,
      }}>
        <button onClick={onBack} style={{
          background: "transparent", border: "none",
          color: P.accent || P.coral || "#ff5a5f",
          fontFamily: mono, fontSize: 12, cursor: "pointer", padding: 0,
        }}>← cd ..</button>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "56px 36px 80px" }}>
        <div style={{ fontSize: 11, color: P.faint, letterSpacing: 1.5, marginBottom: 14 }}>
          / ABOUT / PROFILE
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 600, margin: "0 0 8px", letterSpacing: -0.8 }}>
          {M.author_ja}
        </h1>
        <div style={{ fontSize: 20, fontStyle: "italic", color: P.dim, marginBottom: 32 }}>
          — {M.author_en} · {M.handle}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "120px 1fr",
          gap: 32, marginBottom: 32,
        }}>
          {M.avatar
            ? <img src={M.avatar} alt="avatar" style={{ width: 120, height: 120, objectFit: "cover", border: `1px solid ${P.border || P.rule}` }} />
            : <div style={{
                width: 120, height: 120,
                background: P.accent || P.coral || "#ff5a5f",
                color: P.bg, display: "grid", placeItems: "center",
                fontSize: 48, fontWeight: 700,
              }}>{M.author_ja?.[0]?.toUpperCase() || "N"}</div>
          }
          <div>
            <p style={{ margin: "0 0 14px" }}>{M.bio_ja}</p>
            <p style={{ margin: 0, color: P.dim, fontStyle: "italic" }}>{M.bio_en}</p>
          </div>
        </div>

        <div style={{
          borderTop: `1px solid ${P.border || P.rule}`,
          borderBottom: `1px solid ${P.border || P.rule}`,
          padding: "20px 0", margin: "32px 0",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20,
        }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: P.faint, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 14px" }}>## whoami</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {M.whoami_ja || "私はしがないサラリーマン。このブログは、AIでバイブコーディングして作ったアプリなど日常の日記を書き綴る日本語と英語の両方で残しておく場所。"}
        </p>
        <p style={{ color: P.dim, fontStyle: "italic", whiteSpace: "pre-wrap" }}>
          {M.whoami_en || "An ordinary salaryman. This blog is a bilingual log, in Japanese and English, of daily life and the apps I vibe-code with AI."}
        </p>
      </div>
    </div>
  );
}

function ArchivePage({ palette: P, onBack, onPostClick, posts: postsProp }) {
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
  const posts = postsProp ?? window.BLOG_POSTS;

  // Collect all tags
  const tagCount = {};
  posts.forEach((p) => p.tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  const tags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);

  // Group by year-month
  const byMonth = {};
  posts.forEach((p) => {
    const key = p.date.slice(0, 7);
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(p);
  });
  const months = Object.keys(byMonth).sort().reverse();

  const [selectedTag, setSelectedTag] = React.useState(null);

  const visible = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts;

  return (
    <div style={{
      background: P.bg, color: P.text,
      fontFamily: mono, fontSize: 14, lineHeight: 1.7,
      minHeight: "100%", width: "100%",
    }}>
      <div style={{
        borderBottom: `1px solid ${P.border || P.rule}`,
        padding: "16px 36px", fontSize: 12, color: P.dim,
        background: P.bgDeep || P.bgAlt || P.bg,
      }}>
        <button onClick={onBack} style={{
          background: "transparent", border: "none",
          color: P.accent || P.coral || "#ff5a5f",
          fontFamily: mono, fontSize: 12, cursor: "pointer", padding: 0,
        }}>← cd ..</button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 36px 80px" }}>
        <div style={{ fontSize: 11, color: P.faint, letterSpacing: 1.5, marginBottom: 14 }}>
          / ARCHIVE / TAGS
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 600, margin: "0 0 8px", letterSpacing: -0.6 }}>
          アーカイブ
        </h1>
        <div style={{ fontSize: 15, color: P.dim, fontStyle: "italic", marginBottom: 32 }}>
          — All entries, by month & tag
        </div>

        {/* Tags */}
        <div style={{
          padding: "16px 20px", background: P.bgAlt || P.card || P.cardAlt,
          border: `1px solid ${P.border || P.rule}`, marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, color: P.faint, letterSpacing: 1, marginBottom: 10 }}>
            TAGS ({tags.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selectedTag && (
              <button onClick={() => setSelectedTag(null)} style={{
                background: P.accent || P.coral || "#ff5a5f",
                color: P.bg, border: "none",
                fontFamily: mono, fontSize: 12,
                padding: "4px 10px", cursor: "pointer",
              }}>× clear</button>
            )}
            {tags.map(([t, n]) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t === selectedTag ? null : t)}
                style={{
                  background: t === selectedTag ? (P.accent || P.coral || "#ff5a5f") : "transparent",
                  color: t === selectedTag ? P.bg : P.text,
                  border: `1px solid ${P.border || P.rule}`,
                  fontFamily: mono,
                  padding: "4px 10px", cursor: "pointer",
                  fontSize: 12 + Math.min(4, n - 1),
                }}
              >
                #{t} <span style={{ opacity: 0.5 }}>{n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Entries by month */}
        {months.map((m) => {
          const ps = byMonth[m].filter((p) => !selectedTag || p.tags.includes(selectedTag));
          if (ps.length === 0) return null;
          const [y, mm] = m.split("-");
          return (
            <div key={m} style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex", alignItems: "baseline", gap: 12,
                paddingBottom: 8, marginBottom: 12,
                borderBottom: `1px dashed ${P.border || P.rule}`,
              }}>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>
                  {y}.{mm}
                </div>
                <div style={{ color: P.faint, fontSize: 12 }}>
                  {ps.length} {ps.length === 1 ? "entry" : "entries"}
                </div>
              </div>
              {ps.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPostClick && onPostClick(p.id)}
                  style={{
                    display: "grid", gridTemplateColumns: "60px 70px 1fr 50px",
                    gap: 16, width: "100%",
                    padding: "10px 8px", background: "transparent",
                    border: "none", textAlign: "left", cursor: "pointer",
                    color: P.text, fontFamily: mono, fontSize: 13,
                    alignItems: "center",
                    borderBottom: `1px solid ${P.border || P.rule}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = P.bgAlt || P.card || P.cardAlt; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ color: P.faint }}>{p.date.slice(8)}</span>
                  <span style={{
                    fontSize: 10, padding: "2px 6px",
                    color: p.category === "技術" ? (P.accentAlt || P.cyan || P.lilac || "#8fd4a7") : (P.accent || P.coral || "#ff5a5f"),
                    border: `1px solid ${(p.category === "技術" ? (P.accentAlt || P.cyan || P.lilac || "#8fd4a7") : (P.accent || P.coral || "#ff5a5f")) + "55"}`,
                    justifySelf: "start",
                  }}>
                    {p.category === "技術" ? "tech" : "diary"}
                  </span>
                  <span>
                    <div>{p.title_ja}</div>
                    <div style={{ color: P.dim, fontSize: 11, fontStyle: "italic" }}>{p.title_en}</div>
                  </span>
                  <span style={{ color: P.faint, textAlign: "right", fontSize: 11 }}>
                    {p.readTime}m
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { AboutPage, ArchivePage });

export { AboutPage, ArchivePage };
