import React from 'react'
import './App.css'
import { api } from './api.js'
import VariantA, { VA } from '../components/variant-a.jsx'
import VariantB, { VB } from '../components/variant-b.jsx'
import VariantC, { VC } from '../components/variant-c.jsx'
import PostView from '../components/post-view.jsx'
import { AboutPage, ArchivePage } from '../components/about-archive.jsx'
import AdminAuthGate from '../components/admin-auth.jsx'

function getPalette(variant, dark) {
  if (variant === "a") return dark ? VA : (VA.light ?? VA);
  if (variant === "b") return dark ? VB : (VB.light ?? VB);
  if (variant === "c") return dark ? (VC.dark ?? VC) : VC;
  return VA;
}

const TWEAKS = { variant: "b", dark: false };

function App() {
  const [posts, setPosts] = React.useState([]);
  const [meta, setMeta] = React.useState(window.BLOG_META ?? {});
  const [loading, setLoading] = React.useState(true);
  const [variant, setVariant] = React.useState(() =>
    localStorage.getItem("blog:variant") || TWEAKS.variant
  );
  const [dark, setDark] = React.useState(() => {
    const saved = localStorage.getItem("blog:dark");
    return saved ? saved === "1" : TWEAKS.dark;
  });
  const [route, setRoute] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("blog:route") || '{"name":"home"}'); }
    catch { return { name: "home" }; }
  });

  React.useEffect(() => { localStorage.setItem("blog:variant", variant); }, [variant]);
  React.useEffect(() => { localStorage.setItem("blog:dark", dark ? "1" : "0"); }, [dark]);
  React.useEffect(() => { localStorage.setItem("blog:route", JSON.stringify(route)); }, [route]);

  // Handle GitHub OAuth callback token in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('github_token');
    if (token) {
      localStorage.setItem('blog:jwt', token);
      window.history.replaceState({}, '', '/');
      setRoute({ name: 'admin' });
    } else if (params.get('github_error')) {
      window.history.replaceState({}, '', '/');
      setRoute({ name: 'admin' });
    }
  }, []);

  // Load posts and settings from API
  React.useEffect(() => {
    Promise.all([
      api.posts.list().catch(() => []),
      api.settings.get().catch(() => ({})),
    ]).then(([posts, settings]) => {
      setPosts(posts);
      window.BLOG_POSTS = posts;
      if (settings && Object.keys(settings).length > 0) {
        const merged = { ...window.BLOG_META, ...settings };
        window.BLOG_META = merged;
        setMeta(merged);
      }
    }).finally(() => setLoading(false));
  }, []);

  const palette = getPalette(variant, dark);
  const openPost = (postId) => setRoute({ name: "post", postId });
  const goHome = () => setRoute({ name: "home" });

  const handlePostsChange = async () => {
    const data = await api.posts.list();
    setPosts(data);
    window.BLOG_POSTS = data;
  };

  if (loading) return (
    <div style={{ background: "#0b0d10", color: "#d7dde3", minHeight: "100%", display: "grid", placeItems: "center", fontFamily: "monospace" }}>
      loading...
    </div>
  );

  let content;
  if (route.name === "post") {
    const post = posts.find((p) => p.id === route.postId) || posts[0];
    if (!post) { goHome(); content = null; }
    else content = <PostView post={post} palette={palette} dark={dark} onBack={goHome} variant={variant} />;
  } else if (route.name === "about") {
    content = <AboutPage palette={palette} onBack={goHome} posts={posts} meta={meta} />;
  } else if (route.name === "archive") {
    content = <ArchivePage palette={palette} onBack={goHome} onPostClick={openPost} posts={posts} />;
  } else if (route.name === "admin") {
    content = <AdminAuthGate palette={palette} onBack={goHome} onOpenPost={openPost} onPostsChange={handlePostsChange}
      onMetaChange={(data) => { const m = { ...window.BLOG_META, ...data }; window.BLOG_META = m; setMeta(m); }} />;
  } else {
    const common = {
      dark, onPostClick: openPost,
      onToggleDark: () => setDark((d) => !d),
      onNavigate: (name) => setRoute({ name }),
      activePostId: route.postId,
      posts, meta,
    };
    if (variant === "a") content = <VariantA {...common} />;
    else if (variant === "b") content = <VariantB {...common} />;
    else content = <VariantC {...common} />;
  }

  return (
    <>
      <div className="chrome">
        {["a", "b", "c"].map((v) => (
          <button key={v} className={variant === v ? "active" : ""}
            onClick={() => { setVariant(v); setRoute({ name: "home" }); }}>
            <span className="label-full">
              {v === "a" && "A · $HOME/log"}
              {v === "b" && "B · MAIN"}
              {v === "c" && "C · static.md"}
            </span>
            <span className="label-short">{v.toUpperCase()}</span>
          </button>
        ))}
        <span className="chrome-sep" />
        <button onClick={goHome} className={route.name === "home" ? "active" : ""}>home</button>
        <button onClick={() => posts[0] && setRoute({ name: "post", postId: posts[0].id })} className={route.name === "post" ? "active" : ""}>post</button>
        <button onClick={() => setRoute({ name: "about" })} className={route.name === "about" ? "active" : ""}>about</button>
        <button onClick={() => setRoute({ name: "archive" })} className={route.name === "archive" ? "active" : ""}>arch</button>
        <button onClick={() => setRoute({ name: "admin" })} className={route.name === "admin" ? "active" : ""}>admin</button>
      </div>
      {content}
    </>
  );
}

export default App
