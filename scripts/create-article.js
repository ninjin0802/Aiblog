#!/usr/bin/env node
const article = {
  id: 'ai-news-2026-04-24',
  title_ja: '2026年4月24日のAI最新ニュースまとめ',
  title_en: 'AI News Roundup: April 24, 2026',
  date: '2026-04-24',
  category: 'AI',
  tags: ['AI', 'GPT', 'LLM', 'OpenAI', 'Google', 'NTT', '東京大学', '医療AI', '画像生成', 'エージェント'],
  read_time: 8,
  excerpt_ja: 'OpenAIのGPT-5.5、東京大学の医療特化型LLM、ChatGPT Images 2.0など、2026年4月24日のAI業界の最新動向をまとめました。',
  excerpt_en: 'Coverage of OpenAI\'s GPT-5.5, UTokyo\'s medical LLM, ChatGPT Images 2.0, and other AI industry updates from April 24, 2026.',
  status: 'published',
  blocks: [
    { type: 'h2', text: 'はじめに' },
    { type: 'p', text: '2026年4月24日、AI業界では多くの重要な発表がありました。OpenAIのGPT-5.5、東京大学松尾研の医療特化型LLM、ChatGPT Images 2.0など、今回のニュースを振り返ります。' },
    { type: 'divider' },

    { type: 'h2', text: 'OpenAI GPT-5.5発表' },
    { type: 'p', text: 'OpenAIが「GPT-5.5」を投入しました。GPT-5.4のリリースからちょうど7週間後の発表で、コーディングや研究、エージェント機能が強化されています。' },
    { type: 'image', src: '/images/articles/gpt-55.svg', alt: 'GPT-5.5' },
    { type: 'p', text: '今回のアップデートでは、複雑な視覚処理タスクや長時間のタスク処理能力が向上しました。特にコーディング支援と研究用途で顕著な性能向上が見られます。' },

    { type: 'divider' },

    { type: 'h2', text: '東京大学 松尾研の医療LLM' },
    { type: 'p', text: '東京大学松尾・岩澤研究室が、Qwen-2.5-72B-Instructをベースにした日本語版医療特化型LLMを開発しました。2025年医師国家試験ベンチマークで93.3%の正答率を記録し、GPT-4oやOpenAI-o1を上回る性能を示しています。' },
    { type: 'image', src: '/images/articles/medical-llm.svg', alt: '医療LLMのイメージ' },
    { type: 'p', text: 'このモデルは「Weblab-MedLLM-Qwen-2.5-109B-Instruct」と呼ばれ、日本国内の医療制度に関する知識を備えています。研究目的限定で研究者向けに提供されます。' },

    { type: 'divider' },

    { type: 'h2', text: 'ChatGPT Images 2.0発表' },
    { type: 'p', text: 'OpenAIが「ChatGPT Images 2.0」を発表しました。日本語を含む高度なテキスト描写能力が強化され、ポスターや製品ロゴなどのデザインにおいて実用性が向上しました。' },
    { type: 'image', src: '/images/articles/images-2.svg', alt: 'ChatGPT Images 2.0' },
    { type: 'p', text: '標準的なタイポグラフィ評価で約99%に達する文字描画精度を誇り、従来モデル比で約2倍に向上した生成速度を実現しました。日本語・韓国語をはじめとする非ラテン文字圏言語の文字描画が強化されています。' },

    { type: 'divider' },

    { type: 'h2', text: 'Codexの大幅アップデート' },
    { type: 'p', text: 'OpenAIがAIコーディングエージェント「Codex」を大幅アップデートしました。PCを直接操作する新機能が追加され、単なるコード生成から、汎用的な作業エージェントへと進化しました。' },
    { type: 'image', src: '/images/articles/codex.svg', alt: 'Codexデスクトップアプリ' },
    { type: 'bullet', text: 'デスクトップ上のアプリ操作が可能' },
    { type: 'bullet', text: 'アプリ内ブラウザの搭載' },
    { type: 'bullet', text: 'メモリ機能の追加（プレビュー版）' },
    { type: 'bullet', text: '90以上の追加プラグイン' },
    { type: 'p', text: '現在、Codexの週間アクティブユーザー数は300万人を超えており、その約半数がコーディング以外の業務自動化に活用しています。' },

    { type: 'divider' },

    { type: 'h2', text: 'Google Gemini Enterprise Agent Platform' },
    { type: 'p', text: 'Googleが「Gemini Enterprise Agent Platform」を発表しました。ローコードでビジュアルにAIエージェントを開発できる「Agent Studio」を備えています。' },
    { type: 'image', src: '/images/articles/gemini-platform.svg', alt: 'Gemini Enterprise Agent Platform' },
    { type: 'bullet', text: 'AIエージェントのビジュアル開発（Agent Studio）' },
    { type: 'bullet', text: 'コードによる開発（ADK）' },
    { type: 'bullet', text: '複数エージェントのオーケストレーション' },
    { type: 'bullet', text: 'セキュアかつスケーラブルな実行環境' },
    { type: 'p', text: 'このプラットフォームは、AIエージェントがデータベースやSaaS、ドキュメントストアへアクセスするための接続機能、スキルのレジストリ、サードパーティによるAIエージェントのマーケットプレイスなどを備えています。' },

    { type: 'divider' },

    { type: 'h2', text: 'NTTのトークン共通化技術' },
    { type: 'p', text: 'NTTが、LLMにおけるトークンの語彙を精度劣化なく縮小させ、異なるLLM間でもトークン語彙を共通化できる技術を確立しました。' },
    { type: 'p', text: 'これまで、複数のLLMを用いてアンサンブルに代表される推論時連携を実現するには、各LLMのトークン語彙が一致している必要がありました。本技術によりその制約が解消され、任意の異種LLM間で、これまで困難だったアンサンブルやポータブルチューニングなど様々な推論時連携が可能となりました。' },
    { type: 'p', text_ja: '本成果は、2026年4月23日から27日まで、ブラジル・リオデジャネイロで開催される深層学習分野における最難関国際会議ICLR 2026にて発表されます。', text_en: 'This achievement will be presented at ICLR 2026, one of the most challenging international conferences in the deep learning field, held in Rio de Janeiro, Brazil from April 23-27, 2026.' },

    { type: 'divider' },

    { type: 'h2', text: 'まとめ' },
    { type: 'p', text: '2026年4月24日は、AI業界にとって非常に重要な日となりました。GPT-5.5のような高性能モデル、医療特化型LLM、画像生成の進化、エージェント技術の成熟、企業向けプラットフォームの登場、トークン共通化技術など、多岐にわたる進展が見られました。' },
    { type: 'p', text: 'AIは単なるモデルの性能競争から、企業や個人の業務に深く組み込まれるインフラ化が急速に進んでいます。今後の動向に注目が必要です。' },
  ]
};

export { article };

console.log(JSON.stringify(article, null, 2));
