import React from 'react';
import { api } from '../src/api.js';

function AdminPage({ palette: P, onBack, onOpenPost, onPostsChange, onMetaChange }) {
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
  const [tab, setTab] = React.useState("posts");
  const [editingId, setEditingId] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [comments, setComments] = React.useState([]);
  const [profile, setProfile] = React.useState({
    author_ja: window.BLOG_META?.author_ja ?? "",
    author_en: window.BLOG_META?.author_en ?? "",
    handle: window.BLOG_META?.handle ?? "",
    bio_ja: window.BLOG_META?.bio_ja ?? "",
    bio_en: window.BLOG_META?.bio_en ?? "",
    location: window.BLOG_META?.location ?? "",
    avatar: window.BLOG_META?.avatar ?? "",
    whoami_ja: window.BLOG_META?.whoami_ja ?? "",
    whoami_en: window.BLOG_META?.whoami_en ?? "",
  });

  React.useEffect(() => {
    api.posts.list({ all: true }).then((data) => setPosts(data)).catch(() => {});
    api.comments.listAll().then((data) => setComments(data)).catch(() => {});
  }, []);

  const updatePosts = async (next) => {
    setPosts(next);
    if (onPostsChange) onPostsChange();
  };

  const newPost = async () => {
    const id = "draft-" + Date.now();
    const p = {
      id, title_ja: "無題", title_en: "Untitled",
      date: new Date().toISOString().slice(0, 10),
      category: "日常", tags: [], read_time: 1, readTime: 1,
      excerpt_ja: "", excerpt_en: "",
      blocks: [{ type: "p", text: "" }],
      status: "draft",
    };
    await api.posts.save(p);
    await updatePosts([p, ...posts]);
    setEditingId(id);
    setTab("editor");
  };

  const deletePost = async (id) => {
    if (!confirm("この記事を削除しますか?")) return;
    await api.posts.delete(id);
    await updatePosts(posts.filter((p) => p.id !== id));
  };

  const toggleStatus = async (id) => {
    const post = posts.find((p) => p.id === id);
    const updated = { ...post, status: post.status === "published" ? "draft" : "published" };
    await api.posts.save(updated);
    await updatePosts(posts.map((p) => p.id === id ? updated : p));
  };

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status === "draft").length,
    pending: comments.filter((c) => (c.status || "pending") === "pending").length,
    spam: comments.filter((c) => c.status === "spam").length,
  };

  return (
    <div className="admin-container" style={{
      background: P.bg, color: P.text,
      fontFamily: mono, fontSize: 13, lineHeight: 1.6,
      minHeight: "100vh", width: "100%",
      display: "grid", gridTemplateColumns: "260px 1fr",
    }}>
      <style>{`
        @media (max-width: 820px) {
          body { overflow-x: hidden; }
          .admin-container {
            grid-template-columns: 1fr !important;
            overflow-x: hidden !important;
          }
          .admin-sidebar {
            position: relative !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid ${P.border || P.rule} !important;
          }
          .admin-main {
            padding: 16px 12px 100px !important;
            max-width: 100vw !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          .admin-hide-mobile {
            display: none !important;
          }
          .admin-list-header {
            grid-template-columns: 80px 1fr auto !important;
          }
          .admin-list-item {
            grid-template-columns: 80px 1fr auto !important;
            gap: 8px !important;
          }
          .admin-toolbar {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .admin-toolbar-filters {
            width: 100% !important;
            flex-wrap: wrap !important;
          }
          .admin-toolbar-search {
            flex: 1 1 100px !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .admin-toolbar-new {
            margin-left: 0 !important;
          }
        }
      `}</style>
      {/* ── Admin sidebar ── */}
      <aside className="admin-sidebar" style={{
        background: P.bgAlt || P.card || P.bgDeep || "#12151a",
        borderRight: `1px solid ${P.border || P.rule}`,
        padding: "24px 0",
        position: "sticky", top: 0, height: "100vh",
        overflow: "auto",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ padding: "0 20px 16px", borderBottom: `1px solid ${P.border || P.rule}` }}>
          <div style={{ fontSize: 10, color: P.faint, letterSpacing: 2, marginBottom: 4 }}>
            / ADMIN CONSOLE
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>
            <span style={{ color: P.accent || P.coral || "#ff5a5f" }}>$</span> manage
          </div>
          <div style={{ fontSize: 11, color: P.dim, marginTop: 2 }}>
            {profile.handle} · {profile.author_ja}
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", padding: "0 12px", gap: 2 }}>
          <AdminNavItem P={P} active={tab === "posts"} onClick={() => { setTab("posts"); setEditingId(null); }}
            icon="▤" label="Posts" count={stats.total} />
          <AdminNavItem P={P} active={tab === "editor"} onClick={() => { setTab("editor"); if (!editingId && posts[0]) setEditingId(posts[0].id); }}
            icon="✎" label="Editor" />
          <AdminNavItem P={P} active={tab === "comments"} onClick={() => setTab("comments")}
            icon="◉" label="Comments" count={comments.length} badge={stats.pending} />
          <AdminNavItem P={P} active={tab === "profile"} onClick={() => setTab("profile")}
            icon="◈" label="Profile" />
        </nav>

        <div style={{ padding: "12px 20px", marginTop: 8 }}>
          <button
            onClick={newPost}
            style={{
              width: "100%", background: P.accent || P.coral || "#ff5a5f",
              color: P.bg, border: "none",
              fontFamily: mono, fontSize: 12, fontWeight: 600,
              padding: "10px 14px", cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >+ NEW POST</button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Stats */}
        <div style={{
          padding: "16px 20px", borderTop: `1px solid ${P.border || P.rule}`,
          fontSize: 11, color: P.dim,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px",
        }}>
          <div><span style={{ color: P.faint }}>pub</span> {stats.published}</div>
          <div><span style={{ color: P.faint }}>drafts</span> {stats.drafts}</div>
          <div><span style={{ color: P.faint }}>pending</span> {stats.pending}</div>
          <div><span style={{ color: P.faint }}>spam</span> {stats.spam}</div>
        </div>

        <button
          onClick={onBack}
          style={{
            background: "transparent", border: "none",
            color: P.dim, fontFamily: mono, fontSize: 11,
            padding: "10px 20px", textAlign: "left", cursor: "pointer",
            borderTop: `1px solid ${P.border || P.rule}`,
          }}
        >← back to blog</button>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main" style={{ padding: "36px 48px 80px", maxWidth: 1080, width: "100%" }}>
        {tab === "posts" && (
          <PostsTab
            P={P} posts={posts} comments={comments}
            onEdit={(id) => { setEditingId(id); setTab("editor"); }}
            onDelete={deletePost}
            onToggleStatus={toggleStatus}
            onPreview={onOpenPost}
            onNew={newPost}
          />
        )}
        {tab === "editor" && (
          <EditorTab
            P={P} posts={posts} setPosts={updatePosts}
            editingId={editingId} setEditingId={setEditingId}
            onNew={newPost}
          />
        )}
        {tab === "comments" && (
          <CommentsTab P={P} comments={comments} setComments={setComments} posts={posts} />
        )}
        {tab === "profile" && (
          <ProfileTab P={P} profile={profile} setProfile={setProfile} onMetaChange={onMetaChange} />
        )}
      </main>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Sidebar nav item
// ───────────────────────────────────────────────────────────
function AdminNavItem({ P, active, onClick, icon, label, count, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", border: "none",
        background: active ? (P.bg || P.panel) : "transparent",
        color: active ? P.text : P.dim,
        fontFamily: "inherit", fontSize: 13, cursor: "pointer", textAlign: "left",
        borderLeft: `2px solid ${active ? (P.accent || P.coral || "#ff5a5f") : "transparent"}`,
        width: "100%",
      }}
    >
      <span style={{ color: active ? (P.accent || P.coral || "#ff5a5f") : P.faint, width: 14 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && (
        <span style={{ color: P.faint, fontSize: 11 }}>{count}</span>
      )}
      {badge > 0 && (
        <span style={{
          background: P.accent || P.coral || "#ff5a5f", color: P.bg,
          padding: "1px 6px", fontSize: 10, fontWeight: 600,
          borderRadius: 2,
        }}>{badge}</span>
      )}
    </button>
  );
}

// ───────────────────────────────────────────────────────────
// Posts tab — list + bulk actions
// ───────────────────────────────────────────────────────────
function PostsTab({ P, posts, comments, onEdit, onDelete, onToggleStatus, onPreview, onNew }) {
  const [filter, setFilter] = React.useState("all"); // all | published | draft
  const [query, setQuery] = React.useState("");

  const filtered = posts.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return p.title_ja.toLowerCase().includes(q) || p.title_en.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <AdminHeader P={P} title="記事一覧" subtitle={`${posts.length} posts · manage, publish, delete`} />

      {/* Toolbar */}
      <div className="admin-toolbar" style={{
        display: "flex", gap: 12, alignItems: "center", marginBottom: 20,
        paddingBottom: 16, borderBottom: `1px solid ${P.border || P.rule}`,
      }}>
        <div className="admin-toolbar-filters" style={{ display: "flex", gap: 4 }}>
          {[
            { k: "all", l: "all", n: posts.length },
            { k: "published", l: "published", n: posts.filter((p) => p.status === "published").length },
            { k: "draft", l: "drafts", n: posts.filter((p) => p.status === "draft").length },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              style={{
                background: filter === f.k ? (P.accent || P.coral || "#ff5a5f") + "22" : "transparent",
                color: filter === f.k ? (P.accent || P.coral || "#ff5a5f") : P.dim,
                border: `1px solid ${filter === f.k ? (P.accent || P.coral || "#ff5a5f") + "55" : P.border || P.rule}`,
                fontFamily: "inherit", fontSize: 11,
                padding: "5px 10px", cursor: "pointer",
              }}
            >{f.l} <span style={{ opacity: 0.6 }}>{f.n}</span></button>
          ))}
        </div>
        <input
          className="admin-toolbar-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="/ search titles..."
          style={{
            flex: 1, maxWidth: 360,
            background: P.bgAlt || P.card || "transparent",
            border: `1px solid ${P.border || P.rule}`,
            color: P.text, fontFamily: "inherit", fontSize: 12,
            padding: "6px 10px", outline: "none",
          }}
        />
        <button
          className="admin-toolbar-new"
          onClick={onNew}
          style={{
            marginLeft: "auto",
            background: "transparent", color: P.text,
            border: `1px solid ${P.border || P.rule}`,
            fontFamily: "inherit", fontSize: 12,
            padding: "6px 12px", cursor: "pointer",
          }}
        >+ new</button>
      </div>

      {/* Table */}
      <div className="admin-list-header" style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr 80px 100px 52px auto",
        gap: 16, fontSize: 11, color: P.faint,
        padding: "8px 12px", borderBottom: `1px solid ${P.border || P.rule}`,
      }}>
        <span>status</span>
        <span>title</span>
        <span className="admin-hide-mobile">cat</span>
        <span className="admin-hide-mobile">date</span>
        <span className="admin-hide-mobile" style={{ textAlign: "right" }}>💬</span>
        <span></span>
      </div>
      {filtered.map((p) => {
        const commentsFor = comments.filter((c) => (c.post_id || c.postId) === p.id).length;
        return (
          <div key={p.id} className="admin-list-item" style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 80px 100px 52px auto",
            gap: 16, padding: "12px 12px", alignItems: "center",
            borderBottom: `1px solid ${P.border || P.rule}`,
            fontSize: 13,
          }}>
            <button
              onClick={() => onToggleStatus(p.id)}
              style={{
                background: p.status === "published" ? (P.accentAlt || P.mint || "#3d7a55") + "22" : P.bgAlt || P.card,
                color: p.status === "published" ? (P.accentAlt || P.mint || "#3d7a55") : P.dim,
                border: `1px solid ${p.status === "published" ? (P.accentAlt || P.mint || "#3d7a55") + "55" : P.border || P.rule}`,
                fontFamily: "inherit", fontSize: 10,
                padding: "3px 8px", cursor: "pointer", letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {p.status === "published" ? "● live" : "○ draft"}
            </button>
            <div>
              <div style={{ color: P.text, fontWeight: 500 }}>{p.title_ja}</div>
              <div style={{ fontSize: 11, color: P.dim, fontStyle: "italic" }}>{p.title_en}</div>
              {p.views > 0 && <div style={{ fontSize: 10, color: P.faint, marginTop: 2 }}>👁 {p.views.toLocaleString()} views</div>}
            </div>
            <span className="admin-hide-mobile" style={{
              fontSize: 10, padding: "2px 6px", justifySelf: "start",
              color: p.category === "技術" ? (P.accentAlt || P.cyan || P.lilac || "#8fd4a7") : (P.accent || P.coral || "#ff5a5f"),
              border: `1px solid ${(p.category === "技術" ? (P.accentAlt || P.cyan || P.lilac || "#8fd4a7") : (P.accent || P.coral || "#ff5a5f")) + "44"}`,
            }}>
              {p.category === "技術" ? "tech" : "diary"}
            </span>
            <span className="admin-hide-mobile" style={{ color: P.dim, fontSize: 12 }}>{p.date}</span>
            <span className="admin-hide-mobile" style={{ color: P.dim, textAlign: "right", fontSize: 12 }}>{commentsFor}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <IconBtn P={P} onClick={() => onEdit(p.id)} title="edit">✎</IconBtn>
              {onPreview && p.status === "published" && (
                <IconBtn P={P} onClick={() => onPreview(p.id)} title="preview">◉</IconBtn>
              )}
              <IconBtn P={P} onClick={() => onDelete(p.id)} title="delete" danger>✕</IconBtn>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div style={{ padding: "40px", textAlign: "center", color: P.faint, fontSize: 13 }}>
          // no posts match. try + new.
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Editor tab — Notion-style block editor
// ───────────────────────────────────────────────────────────
function EditorTab({ P, posts, setPosts, editingId, setEditingId, onNew }) {
  const post = posts.find((p) => p.id === editingId);

  if (!post) {
    return (
      <div>
        <AdminHeader P={P} title="エディター" subtitle="select a post to edit or create a new one" />
        <div style={{
          padding: 48, textAlign: "center", color: P.dim,
          border: `2px dashed ${P.border || P.rule}`, marginTop: 20,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✎</div>
          <div>まだ記事を選択していません</div>
          <button
            onClick={onNew}
            style={{
              marginTop: 20, background: P.accent || P.coral || "#ff5a5f",
              color: P.bg, border: "none",
              fontFamily: "inherit", fontSize: 12, fontWeight: 600,
              padding: "10px 20px", cursor: "pointer", letterSpacing: 0.5,
            }}
          >+ CREATE NEW POST</button>
        </div>
      </div>
    );
  }

  const updatePost = (patch) => {
    const updated = { ...post, ...patch };
    setPosts(posts.map((p) => p.id === editingId ? updated : p));
    api.posts.save({ ...updated, read_time: updated.readTime ?? updated.read_time ?? 1 })
      .catch((err) => {
        console.error("Save failed:", err);
        // If it's a 413 Payload Too Large, alert specifically
        if (err.message?.includes("413") || err.message?.toLowerCase().includes("large")) {
          alert("画像が大きすぎるため保存できませんでした（10MB制限）。");
        } else {
          alert("保存に失敗しました。");
        }
      });
  };
  const blocks = post.blocks || [{ type: "p", text: post.excerpt_ja || "" }];
  const updateBlocks = (b) => updatePost({ blocks: b });

  return (
    <div>
      {/* Editor top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 20, paddingBottom: 14,
        borderBottom: `1px solid ${P.border || P.rule}`,
      }}>
        <select
          value={editingId}
          onChange={(e) => setEditingId(e.target.value)}
          style={{
            background: P.bgAlt || P.card, color: P.text,
            border: `1px solid ${P.border || P.rule}`,
            fontFamily: "inherit", fontSize: 12,
            padding: "6px 10px", outline: "none", maxWidth: 320,
          }}
        >
          {posts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.status === "draft" ? "○ " : "● "}
              {p.title_ja}
            </option>
          ))}
        </select>

        <span style={{ fontSize: 11, color: P.faint }}>
          last edit · auto-saved
        </span>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => updatePost({ status: post.status === "published" ? "draft" : "published" })}
          style={{
            background: post.status === "published" ? (P.accentAlt || P.mint || "#3d7a55") + "22" : "transparent",
            color: post.status === "published" ? (P.accentAlt || P.mint || "#3d7a55") : P.dim,
            border: `1px solid ${post.status === "published" ? (P.accentAlt || P.mint || "#3d7a55") + "55" : P.border || P.rule}`,
            fontFamily: "inherit", fontSize: 11,
            padding: "5px 12px", cursor: "pointer", letterSpacing: 0.5,
          }}
        >
          {post.status === "published" ? "● PUBLISHED" : "○ DRAFT — click to publish"}
        </button>
      </div>

      {/* Title inputs */}
      <input
        value={post.title_ja}
        onChange={(e) => updatePost({ title_ja: e.target.value })}
        placeholder="タイトル (日本語)"
        style={{
          width: "100%", background: "transparent", border: "none",
          color: P.text, fontFamily: "inherit",
          fontSize: 32, fontWeight: 600, letterSpacing: -0.5,
          padding: "8px 0", outline: "none", marginBottom: 4,
        }}
      />
      <input
        value={post.title_en}
        onChange={(e) => updatePost({ title_en: e.target.value })}
        placeholder="Title (English)"
        style={{
          width: "100%", background: "transparent", border: "none",
          color: P.dim, fontFamily: "inherit",
          fontSize: 18, fontStyle: "italic",
          padding: "4px 0", outline: "none", marginBottom: 20,
        }}
      />

      {/* Meta row */}
      <div style={{
        display: "flex", gap: 12, flexWrap: "wrap",
        marginBottom: 24, paddingBottom: 16,
        borderBottom: `1px dashed ${P.border || P.rule}`,
      }}>
        <MetaField P={P} label="date">
          <input
            type="date"
            value={post.date}
            onChange={(e) => updatePost({ date: e.target.value })}
            style={metaInputStyle(P)}
          />
        </MetaField>
        <MetaField P={P} label="category">
          <select
            value={post.category}
            onChange={(e) => updatePost({ category: e.target.value })}
            style={metaInputStyle(P)}
          >
            <option value="日常">日常 / diary</option>
            <option value="技術">技術 / tech</option>
          </select>
        </MetaField>
        <MetaField P={P} label="tags">
          <input
            value={(post.tags || []).join(", ")}
            onChange={(e) => updatePost({ tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            placeholder="dev, diary, rust"
            style={{ ...metaInputStyle(P), minWidth: 200 }}
          />
        </MetaField>
        <MetaField P={P} label="read min">
          <input
            type="number"
            value={post.readTime}
            onChange={(e) => updatePost({ readTime: Number(e.target.value) })}
            style={{ ...metaInputStyle(P), width: 60 }}
          />
        </MetaField>
      </div>

      {/* Block editor */}
      <BlockEditor P={P} blocks={blocks} onChange={updateBlocks} />
    </div>
  );
}

function MetaField({ P, label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, color: P.faint, letterSpacing: 1 }}>{label}</label>
      {children}
    </div>
  );
}
function metaInputStyle(P) {
  return {
    background: P.bgAlt || P.card || "transparent",
    border: `1px solid ${P.border || P.rule}`,
    color: P.text, fontFamily: "inherit", fontSize: 12,
    padding: "5px 8px", outline: "none",
  };
}

// ─── Notion-style block editor ──────────────────────────────
function BlockEditor({ P, blocks, onChange }) {
  const [menuOpenIdx, setMenuOpenIdx] = React.useState(null);

  const updateBlock = (i, patch) => {
    onChange(blocks.map((b, j) => i === j ? { ...b, ...patch } : b));
  };
  const addBlock = (i, type = "p") => {
    const nb = [...blocks];
    nb.splice(i + 1, 0, { type, text: "" });
    onChange(nb);
  };
  const deleteBlock = (i) => {
    if (blocks.length === 1) return;
    onChange(blocks.filter((_, j) => j !== i));
  };
  const moveBlock = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const nb = [...blocks];
    [nb[i], nb[j]] = [nb[j], nb[i]];
    onChange(nb);
  };
  const changeType = (i, type) => {
    updateBlock(i, { type });
    setMenuOpenIdx(null);
  };

  const handleKey = (e, i, b) => {
    if (e.key === "Enter" && !e.shiftKey && b.type !== "code" && b.type !== "image") {
      e.preventDefault();
      addBlock(i, "p");
      // Focus the next block
      setTimeout(() => {
        const els = document.querySelectorAll("[data-block-editable]");
        els[i + 1]?.focus();
      }, 0);
    } else if (e.key === "Backspace" && blocks.length > 1) {
      const domText = e.currentTarget.innerText ?? e.currentTarget.textContent ?? "";
      if (domText === "") {
        e.preventDefault();
        deleteBlock(i);
        setTimeout(() => {
          const els = document.querySelectorAll("[data-block-editable]");
          (els[Math.max(0, i - 1)])?.focus();
        }, 0);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {blocks.map((b, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "28px 1fr",
          gap: 4, alignItems: "start",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.querySelector("[data-handle]").style.opacity = 1;
          const ab = e.currentTarget.querySelector("[data-alignbar]");
          if (ab) ab.style.opacity = 1;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.querySelector("[data-handle]").style.opacity = 0;
          const ab = e.currentTarget.querySelector("[data-alignbar]");
          if (ab) ab.style.opacity = 0;
          setMenuOpenIdx(null);
        }}
        >
          {/* Drag/menu handle */}
          <div data-handle style={{
            opacity: 0, transition: "opacity 0.1s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            paddingTop: 6, position: "relative",
          }}>
            <button
              onClick={() => setMenuOpenIdx(menuOpenIdx === i ? null : i)}
              style={{
                background: "transparent", border: "none",
                color: P.faint, cursor: "grab",
                fontFamily: "inherit", fontSize: 14, padding: 0,
                width: 20, height: 20,
              }}
              title="type / menu"
            >⋮⋮</button>
            {menuOpenIdx === i && (
              <div style={{
                position: "absolute", top: 28, left: 0,
                background: P.bgAlt || P.card || "#1a1a1e",
                border: `1px solid ${P.border || P.rule}`,
                padding: 4, zIndex: 10, minWidth: 160,
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}>
                {[
                  { t: "p", l: "¶  Text" },
                  { t: "h2", l: "H2  Heading" },
                  { t: "quote", l: "❝  Quote" },
                  { t: "code", l: "{ }  Code" },
                  { t: "image", l: "▦  Image" },
                  { t: "bullet", l: "•  Bullet" },
                  { t: "link", l: "⧉  Link" },
                  { t: "linkcard", l: "▣  Card" },
                  { t: "divider", l: "─  Divider" },
                ].map((it) => (
                  <button
                    key={it.t}
                    onClick={() => changeType(i, it.t)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      background: b.type === it.t ? (P.accent || P.coral || "#ff5a5f") + "22" : "transparent",
                      color: b.type === it.t ? (P.accent || P.coral || "#ff5a5f") : P.text,
                      border: "none", padding: "6px 10px", fontFamily: "inherit",
                      fontSize: 12, cursor: "pointer",
                    }}
                  >{it.l}</button>
                ))}
                <div style={{ borderTop: `1px solid ${P.border || P.rule}`, marginTop: 4, paddingTop: 4 }}>
                  <button onClick={() => { moveBlock(i, -1); setMenuOpenIdx(null); }}
                    style={menuItemStyle(P)}>↑ move up</button>
                  <button onClick={() => { moveBlock(i, 1); setMenuOpenIdx(null); }}
                    style={menuItemStyle(P)}>↓ move down</button>
                  <button onClick={() => { deleteBlock(i); setMenuOpenIdx(null); }}
                    style={{ ...menuItemStyle(P), color: "#ff6b6b" }}>✕ delete</button>
                </div>
              </div>
            )}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => addBlock(i)}
                style={{
                  background: "transparent", border: "none",
                  color: P.faint, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 14, padding: 0,
                  width: 20, height: 20,
                }}
                title="add block below"
              >+</button>
              <button
                onClick={() => addBlock(i, "linkcard")}
                style={{
                  background: "transparent", border: "none",
                  color: P.faint, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 9, padding: 0,
                  width: 20, lineHeight: 1.2, marginTop: 2,
                  display: "block",
                }}
                title="カードを挿入"
              >▣</button>
            </div>
          </div>

          {/* Block content + align bar */}
          <div style={{ position: "relative" }}>
            {!["divider", "image", "code"].includes(b.type) && (
              <div data-alignbar style={{
                opacity: 0, transition: "opacity 0.1s",
                position: "absolute", top: 2, right: 0,
                display: "flex", gap: 2, zIndex: 5,
              }}>
                {[
                  { a: "left", icon: "≡←" },
                  { a: "center", icon: "≡" },
                  { a: "right", icon: "≡→" },
                ].map(({ a, icon }) => (
                  <button key={a} onClick={() => updateBlock(i, { align: a })}
                    style={{
                      background: (b.align || "left") === a ? (P.accent || P.coral || "#ff5a5f") + "33" : "transparent",
                      color: (b.align || "left") === a ? (P.accent || P.coral || "#ff5a5f") : P.faint,
                      border: "none", padding: "2px 5px", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 10,
                    }}
                    title={a}
                  >{icon}</button>
                ))}
              </div>
            )}
            <BlockContent
              P={P} block={b} idx={i}
              onChange={(patch) => updateBlock(i, patch)}
              onKeyDown={(e) => handleKey(e, i, b)}
            />
          </div>
        </div>
      ))}

      <LinkBar P={P} />
      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { t: "p", l: "+ text" },
          { t: "h2", l: "+ H2" },
          { t: "quote", l: "+ quote" },
          { t: "code", l: "+ code" },
          { t: "image", l: "+ image" },
          { t: "bullet", l: "+ bullet" },
          { t: "link", l: "+ link" },
          { t: "linkcard", l: "+ card" },
          { t: "divider", l: "+ divider" },
        ].map((it) => (
          <button
            key={it.t}
            onClick={() => addBlock(blocks.length - 1, it.t)}
            style={{
              background: "transparent", border: `1px dashed ${P.border || P.rule}`,
              color: P.dim, fontFamily: "inherit", fontSize: 11,
              padding: "4px 10px", cursor: "pointer",
            }}
          >{it.l}</button>
        ))}
      </div>
    </div>
  );
}

function menuItemStyle(P) {
  return {
    display: "block", width: "100%", textAlign: "left",
    background: "transparent", color: P.dim,
    border: "none", padding: "4px 10px", fontFamily: "inherit",
    fontSize: 11, cursor: "pointer",
  };
}

function LinkBar({ P }) {
  const [pos, setPos] = React.useState(null);
  const [showInput, setShowInput] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const savedRange = React.useRef(null);

  React.useEffect(() => {
    const onMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setPos(null);
        setShowInput(false);
        return;
      }
      let el = sel.anchorNode;
      if (el?.nodeType === 3) el = el.parentElement;
      while (el && !el.hasAttribute?.("data-block-editable")) el = el.parentElement;
      if (!el) { setPos(null); return; }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      savedRange.current = range.cloneRange();
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    };
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  const applyLink = () => {
    if (!savedRange.current || !url.trim()) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange.current);
    document.execCommand("createLink", false, url.trim());
    setPos(null);
    setShowInput(false);
    setUrl("");
    savedRange.current = null;
  };

  if (!pos) return null;
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "fixed",
        left: pos.x, top: pos.y - 8,
        transform: "translate(-50%, -100%)",
        background: P.bgAlt || P.card || "#1a1a1e",
        border: `1px solid ${P.border || P.rule}`,
        padding: "4px 6px",
        display: "flex", gap: 4, alignItems: "center",
        zIndex: 9999,
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        fontFamily: mono, fontSize: 12,
      }}
    >
      {!showInput ? (
        <button
          onMouseDown={(e) => { e.preventDefault(); setShowInput(true); }}
          style={{
            background: "transparent", border: "none",
            color: P.text, fontFamily: "inherit", fontSize: 12,
            cursor: "pointer", padding: "2px 6px", letterSpacing: 0.3,
          }}
        >⧉ link</button>
      ) : (
        <>
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyLink();
              if (e.key === "Escape") { setShowInput(false); setPos(null); }
            }}
            placeholder="https://..."
            style={{
              background: "transparent",
              border: `1px solid ${P.border || P.rule}`,
              color: P.text, fontFamily: "inherit", fontSize: 12,
              padding: "2px 8px", outline: "none", width: 240,
            }}
          />
          <button
            onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
            style={{
              background: P.accent || P.coral || "#ff5a5f", color: P.bg,
              border: "none", fontFamily: "inherit", fontSize: 11,
              padding: "2px 8px", cursor: "pointer",
            }}
          >✓</button>
        </>
      )}
    </div>
  );
}

