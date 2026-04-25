import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.BLOG_META = window.BLOG_META ?? {
  author_ja: "ninjin",
  author_en: "ninjin",
  bio_ja: "AIを使った開発・ブロガー",
  bio_en: "blogger",
  stats: { posts: 0, subscribers: 0, words_ja: 0, words_en: 0 },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)