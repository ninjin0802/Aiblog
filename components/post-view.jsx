import React from 'react';
import { fmtDate, fmtDateLong } from './shared.jsx';
import { api } from '../src/api.js';

function PostView({ post, palette: P, dark, onBack, variant = "a" }) {
  const [lang, setLang] = React.useState("both");
  const [commentDraft, setCommentDraft] = React.useState("");
  const [authorDraft, setAuthorDraft] = React.useState("");
  const [comments, setComments] = React.useState([]);
  const [pendingComments, setPendingComments] = React.useState([]);

  React.useEffect(() => {
    api.comments.list(post.id).then(data => {
      setComments(data.filter(c => c.status === 'approved'));
    }).catch(() => {});
    // PVカウント（セッション内重複なし）
    const key = `pv:${post.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      api.posts.view(post.id).catch(() => {});
    }
  }, [post.id]);
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

  const stripHtml = (html) => html?.replace(/<[^>]*>/g, "") ?? "";
  const blocks = post.blocks ?? [];
  const toc = blocks
    .filter((b) => b.type === "h2")
    .map((b, i) => ({ id: `sec-${i}`, label: stripHtml(b.text) }));

  const submitComment = async () => {
    if (!commentDraft.trim()) return;
    const saved = await api.comments.add(post.id, { 
      author: authorDraft.trim() || "anonymous", 
      text: commentDraft 
    });
    setPendingComments((prev) => [...prev, saved]);
    setCommentDraft("");
    setAuthorDraft("");
  };

  const renderBlock = (b, i) => {
    const secId = b.type === "h2" ? `sec-${toc.findIndex((t) => t.label === stripHtml(b.text))}` : undefined;
    const align = b.align || "left";
    const getText = () => {
      if (b.text_ja && b.text_en) {
        return lang === "en" ? b.text_en : lang === "ja" ? b.text_ja : b.text_ja;
      } else if (b.text) {
        return b.text;
      } else {
        return '';
      }
    };
    switch (b.type) {
      case "h2":
        return (
          <h2 key={i} id={secId} style={{ fontSize: 22, fontWeight: 600, margin: "32px 0 12px", letterSpacing: -0.3, textAlign: align }}
            dangerouslySetInnerHTML={{ __html: getText() }} />
        );
      case "code":
        return (
          <pre key={i} style={{
            background: P.bgAlt || P.panelAlt || P.cardAlt,
            border: `1px solid ${P.border || P.rule}`,
            padding: "14px 18px", fontSize: 13,
            margin: "20px 0", overflow: "auto",
            color: P.text, fontFamily: mono, lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}>{b.text}</pre>
        );
      case "quote":
        return (
          <blockquote key={i} style={{
            borderLeft: `3px solid ${P.accent || P.coral || "#ff5a5f"}`,
            paddingLeft: 20, margin: "20px 0",
            fontStyle: "italic", color: P.dim, fontSize: 15, textAlign: align,
          }} dangerouslySetInnerHTML={{ __html: getText() }} />
        );
      case "image":
        return (
          <div key={i} style={{ margin: "24px 0" }}>
            {b.srcSet?.desktop ? (
              <picture>
                {b.srcSet.mobile && <source media="(max-width: 640px)" srcSet={b.srcSet.mobile} />}
                <img src={b.srcSet.desktop} alt={b.alt || ""} style={{ display: "block", maxWidth: "100%", height: "auto", border: `1px solid ${P.border || P.rule}` }} />
              </picture>
            ) : (
              <img src={b.src} alt={b.alt || ""} style={{ display: "block", maxWidth: "100%", height: "auto", border: `1px solid ${P.border || P.rule}` }} />
            )}
            {b.alt && (
              <div style={{ fontSize: 12, color: P.faint, fontStyle: "italic", textAlign: "center", marginTop: 8 }}>
                {b.alt}
              </div>
            )}
          </div>
        );
      case "bullet":
        return (
          <div key={i} style={{ display: "flex", gap: 12, margin: "4px 0", justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start" }}>
            <span style={{ color: P.accent || P.coral || "#ff5a5f" }}>•</span>
            <div style={{ flex: align === "left" ? 1 : "unset", textAlign: align }} dangerouslySetInnerHTML={{ __html: b.text }} />
          </div>
        );
      case "link":
        return (
          <div key={i} style={{ margin: "8px 0" }}>
            <a href={b.href} target="_blank" rel="noopener noreferrer" style={{
              color: P.accent || P.coral || "#ff5a5f",
              textDecoration: "underline", fontSize: 14,
            }}>
              {b.text || b.href}
            </a>
          </div>
        );
      case "linkcard": {
        const lcSize = b.size || "md";
        const lcIsHero = lcSize === "hero";
        const lcImgSizes = { sm: [80, 60], md: [140, 100], lg: [200, 140], hero: [null, 200] };
        const [lcW, lcH] = lcImgSizes[lcSize] || lcImgSizes.md;
        return (
          <a key={i} href={b.href} target="_blank" rel="noopener noreferrer"
            className={`linkcard linkcard-${lcSize}`}
            style={{
              display: "flex", flexDirection: lcIsHero ? "column" : "row",
              margin: "20px 0",
              border: `1px solid ${P.border || P.rule}`,
              background: P.bgAlt || P.panelAlt || P.cardAlt,
              overflow: "hidden", textDecoration: "none", color: "inherit",
            }}>
            {b.image && (
              <img src={b.image} alt="" className="linkcard-img" style={{
                width: lcIsHero ? "100%" : lcW,
                height: lcH, objectFit: "cover", flexShrink: 0,
              }} />
            )}
            <div style={{ padding: "14px 18px", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
              <div style={{ fontSize: lcIsHero ? 16 : 14, fontWeight: 600, color: P.text, overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1 }}>{b.title || b.href}</div>
              {b.description && lcSize !== "sm" && <div style={{ fontSize: 12, color: P.dim, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{b.description}</div>}
              <div style={{ fontSize: 11, color: P.faint }}>{b.siteName || b.href}</div>
            </div>
          </a>
        );
      }
      case "divider":
        return <hr key={i} style={{ border: "none", borderTop: `1px dashed ${P.border || P.rule}`, margin: "24px 0" }} />;
      default:
        return (
          <p key={i} style={{ margin: "0 0 16px", lineHeight: 1.8, textAlign: align }}
            dangerouslySetInnerHTML={{ __html: b.text }} />
        );
    }
  };

  return (
    <div style={{
      background: P.bg, color: P.text,
      fontFamily: mono, fontSize: 14, lineHeight: 1.7,
      minHeight: "100%", width: "100%",
    }}>
      <style>{`
        @media (max-width: 1024px) {
          .post-container {
            grid-template-columns: 1fr !important;
            padding: 24px 20px 100px !important;
            gap: 24px !important;
          }
          .post-aside {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .post-nav {
            padding: 12px 16px !important;
          }
          .post-title-h1 {
            font-size: 24px !important;
            letter-spacing: -0.3px !important;
          }
          .post-body h2 {
            font-size: 18px !important;
            margin: 24px 0 10px !important;
          }
          .post-body pre {
            font-size: 11px !important;
            padding: 12px !important;
          }
          .post-body blockquote {
            padding-left: 12px !important;
            font-size: 13px !important;
          }
          .post-body img {
            border-radius: 2px;
          }
          .post-body .linkcard:not(.linkcard-hero) {
            flex-direction: column !important;
          }
          .post-body .linkcard:not(.linkcard-hero) .linkcard-img {
            width: 100% !important;
            height: 140px !important;
          }
        }
        @media (max-width: 640px) {
          .post-share {
            flex-direction: column !important;
          }
          .post-share button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
        @media (max-width: 900px) and (min-width: 641px) {
          .post-body .linkcard:not(.linkcard-hero):not(.linkcard-lg) .linkcard-img {
            width: 100px !important;
            height: 80px !important;
          }
        }
        .post-body a { color: #ff5a5f; text-decoration: underline; }
        .post-body a:hover { opacity: 0.8; }
      `}</style>
      {/* Top nav */}
      <div className="post-nav" style={{
        borderBottom: `1px solid ${P.border || P.rule}`,
        padding: "16px 36px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 12, color: P.dim,
        background: P.bgDeep || P.bgAlt || P.bg,
        flexWrap: "wrap", gap: 12
      }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent", border: "none",
            color: P.accent || P.coral || "#ff5a5f",
            fontFamily: mono, fontSize: 12, cursor: "pointer", padding: 0,
          }}
        >← cd ..</button>
        <div>{fmtDate(post.date)} · {post.readTime} min · {post.category}</div>
        <div style={{ display: "flex", gap: 4 }}>
          {["both", "ja", "en"].map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{
              background: lang === l ? (P.accent || P.coral || "#ff5a5f") + "22" : "transparent",
              color: lang === l ? (P.accent || P.coral || "#ff5a5f") : P.dim,
              border: `1px solid ${lang === l ? (P.accent || P.coral || "#ff5a5f") + "55" : "transparent"}`,
              fontFamily: mono, fontSize: 11, padding: "3px 10px", cursor: "pointer",
            }}>{l === "both" ? "ja+en" : l}</button>
          ))}
        </div>
      </div>

      <div className="post-container" style={{
        display: "grid",
        gridTemplateColumns: toc.length > 0 ? "200px minmax(0, 720px) 200px" : "1fr minmax(0, 720px) 1fr",
        gap: 40, maxWidth: 1280, margin: "0 auto",
        padding: "48px 36px 80px",
      }}>
        {/* TOC */}
        <aside className="post-aside" style={{ position: "sticky", top: 80, alignSelf: "start", fontSize: 12 }}>
          {toc.length > 0 && (
            <>
              <div style={{ color: P.faint, fontSize: 10, letterSpacing: 1.5, marginBottom: 12 }}>
                ON THIS PAGE
              </div>
              <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {toc.map((t, i) => (
                  <button key={t.id} onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth" })}
                    style={{
                      textAlign: "left", background: "transparent", border: "none",
                      padding: "4px 0 4px 12px",
                      borderLeft: `2px solid ${P.border || P.rule}`,
                      color: P.dim, fontFamily: mono, fontSize: 12, cursor: "pointer",
                    }}>
                    <span style={{ color: P.faint, marginRight: 6 }}>{String(i + 1).padStart(2, "0")}</span>
                    {t.label}
                  </button>
                ))}
              </nav>
            </>
          )}
        </aside>

        {/* Article body */}
        <article>
          <div style={{ fontSize: 11, color: P.faint, letterSpacing: 1, marginBottom: 14 }}>
            {post.category === "技術" ? "◇ TECH LOG" : "◇ DIARY"}
            {post.tags?.length > 0 && ` · #${post.tags.join(" #")}`}
          </div>

          {lang !== "en" && (
            <h1 className="post-title-h1" style={{ fontSize: 36, fontWeight: 600, margin: "0 0 10px", lineHeight: 1.2, letterSpacing: -0.6 }}>
              {post.title_ja}
            </h1>
          )}
          {lang !== "ja" && (
            <div style={{ fontSize: 20, color: P.dim, fontStyle: "italic", marginBottom: 24, lineHeight: 1.3 }}>
              {post.title_en}
            </div>
          )}

          <div style={{
            display: "flex", gap: 16, fontSize: 12, color: P.faint,
            paddingBottom: 20, marginBottom: 32,
            borderBottom: `1px solid ${P.border || P.rule}`,
          }}>
            <span>{fmtDateLong(post.date, "en")}</span>
            <span>·</span>
            <span>{post.readTime} min read</span>
            <span>·</span>
            <span>[{comments.length} comments]</span>
            {post.views > 0 && <><span>·</span><span>{post.views.toLocaleString()} views</span></>}
          </div>

          {/* Blocks */}
          <div className="post-body">
            {blocks.length > 0
              ? blocks.filter((b) => !b.lang || lang === "both" || b.lang === lang).map(renderBlock)
              : <p style={{ color: P.faint, fontStyle: "italic" }}>（本文なし）</p>
            }
          </div>

          {/* Share */}
          <ShareBar post={post} P={P} mono={mono} />

          {/* ブログ村バナー */}
          <div style={{ textAlign: "center", margin: "32px 0 0" }}>
            <a href="https://blogmura.com/ranking/in?p_cid=11214183" target="_blank" rel="noopener noreferrer">
              <img src="https://b.blogmura.com/banner-blogmura-portfolio.svg" width="120" height="49" border="0" alt="ブログランキング・にほんブログ村へ" />
            </a>
          </div>

          {/* Comments */}
          <section style={{ marginTop: 56 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
              コメント <span style={{ color: P.faint, fontSize: 12, fontWeight: 400 }}>/ {comments.length} replies</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              {comments.map((c, i) => (
                <div key={i} style={{
                  background: P.bgAlt || P.card || P.cardAlt,
                  border: `1px solid ${P.border || P.rule}`,
                  padding: "14px 16px", fontSize: 13,
                }}>
                  <div style={{ display: "flex", gap: 10, fontSize: 11, color: P.faint, marginBottom: 8 }}>
                    <span style={{ color: P.accent || P.coral || "#ff5a5f", fontWeight: 600 }}>@{c.author}</span>
                    <span>·</span>
                    <span>{fmtDate(c.created_at || c.date)}</span>
                  </div>
                  <div>{c.text}</div>
                </div>
              ))}
              {pendingComments.map((c, i) => (
                <div key={`pending-${i}`} style={{
                  background: P.bgAlt || P.card || P.cardAlt,
                  border: `1px dashed ${P.border || P.rule}`,
                  padding: "14px 16px", fontSize: 13,
                  opacity: 0.7,
                }}>
                  <div style={{ display: "flex", gap: 10, fontSize: 11, color: P.faint, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ color: P.accent || P.coral || "#ff5a5f", fontWeight: 600 }}>@{c.author}</span>
                    <span>·</span>
                    <span style={{
                      color: "#ffb454", border: "1px solid #ffb45455",
                      padding: "0 6px", fontSize: 10, letterSpacing: 0.5,
                    }}>承認待ち</span>
                  </div>
                  <div>{c.text}</div>
                </div>
              ))}
            </div>
            <div style={{ border: `1px dashed ${P.border || P.rule}`, padding: 16 }}>
              <input
                type="text"
                value={authorDraft}
                onChange={(e) => setAuthorDraft(e.target.value)}
                placeholder="名前（未記入で anonymous）"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: P.bg, color: P.text,
                  border: `1px solid ${P.border || P.rule}`,
                  fontFamily: mono, fontSize: 13, padding: "8px 10px",
                  outline: "none", marginBottom: 12,
                }}
              />
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="コメントを書く..."
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: P.bg, color: P.text,
                  border: `1px solid ${P.border || P.rule}`,
                  fontFamily: mono, fontSize: 13, padding: 10,
                  outline: "none", resize: "vertical",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button onClick={submitComment} style={{
                  background: P.accent || P.coral || "#ff5a5f",
                  color: P.bg, border: "none",
                  fontFamily: mono, fontSize: 12, fontWeight: 600,
                  padding: "6px 16px", cursor: "pointer",
                }}>POST →</button>
              </div>
            </div>
          </section>
        </article>

        {/* Right rail */}
        <aside className="post-aside" style={{ position: "sticky", top: 80, alignSelf: "start", fontSize: 12 }}>
          <div style={{
            background: P.bgAlt || P.card || P.cardAlt,
            border: `1px solid ${P.border || P.rule}`,
            padding: 16,
          }}>
            {window.BLOG_META?.avatar ? (
              <img src={window.BLOG_META.avatar} alt="avatar" style={{
                width: 48, height: 48, objectFit: "cover",
                border: `1px solid ${P.border || P.rule}`, marginBottom: 12, display: "block",
              }} />
            ) : (
              <div style={{
                width: 48, height: 48, background: P.accent || P.coral || "#ff5a5f",
                display: "grid", placeItems: "center",
                color: P.bg, fontSize: 20, fontWeight: 700, marginBottom: 12,
              }}>
                {window.BLOG_META?.author_ja?.[0] ?? "N"}
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600 }}>{window.BLOG_META?.author_ja}</div>
            <div style={{ fontSize: 11, color: P.dim, marginTop: 8, lineHeight: 1.6 }}>
              {window.BLOG_META?.bio_ja}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ShareBar({ post, P, mono }) {
  const [copied, setCopied] = React.useState(false);
  const SITE = 'https://ninjin.up.railway.app';
  const url = `${SITE}/?post=${encodeURIComponent(post.id)}`;
  const title = post.title_ja || post.title_en || '';

  const share = (href) => window.open(href, '_blank', 'noopener,width=600,height=500');

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const btnStyle = (color) => ({
    background: 'transparent',
    border: `1px solid ${color}44`,
    color,
    fontFamily: mono, fontSize: 12,
    padding: '6px 14px', cursor: 'pointer',
    letterSpacing: 0.3, whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 6,
  });

  return (
    <div style={{
      marginTop: 40, paddingTop: 24,
      borderTop: `1px dashed ${P.border || P.rule}`,
    }}>
      <div style={{ fontSize: 11, color: P.faint, letterSpacing: 1, marginBottom: 12 }}>
        // SHARE
      </div>
      <div className="post-share" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {/* X (Twitter) */}
        <button
          onClick={() => share(`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`)}
          style={btnStyle('#1d9bf0')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          でシェア
        </button>

        {/* LINE */}
        <button
          onClick={() => share(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`)}
          style={btnStyle('#06c755')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
          LINE
        </button>

        {/* はてなブックマーク */}
        <button
          onClick={() => share(`https://b.hatena.ne.jp/add?mode=confirm&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`)}
          style={btnStyle('#00a4de')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.47 0C22.42 0 24 1.58 24 3.53v16.94C24 22.42 22.42 24 20.47 24H3.53C1.58 24 0 22.42 0 20.47V3.53C0 1.58 1.58 0 3.53 0zM11.28 17.85c.67 0 1.2-.55 1.2-1.22 0-.68-.53-1.23-1.2-1.23-.68 0-1.22.55-1.22 1.23 0 .67.54 1.22 1.22 1.22zm-2.3-6.04v5.86H6.55V11.8zm1.1-5.56c1.58 0 2.53.84 2.53 2.18 0 .96-.5 1.67-1.36 2.01.98.3 1.58 1.07 1.58 2.13 0 1.55-1.06 2.44-2.85 2.44H6.55V6.25zm-.5 3.79c.73 0 1.15-.36 1.15-.99 0-.6-.4-.96-1.1-.96H8.97v1.95zm.2 3.89c.82 0 1.27-.38 1.27-1.08 0-.67-.46-1.05-1.3-1.05H8.97v2.13zm8.55-7.68v8.64h-2.43V8.25H17.7V6.48h1.13zm-.57 10.15c.68 0 1.22.55 1.22 1.23 0 .67-.54 1.22-1.22 1.22-.67 0-1.2-.55-1.2-1.22 0-.68.53-1.23 1.2-1.23z"/></svg>
          はてブ
        </button>

        {/* コピー */}
        <button onClick={copyLink} style={btnStyle(P.accent || P.coral || '#ff5a5f')}>
          {copied ? '✓ コピー済み' : '⧉ リンクをコピー'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { PostView });
export default PostView;
