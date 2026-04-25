#!/usr/bin/env node
import dotenv from 'dotenv';
import axios from 'axios';
import { createHash } from 'crypto';

dotenv.config();

const API_BASE = process.env.API_BASE || 'https://ninjin.up.railway.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function login() {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      password: ADMIN_PASSWORD
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ ログイン失敗:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

async function postArticle(token, article) {
  try {
    const response = await axios.post(`${API_BASE}/api/posts`, article, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ 記事投稿失敗:', error.response?.data?.error || error.message);
    if (error.response?.status === 401) {
      console.error('認証エラー: トークンが無効または期限切れです');
    }
    process.exit(1);
  }
}

async function main() {
  if (!ADMIN_PASSWORD) {
    console.error('❌ ADMIN_PASSWORD環境変数が設定されていません');
    console.error('設定方法: export ADMIN_PASSWORD=your_password');
    process.exit(1);
  }

  console.log(`📡 APIサーバー: ${API_BASE}`);

  console.log('🔐 ログイン中...');
  const token = await login();
  console.log('✅ ログイン成功');

  console.log('📝 記事データ作成中...');
  const { article } = await import('./create-gadget-article.js');

  console.log(`📰 タイトル: ${article.title_ja}`);
  console.log(`📰 Title: ${article.title_en}`);
  console.log(`📅 日付: ${article.date}`);
  console.log(`🏷️ カテゴリ: ${article.category}`);
  console.log(`🏷️ タグ: ${article.tags.join(', ')}`);
  console.log(`📖 読了時間: ${article.read_time} min`);
  console.log(`📄 ブロック数: ${article.blocks.length}`);

  console.log('📤 記事投稿中...');
  const result = await postArticle(token, article);

  console.log('✅ 記事投稿成功!');
  console.log(`📝 記事ID: ${result.id}`);
  console.log(`🔗 URL: ${API_BASE}/?post=${encodeURIComponent(result.id)}`);

  console.log('\n🎉 完了! 記事がブログに公開されました。');
}

main().catch((error) => {
  console.error('💥 予期せぬエラー:', error);
  process.exit(1);
});
