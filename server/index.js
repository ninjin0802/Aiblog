import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import sharp from 'sharp';
import pool from './db.js';
import postsRouter from './routes/posts.js';
import commentsRouter from './routes/comments.js';
import authRouter from './routes/auth.js';
import settingsRouter from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  xContentTypeOptions: true,
  referrerPolicy: { policy: 'no-referrer-when-downgrade' },
}));

// CORS - allow only same origin and Railway deployment
const allowedOrigins = [
  'https://ninjin.up.railway.app',
  'http://localhost:5173',
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const SITE_URL = 'https://ninjin.up.railway.app';

// Refresh font cache and locate CJK font file for SVG @font-face
try { execSync('fc-cache -fv', { stdio: 'ignore' }); } catch {}
function findCjkFont() {
  const candidates = [
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJKjp-Regular.otf',
    '/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc',
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  // fallback: search
  try {
    const dirs = ['/usr/share/fonts/opentype/noto', '/usr/share/fonts/noto-cjk', '/usr/share/fonts'];
    for (const d of dirs) {
      if (!existsSync(d)) continue;
      const f = readdirSync(d).find((n) => /noto.*cjk.*\.(ttc|otf)/i.test(n));
      if (f) return join(d, f);
    }
  } catch {}
  return null;
}
const CJK_FONT_PATH = findCjkFont();
console.log('CJK font path:', CJK_FONT_PATH);

// Sitemap — must be before static/catch-all
app.get('/sitemap.xml', async (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  let rows = [];
  try {
    const result = await pool.query(
      `SELECT id, date FROM posts WHERE status = 'published' ORDER BY date DESC`
    );
    rows = result.rows;
  } catch (_) {}
  const staticPages = ['', '/about', '/archive'];
  const urls = [
    ...staticPages.map((p) => `\n  <url><loc>${SITE_URL}${p}</loc><changefreq>weekly</changefreq></url>`),
    ...rows.map((p) => `\n  <url><loc>${SITE_URL}/?post=${encodeURIComponent(p.id)}</loc><lastmod>${p.date}</lastmod><changefreq>monthly</changefreq></url>`),
  ];
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}\n</urlset>`);
});

// RSS feed
app.get('/feed.xml', async (req, res) => {
  let rows = [];
  try {
    const result = await pool.query(
      `SELECT id, title_ja, title_en, date, excerpt_ja, excerpt_en, blocks
       FROM posts WHERE status = 'published' ORDER BY date DESC LIMIT 20`
    );
    rows = result.rows;
  } catch (_) {}
  const escape = (s) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const items = rows.map((p) => {
    const text = escape((p.excerpt_ja || p.excerpt_en || '').slice(0, 300));
    return `\n  <item>
    <title>${escape(p.title_ja || p.title_en)}</title>
    <link>${SITE_URL}/?post=${encodeURIComponent(p.id)}</link>
    <guid>${SITE_URL}/?post=${encodeURIComponent(p.id)}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${text}</description>
  </item>`;
  });
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.end(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>にんじんAI開発日記</title>
    <link>${SITE_URL}</link>
    <description>にんじんのAI開発ブログ</description>
    <language>ja</language>${items.join('')}
  </channel>
</rss>`);
});