function LinkCardBlock({ P, block, onChange }) {
  const [url, setUrl] = React.useState(block.href || '');
  const [loading, setLoading] = React.useState(false);
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

  const fetchCard = async (target) => {
    const u = target || url;
    if (!u.trim()) return;
    setLoading(true);
    try {
      const og = await api.og.fetch(u.trim());
      onChange({ href: og.url, title: og.title, description: og.description, image: og.image, siteName: og.siteName });
    } catch {
      onChange({ href: u.trim(), title: u.trim(), description: '', image: '', siteName: '' });
    } finally {
      setLoading(false);
    }
  };

  if (block.title) {
    const size = block.size || "md";
    const sizes = [
      { key: "sm", label: "S", imgW: 80, imgH: 60 },
      { key: "md", label: "M", imgW: 120, imgH: 90 },
      { key: "lg", label: "L", imgW: 180, imgH: 120 },
      { key: "hero", label: "▣", imgW: null, imgH: 180 },
    ];
    const cur = sizes.find(s => s.key === size) || sizes[1];
    const isHero = size === "hero";

    return (
      <div style={{ margin: "6px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: P.faint, marginRight: 2 }}>size</span>
          {sizes.map(s => (
            <button key={s.key} onClick={() => onChange({ size: s.key })}
              style={{
                background: size === s.key ? (P.accent || "#ff5a5f") : "transparent",
                color: size === s.key ? P.bg : P.faint,
                border: `1px solid ${size === s.key ? (P.accent || "#ff5a5f") : (P.border || P.rule)}`,
                fontSize: 10, padding: "1px 6px", cursor: "pointer",
              }}>{s.label}</button>
          ))}
          <button onClick={() => onChange({ href: '', title: '', description: '', image: '', siteName: '', size: '' })}
            style={{ background: "transparent", border: "none", color: P.faint, cursor: "pointer", marginLeft: "auto", fontSize: 12 }}>✕</button>
        </div>
        <div style={{
          border: `1px solid ${P.border || P.rule}`,
          display: "flex", flexDirection: isHero ? "column" : "row",
          overflow: "hidden", background: P.bgAlt || P.card,
        }}>
          {block.image && (
            <img src={block.image} alt="" style={{
              width: isHero ? "100%" : cur.imgW,
              height: cur.imgH,
              objectFit: "cover", flexShrink: 0,
            }} />
          )}
          <div style={{ padding: "10px 14px", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{block.title}</div>
            {block.description && size !== "sm" && (
              <div style={{ fontSize: 11, color: P.dim, marginBottom: 6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{block.description}</div>
            )}
            <div style={{ fontSize: 11, color: P.faint }}>{block.siteName || new URL(block.href).hostname}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, padding: "6px 0", alignItems: "center" }}>
      <span style={{ color: P.faint, fontSize: 12 }}>▣</span>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') fetchCard(); }}
        placeholder="URLを貼り付けてEnter..."
        style={{
          flex: 1, background: "transparent",
          border: `1px solid ${P.border || P.rule}`,
          color: P.text, fontFamily: mono, fontSize: 13,
          padding: "5px 10px", outline: "none",
        }}
      />
      <button onClick={() => fetchCard()}
        disabled={loading}
        style={{
          background: P.accent || P.coral || "#ff5a5f", color: P.bg,
          border: "none", fontFamily: mono, fontSize: 11,
          padding: "5px 12px", cursor: "pointer", opacity: loading ? 0.6 : 1,
        }}>{loading ? "..." : "取得"}</button>
    </div>
  );
}

function BlockContent({ P, block, idx, onChange, onKeyDown }) {
  const align = block.align || "left";
  const common = {
    "data-block-editable": true,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: (e) => onChange({ text: e.currentTarget.innerHTML }),
    onKeyDown,
    style: {
      outline: "none", width: "100%",
      color: P.text, minHeight: "1.6em",
      caretColor: P.accent || P.coral || "#ff5a5f",
      textAlign: align,
    },
    dangerouslySetInnerHTML: { __html: block.text || "" },
  };

  if (block.type === "h2") {
    return <h2 {...common} data-placeholder="見出し / Heading" style={{
      ...common.style, fontSize: 22, fontWeight: 600, margin: "16px 0 4px",
      letterSpacing: -0.3,
    }} />;
  }
  if (block.type === "quote") {
    return <blockquote {...common} data-placeholder="引用 / Quote" style={{
      ...common.style,
      borderLeft: `3px solid ${P.accent || P.coral || "#ff5a5f"}`,
      paddingLeft: 16, margin: "8px 0", fontStyle: "italic",
      color: P.dim,
    }} />;
  }
  if (block.type === "code") {
    return (
      <div style={{ margin: "6px 0" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: P.bgAlt || P.card || "#1a1a1e",
          border: `1px solid ${P.border || P.rule}`,
          borderBottom: "none",
          padding: "4px 10px",
        }}>
          <span style={{ fontSize: 10, color: P.faint, letterSpacing: 1 }}>lang</span>
          <select
            value={block.lang || "plaintext"}
            onChange={(e) => onChange({ lang: e.target.value })}
            style={{
              background: "transparent",
              color: P.accent || P.coral || "#ff5a5f",
              border: "none",
              fontFamily: "inherit", fontSize: 11,
              outline: "none", cursor: "pointer",
            }}
          >
            {["plaintext","javascript","typescript","python","rust","go","sql","bash","json","yaml","css","html","markdown"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: P.faint }}>// shift+enter for newline</span>
        </div>
        <pre {...common} onBlur={(e) => onChange({ text: e.currentTarget.innerText })} data-placeholder="// code" style={{
          ...common.style,
          background: P.bgAlt || P.card || "#1a1a1e",
          border: `1px solid ${P.border || P.rule}`,
          padding: 14, fontSize: 12,
          fontFamily: "inherit", whiteSpace: "pre-wrap",
          margin: 0,
          minHeight: "1.6em",
        }} />
      </div>
    );
  }
  if (block.type === "image") {
    return <ImageBlock P={P} block={block} onChange={onChange} />;
  }
  if (block.type === "bullet") {
    return (
      <div style={{ display: "flex", gap: 10, padding: "2px 0" }}>
        <span style={{ color: P.accent || P.coral || "#ff5a5f", paddingTop: 2 }}>•</span>
        <div {...common} data-placeholder="list item" style={{ ...common.style, flex: 1 }} />
      </div>
    );
  }
  if (block.type === "linkcard") {
    return <LinkCardBlock P={P} block={block} onChange={onChange} />;
  }
  if (block.type === "link") {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", flexWrap: "wrap" }}>
        <span style={{ color: P.faint, fontSize: 12 }}>⧉</span>
        <input
          value={block.text || ""}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="表示テキスト / Link label"
          style={{
            background: "transparent", border: "none",
            borderBottom: `1px solid ${P.border || P.rule}`,
            color: P.text, fontFamily: "inherit", fontSize: 14,
            padding: "2px 4px", outline: "none", minWidth: 120, flex: "0 1 auto",
          }}
        />
        <input
          value={block.href || ""}
          onChange={(e) => onChange({ href: e.target.value })}
          placeholder="https://..."
          style={{
            background: "transparent", border: "none",
            borderBottom: `1px solid ${P.accent || P.coral || "#ff5a5f"}55`,
            color: P.accent || P.coral || "#ff5a5f", fontFamily: "inherit", fontSize: 12,
            padding: "2px 4px", outline: "none", flex: 1, minWidth: 200,
          }}
        />
      </div>
    );
  }
  if (block.type === "divider") {
    return <hr style={{ border: "none", borderTop: `1px dashed ${P.border || P.rule}`, margin: "16px 0" }} />;
  }
  return <p {...common} data-placeholder="段落を書く... / Write a paragraph..." style={{
    ...common.style, margin: "4px 0", fontSize: 14, lineHeight: 1.7,
  }} />;
}

// ───────────────────────────────────────────────────────────
// Comments tab
// ───────────────────────────────────────────────────────────
function CommentsTab({ P, comments, setComments, posts }) {
  const [filter, setFilter] = React.useState("all"); // all | approved | pending | spam

  const updateStatus = async (id, status) => {
    try {
      await api.comments.updateStatus(id, status);
      setComments(prev => prev.map((c) => c.id === id ? { ...c, status } : c));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };
  const del = async (id) => {
    if (!confirm("このコメントを削除しますか?")) return;
    try {
      await api.comments.delete(id);
      setComments(prev => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete comment: " + err.message);
    }
  };

  const filtered = filter === "all" ? comments : comments.filter((c) => (c.status || 'pending') === filter);
  const counts = {
    all: comments.length,
    approved: comments.filter((c) => c.status === "approved").length,
    pending: comments.filter((c) => (c.status || "pending") === "pending").length,
    spam: comments.filter((c) => c.status === "spam").length,
  };

  return (
    <div>
      <AdminHeader P={P} title="コメント管理" subtitle={`${comments.length} total · approve, hide, mark as spam`} />

      <div style={{
        display: "flex", gap: 6, marginBottom: 20,
        paddingBottom: 14, borderBottom: `1px solid ${P.border || P.rule}`,
      }}>
        {[
          { k: "all", l: "all" },
          { k: "pending", l: "pending", color: "#ffb454" },
          { k: "approved", l: "approved", color: P.accentAlt || P.mint || "#3d7a55" },
          { k: "spam", l: "spam", color: "#ff6b6b" },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            style={{
              background: filter === f.k ? (f.color || P.accent || P.coral || "#ff5a5f") + "22" : "transparent",
              color: filter === f.k ? (f.color || P.accent || P.coral || "#ff5a5f") : P.dim,
              border: `1px solid ${filter === f.k ? (f.color || P.accent || P.coral || "#ff5a5f") + "55" : P.border || P.rule}`,
              fontFamily: "inherit", fontSize: 11,
              padding: "5px 10px", cursor: "pointer",
            }}
          >{f.l} <span style={{ opacity: 0.6 }}>{counts[f.k]}</span></button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((c) => {
          const post = posts.find((p) => p.id === c.post_id);
          const status = c.status || 'pending';
          const statusColor = status === "approved" ? (P.accentAlt || P.mint || "#3d7a55")
            : status === "pending" ? "#ffb454"
            : "#ff6b6b";
          return (
            <div key={c.id} style={{
              border: `1px solid ${P.border || P.rule}`,
              borderLeft: `3px solid ${statusColor}`,
              background: P.bgAlt || P.card || "transparent",
              padding: "14px 16px",
            }}>
              <div style={{
                display: "flex", gap: 10, alignItems: "baseline",
                fontSize: 11, color: P.faint, marginBottom: 6,
              }}>
                <span style={{ color: P.accent || P.coral || "#ff5a5f", fontWeight: 600 }}>@{c.author}</span>
                <span>·</span>
                <span>{c.date}</span>
                <span>·</span>
                <span style={{ color: P.dim }}>
                  on <span style={{ color: P.text }}>{post?.title_ja || "(deleted)"}</span>
                </span>
                <span style={{ marginLeft: "auto", color: statusColor, letterSpacing: 1, fontWeight: 600 }}>
                  [{status.toUpperCase()}]
                </span>
              </div>
              <div style={{ color: P.text, fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
                {c.text}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {status !== "approved" && (
                  <IconBtn P={P} onClick={() => updateStatus(c.id, "approved")} label>✓ approve</IconBtn>
                )}
                {status !== "pending" && (
                  <IconBtn P={P} onClick={() => updateStatus(c.id, "pending")} label>◐ hide</IconBtn>
                )}
                {status !== "spam" && (
                  <IconBtn P={P} onClick={() => updateStatus(c.id, "spam")} label>⚠ spam</IconBtn>
                )}
                <IconBtn P={P} onClick={() => del(c.id)} danger label>✕ delete</IconBtn>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: P.faint, fontSize: 13 }}>
            // no comments in this bucket.
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Profile tab
// ───────────────────────────────────────────────────────────
function ProfileTab({ P, profile, setProfile, onMetaChange }) {
  const fileRef = React.useRef(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

  const update = (k) => (e) => setProfile({ ...profile, [k]: e.target.value });

  const saveProfile = async (data) => {
    setSaving(true);
    try {
      await api.settings.save(data);
      window.BLOG_META = { ...window.BLOG_META, ...data };
      if (onMetaChange) onMetaChange(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("保存に失敗しました: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const onAvatarFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 256;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE; canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const next = { ...profile, avatar: dataUrl };
        setProfile(next);
        saveProfile(next);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <AdminHeader P={P} title="プロフィール編集" subtitle="changes apply site-wide after save" />

      <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
        {/* Avatar */}
        <div>
          <div style={{ fontSize: 10, color: P.faint, letterSpacing: 1, marginBottom: 8 }}>AVATAR</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{
              width: 80, height: 80,
              border: `1px solid ${P.border || P.rule}`,
              background: P.bgAlt || P.card,
              overflow: "hidden", flexShrink: 0,
            }}>
              {profile.avatar
                ? <img src={profile.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: P.faint, fontSize: 28 }}>◈</div>
              }
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={onAvatarFile} style={{ display: "none" }} />
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  background: P.accent || P.coral || "#ff5a5f", color: P.bg,
                  border: "none", fontFamily: mono, fontSize: 11, fontWeight: 600,
                  padding: "6px 14px", cursor: "pointer", letterSpacing: 0.5,
                }}
              >⬆ 画像をアップロード</button>
              {profile.avatar && (
                <button
                  onClick={() => { const next = { ...profile, avatar: "" }; setProfile(next); saveProfile(next); }}
                  style={{
                    background: "transparent", color: "#ff6b6b",
                    border: `1px solid #ff6b6b55`, fontFamily: mono, fontSize: 11,
                    padding: "4px 14px", cursor: "pointer",
                  }}
                >✕ 削除</button>
              )}
              <div style={{ fontSize: 10, color: P.faint }}>正方形推奨 · jpg/png/gif · 自動で256×256にリサイズ</div>
            </div>
          </div>
        </div>

        <Field P={P} label="name (ja)" hint="表示名(日本語)">
          <input value={profile.author_ja} onChange={update("author_ja")} style={inputStyle(P)} />
        </Field>
        <Field P={P} label="name (en)" hint="Display name (English)">
          <input value={profile.author_en} onChange={update("author_en")} style={inputStyle(P)} />
        </Field>
        <Field P={P} label="handle" hint="@shortname">
          <input value={profile.handle} onChange={update("handle")} style={inputStyle(P)} />
        </Field>
        <Field P={P} label="location">
          <input value={profile.location} onChange={update("location")} style={inputStyle(P)} />
        </Field>
        <Field P={P} label="bio (ja)" hint="日本語の自己紹介">
          <textarea value={profile.bio_ja} onChange={update("bio_ja")} rows={3}
            style={{ ...inputStyle(P), resize: "vertical", lineHeight: 1.6 }} />
        </Field>
        <Field P={P} label="bio (en)" hint="English bio">
          <textarea value={profile.bio_en} onChange={update("bio_en")} rows={3}
            style={{ ...inputStyle(P), resize: "vertical", lineHeight: 1.6 }} />
        </Field>
        <Field P={P} label="whoami (ja)" hint="Aboutページの自己紹介本文（日本語）">
          <textarea value={profile.whoami_ja} onChange={update("whoami_ja")} rows={4}
            style={{ ...inputStyle(P), resize: "vertical", lineHeight: 1.6 }} />
        </Field>
        <Field P={P} label="whoami (en)" hint="About page self-introduction (English)">
          <textarea value={profile.whoami_en} onChange={update("whoami_en")} rows={4}
            style={{ ...inputStyle(P), resize: "vertical", lineHeight: 1.6 }} />
        </Field>

        <button
          onClick={() => saveProfile(profile)}
          disabled={saving}
          style={{
            background: saved ? (P.accentAlt || P.mint || "#3d7a55") : (P.accent || P.coral || "#ff5a5f"),
            color: P.bg, border: "none", fontFamily: mono,
            fontSize: 12, fontWeight: 600, padding: "10px 20px",
            cursor: saving ? "not-allowed" : "pointer", letterSpacing: 0.5,
            opacity: saving ? 0.7 : 1, transition: "background 0.3s",
          }}
        >{saving ? "保存中..." : saved ? "✓ 保存しました" : "保存する"}</button>
      </div>
    </div>
  );
}

function Field({ P, label, hint, children }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <div>
        <span style={{ color: P.text, fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>{label}</span>
        {hint && <span style={{ color: P.faint, fontSize: 11, marginLeft: 8 }}>— {hint}</span>}
      </div>
      {children}
    </label>
  );
}
function inputStyle(P) {
  return {
    background: P.bgAlt || P.card || "transparent",
    border: `1px solid ${P.border || P.rule}`,
    color: P.text, fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 13, padding: "8px 12px", outline: "none",
    width: "100%", boxSizing: "border-box",
  };
}

// ───────────────────────────────────────────────────────────
// Shared helpers
// ───────────────────────────────────────────────────────────
function AdminHeader({ P, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, color: P.faint, letterSpacing: 2 }}>/ ADMIN</div>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, marginTop: 2 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: P.dim, marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}

function IconBtn({ P, onClick, children, title, danger, label }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "transparent",
        color: danger ? "#ff6b6b" : P.dim,
        border: `1px solid ${danger ? "#ff6b6b55" : P.border || P.rule}`,
        fontFamily: "inherit", fontSize: label ? 11 : 12,
        padding: label ? "3px 10px" : "4px 8px",
        cursor: "pointer", letterSpacing: 0.3,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = danger ? "#ff6b6b" : (P.accent || P.coral || "#ff5a5f");
        e.currentTarget.style.borderColor = danger ? "#ff6b6b" : (P.accent || P.coral || "#ff5a5f");
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = danger ? "#ff6b6b" : P.dim;
        e.currentTarget.style.borderColor = danger ? "#ff6b6b55" : (P.border || P.rule);
      }}
    >{children}</button>
  );
}

// ─── Image block ─────────────────────────────────────────
function ImageBlock({ P, block, onChange }) {
  const fileRef = React.useRef(null);
  const [tab, setTab] = React.useState(block.src ? null : "upload"); // upload | url | null (showing image)

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // 複数のサイズを生成してレスポンシブ対応
        const MAX_W_DESKTOP = 1200; // デスクトップ用最大幅
        const MAX_W_MOBILE = 600;   // モバイル用最大幅

        // デスクトップサイズ画像を生成
        let wDesktop = img.width, hDesktop = img.height;
        if (wDesktop > MAX_W_DESKTOP) {
          hDesktop = Math.round(hDesktop * MAX_W_DESKTOP / wDesktop);
          wDesktop = MAX_W_DESKTOP;
        }
        const canvasDesktop = document.createElement("canvas");
        canvasDesktop.width = wDesktop;
        canvasDesktop.height = hDesktop;
        canvasDesktop.getContext("2d").drawImage(img, 0, 0, wDesktop, hDesktop);
        const srcDesktop = canvasDesktop.toDataURL("image/jpeg", 0.82);

        // モバイルサイズ画像を生成
        let wMobile = img.width, hMobile = img.height;
        if (wMobile > MAX_W_MOBILE) {
          hMobile = Math.round(hMobile * MAX_W_MOBILE / wMobile);
          wMobile = MAX_W_MOBILE;
        }
        const canvasMobile = document.createElement("canvas");
        canvasMobile.width = wMobile;
        canvasMobile.height = hMobile;
        canvasMobile.getContext("2d").drawImage(img, 0, 0, wMobile, hMobile);
        const srcMobile = canvasMobile.toDataURL("image/jpeg", 0.82);

        onChange({
          srcSet: {
            desktop: srcDesktop,
            mobile: srcMobile,
          },
          alt: block.alt || f.name,
          origW: img.width,
          origH: img.height
        });
        setTab(null);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(f);
  };

  if (block.srcSet?.desktop && tab === null) {
    return (
      <div style={{ margin: "10px 0" }}>
        <div style={{
          position: "relative",
          border: `1px solid ${P.border || P.rule}`,
          background: P.bgAlt || P.card || "#1a1a1e",
          padding: 6,
        }}>
          <img src={block.srcSet.desktop} alt={block.alt || ""} style={{
            display: "block", maxWidth: "100%", height: "auto",
          }} />
          <div style={{
            position: "absolute", top: 10, right: 10, display: "flex", gap: 4,
          }}>
            <button
              onClick={() => setTab("upload")}
              style={{
                background: P.bg + "dd", color: P.text,
                border: `1px solid ${P.border || P.rule}`,
                fontFamily: "inherit", fontSize: 10,
                padding: "3px 8px", cursor: "pointer",
              }}
            >replace</button>
            <button
              onClick={() => onChange({ src: "", alt: "" })}
              style={{
                background: P.bg + "dd", color: "#ff6b6b",
                border: `1px solid #ff6b6b55`,
                fontFamily: "inherit", fontSize: 10,
                padding: "3px 8px", cursor: "pointer",
              }}
            >remove</button>
          </div>
        </div>
        <input
          value={block.alt || ""}
          onChange={(e) => onChange({ alt: e.target.value })}
          placeholder="alt text / caption..."
          style={{
            width: "100%", background: "transparent",
            border: "none", borderBottom: `1px dashed ${P.border || P.rule}`,
            color: P.dim, fontFamily: "inherit", fontSize: 11,
            fontStyle: "italic", textAlign: "center",
            padding: "6px 4px", outline: "none", marginTop: 2,
          }}
        />
      </div>
    );
  }

  // No image yet — show picker
  return (
    <div style={{
      margin: "10px 0",
      border: `2px dashed ${P.border || P.rule}`,
      padding: 24, textAlign: "center",
      background: P.bgAlt || P.card || "transparent",
    }}>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 16 }}>
        <button
          onClick={() => setTab("upload")}
          style={{
            background: tab === "upload" ? (P.accent || P.coral || "#ff5a5f") + "22" : "transparent",
            color: tab === "upload" ? (P.accent || P.coral || "#ff5a5f") : P.dim,
            border: `1px solid ${tab === "upload" ? (P.accent || P.coral || "#ff5a5f") + "55" : P.border || P.rule}`,
            fontFamily: "inherit", fontSize: 11,
            padding: "4px 12px", cursor: "pointer",
          }}
        >⬆ upload</button>
        <button
          onClick={() => setTab("url")}
          style={{
            background: tab === "url" ? (P.accent || P.coral || "#ff5a5f") + "22" : "transparent",
            color: tab === "url" ? (P.accent || P.coral || "#ff5a5f") : P.dim,
            border: `1px solid ${tab === "url" ? (P.accent || P.coral || "#ff5a5f") + "55" : P.border || P.rule}`,
            fontFamily: "inherit", fontSize: 11,
            padding: "4px 12px", cursor: "pointer",
          }}
        >⧉ URL</button>
      </div>

      {tab === "upload" && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              background: P.accent || P.coral || "#ff5a5f", color: P.bg,
              border: "none", fontFamily: "inherit", fontSize: 12,
              fontWeight: 600, padding: "10px 24px", cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >画像を選択 / CHOOSE FILE</button>
          <div style={{ fontSize: 11, color: P.faint, marginTop: 10 }}>
            jpg, png, gif, webp · 最大4MB
          </div>
        </div>
      )}

      {tab === "url" && (
        <div style={{ display: "flex", gap: 6, maxWidth: 420, margin: "0 auto" }}>
          <input
            autoFocus
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onChange({ src: e.currentTarget.value, alt: block.alt || "" });
                setTab(null);
              }
            }}
            onBlur={(e) => {
              if (e.currentTarget.value) {
                onChange({ src: e.currentTarget.value, alt: block.alt || "" });
                setTab(null);
              }
            }}
            style={{
              flex: 1, background: P.bg || "transparent",
              border: `1px solid ${P.border || P.rule}`,
              color: P.text, fontFamily: "inherit", fontSize: 12,
              padding: "6px 10px", outline: "none",
            }}
          />
        </div>
      )}
    </div>
  );
}

// Placeholder styling for contentEditable blocks
const style = document.createElement("style");
style.textContent = `
  [data-block-editable]:empty:before {
    content: attr(data-placeholder);
    color: rgba(120,120,130,0.5);
    font-style: italic;
    pointer-events: none;
  }
  [data-block-editable] a { color: #ff5a5f; text-decoration: underline; }
`;
document.head.appendChild(style);

Object.assign(window, { AdminPage, ImageBlock });

export default AdminPage;