// OG card fetch
app.get('/api/og', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    // Own blog: query DB directly instead of HTTP round-trip
    const selfUrl = new URL(url);
    if (selfUrl.hostname === new URL(SITE_URL).hostname && selfUrl.searchParams.has('post')) {
      const postId = selfUrl.searchParams.get('post');
      const { rows } = await pool.query(
        `SELECT title_ja, title_en, excerpt_ja, excerpt_en, blocks FROM posts WHERE id = $1`,
        [postId]
      );
      const post = rows[0];
      if (post) {
        const imgBlock = (post.blocks || []).find((b) => b.type === 'image' && b.src?.startsWith('http'));
        return res.json({
          url,
          title: post.title_ja || post.title_en || '',
          description: post.excerpt_ja || post.excerpt_en || '',
          image: imgBlock?.src || '',
          siteName: 'にんじんAI開発日記',
        });
      }
    }
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });
    const html = await resp.text();

    // Parse all <meta> tags into a map
    const meta = {};
    const tagRe = /<meta\s([^>]+?)(?:\s*\/)?>/gi;
    let m;
    while ((m = tagRe.exec(html)) !== null) {
      const attrs = m[1];
      const attrRe = /(\w[\w:-]*)=(?:"([^"]*)"|'([^']*)')/gi;
      const map = {};
      let a;
      while ((a = attrRe.exec(attrs)) !== null) {
        map[a[1].toLowerCase()] = a[2] ?? a[3] ?? '';
      }
      const key = map.property || map.name;
      if (key && map.content !== undefined) meta[key.toLowerCase()] = map.content;
    }

    const decode = (s) => (s || '').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
    const titleTag = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '');

    // Resolve relative image URL
    let image = decode(meta['og:image'] || meta['twitter:image'] || '');
    if (image && !image.startsWith('http')) {
      try { image = new URL(image, url).href; } catch { image = ''; }
    }

    res.json({
      url,
      title: decode(meta['og:title'] || meta['twitter:title'] || titleTag),
      description: decode(meta['og:description'] || meta['twitter:description'] || meta['description'] || ''),
      image,
      siteName: decode(meta['og:site_name'] || ''),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);

// OGP image generation
const xmlEsc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function wrapTitle(title, maxLen = 18) {
  const lines = [];
  let t = title;
  while (t.length > maxLen) { lines.push(t.slice(0, maxLen)); t = t.slice(maxLen); }
  if (t) lines.push(t);
  return lines.slice(0, 3);
}

const CAT_MAP = { '日常': 'diary', '技術': 'tech', '雑記': 'misc', '開発': 'dev', 'AI': 'AI' };

app.get('/api/og-image/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT title_ja, title_en, category, date FROM posts WHERE id=$1 AND status='published'`,
      [req.params.id]
    );
    const p = rows[0];
    if (!p) return res.status(404).end();

    const jaLines = wrapTitle(p.title_ja || p.title_en || 'Untitled');
    const enLines = p.title_en && p.title_en !== p.title_ja ? wrapTitle(p.title_en, 28) : [];
    const totalLines = jaLines.length;
    const centerY = 300 - (totalLines - 1) * 38;
    const MONO = "'Courier New',monospace";
    const CJK_FAMILY = CJK_FONT_PATH
      ? 'NotoSansCJK'
      : "'Noto Sans CJK JP','Noto Sans JP',sans-serif";
    const fontFaceBlock = CJK_FONT_PATH
      ? `<defs><style>@font-face{font-family:'NotoSansCJK';src:url('file://${CJK_FONT_PATH}');font-weight:400 700;}</style></defs>`
      : '';

    const titleSvg = jaLines.map((l, i) =>
      `<text x="80" y="${centerY + i * 76}" font-family="${CJK_FAMILY}" font-size="66" font-weight="700" fill="#f0f2f7">${xmlEsc(l)}</text>`
    ).join('\n  ');
    const enY = centerY + totalLines * 76 + 6;
    const enSvg = enLines.map((l, i) =>
      `<text x="82" y="${enY + i * 28}" font-family="${MONO}" font-size="22" fill="#4a5470" font-style="italic">${xmlEsc(l)}</text>`
    ).join('\n  ');

    const catDisplay = p.category ? '  .  ' + (CAT_MAP[p.category] || p.category) : '';

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  ${fontFaceBlock}
  <rect width="1200" height="630" fill="#13161d"/>
  <rect x="0" y="0" width="6" height="630" fill="#ff5a5f"/>
  <rect x="80" y="530" width="1040" height="1" fill="#1e2534"/>
  <text x="80" y="76" font-family="${MONO}" font-size="13" fill="#3a4259" letter-spacing="3">// ninjin AI dev blog</text>
  <rect x="80" y="100" width="48" height="3" fill="#ff5a5f"/>
  ${titleSvg}
  ${enSvg}
  <text x="80" y="572" font-family="${MONO}" font-size="13" fill="#2e3650">${xmlEsc(p.date)}${xmlEsc(catDisplay)}</text>
  <text x="1120" y="572" font-family="${MONO}" font-size="13" fill="#2e3650" text-anchor="end">ninjin.up.railway.app</text>
</svg>`;

    let png;
    try {
      png = await sharp(Buffer.from(svg)).png().toBuffer();
    } catch (sharpErr) {
      console.error('sharp SVG→PNG error:', sharpErr.message);
      // Fallback: solid dark rectangle
      png = await sharp({ create: { width: 1200, height: 630, channels: 3, background: { r: 19, g: 22, b: 29 } } }).png().toBuffer();
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(png);
  } catch (e) {
    console.error('og-image error:', e.message);
    res.status(500).end();
  }
});

// SVG MIME type fix for static files
app.use('/images', (req, res, next) => {
  if (req.path.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml');
  }
  next();
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf-8');

  // OG meta injection for post URLs — must be before express.static
  app.get('/', async (req, res) => {
    const postId = req.query.post;
    if (!postId) return res.send(indexHtml);
    try {
      const { rows } = await pool.query(
        `SELECT title_ja, title_en, excerpt_ja, excerpt_en, blocks FROM posts WHERE id = $1 AND status = 'published'`,
        [postId]
      );
      const post = rows[0];
      if (!post) return res.send(indexHtml);

      const title = (post.title_ja || post.title_en || '').replace(/"/g, '&quot;');
      const desc = (post.excerpt_ja || post.excerpt_en || '').replace(/"/g, '&quot;');
      const ogImage = `${SITE_URL}/api/og-image/${encodeURIComponent(postId)}`;
      const url = `${SITE_URL}/?post=${encodeURIComponent(postId)}`;

      const ogTags = `
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:site_name" content="にんじんAI開発日記" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${ogImage}" />
    <title>${title} — にんじんAI開発日記</title>`;

      const html = indexHtml
        .replace('<title>にんじんAI開発日記</title>', ogTags);
      res.send(html);
    } catch {
      res.send(indexHtml);
    }
  });

  app.use(express.static(distPath));
  app.get('/{*path}', (_, res) => res.send(indexHtml));
}

// DB migration on startup
async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title_ja TEXT,
      title_en TEXT,
      date TEXT,
      category TEXT,
      tags TEXT[],
      read_time INT DEFAULT 1,
      excerpt_ja TEXT,
      excerpt_en TEXT,
      blocks JSONB DEFAULT '[]',
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
      author TEXT,
      text TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE comments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
    CREATE TABLE IF NOT EXISTS admin_auth (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'
    );
  `);
}

migrate()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((e) => { console.error('Migration failed:', e); process.exit(1); });
