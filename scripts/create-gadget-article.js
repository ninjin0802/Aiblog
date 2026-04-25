#!/usr/bin/env node
const article = {
  id: 'gadgets-2026-04-24',
  title_ja: '2026年4月24日のガジェット最新情報まとめ',
  title_en: 'Gadget News Roundup: April 24, 2026',
  date: '2026-04-24',
  category: 'ガジェット',
  tags: ['ガジェット', 'スマホ', 'AI', 'Samsung', 'Google', 'HTC', 'ソフトバンク'],
  read_time: 6,
  excerpt_ja: 'Natural AI Phoneの発売、Galaxy A57 5G、VIVE Eagle AIグラスなど、2026年4月24日のガジェット業界の最新動向をまとめました。',
  excerpt_en: 'Coverage of Natural AI Phone launch, Galaxy A57 5G, VIVE Eagle AI glasses, and other gadget industry updates from April 24, 2026.',
  status: 'published',
  blocks: [
    { type: 'h2', text_ja: 'はじめに', text_en: 'Introduction' },
    { type: 'p', text_ja: '2026年4月24日、ガジェット業界では多くの注目製品が発表されました。ソフトバンクのNatural AI Phone、サムスンのGalaxy A57、HTC NIPPONのVIVE Eagleなど、AI技術を搭載した次世代デバイスが続々と登場しています。', text_en: 'On April 24, 2026, many notable products were announced in the gadget industry. Natural AI Phone from SoftBank, Galaxy A57 5G from Samsung, and VIVE Eagle from HTC NIPPON, among others, are making their debut as next-generation devices equipped with AI technology.' },
    { type: 'divider' },

    { type: 'h2', text_ja: 'Natural AI Phone - ソフトバンク独占販売', text_en: 'Natural AI Phone - SoftBank Exclusive' },
    { type: 'p', text_ja: 'ソフトバンクが2026年4月24日から、米Brain Technologiesが開発したAI搭載スマートフォン「Natural AI Phone」を1年間の独占販売権を獲得しました。', text_en: 'From April 24, 2026, SoftBank has obtained a one-year exclusive sales right for the AI-equipped smartphone "Natural AI Phone" developed by Brain Technologies of the United States.' },
    { type: 'bullet', text_ja: '価格：93,600円（税込）', text_en: 'Price: ¥93,600 (tax included)' },
    { type: 'bullet', text_ja: 'OS：Android 15', text_en: 'OS: Android 15' },
    { type: 'bullet', text_ja: 'CPU：Snapdragon 7s Gen 3（オクタコア、最大2.5GHz）', text_en: 'CPU: Snapdragon 7s Gen 3 (octa-core, max 2.5GHz)' },
    { type: 'bullet', text_ja: 'RAM / ROM：12GB / 256GB', text_en: 'RAM / ROM: 12GB / 256GB' },
    { type: 'bullet', text_ja: 'ディスプレイ：6.77インチ AMOLED、フルHD+（2392×1080）、120Hz', text_en: 'Display: 6.77-inch AMOLED, Full HD+ (2392×1080), 120Hz' },
    { type: 'bullet', text_ja: 'カメラ：メイン・望遠・5,000万画素＋800万画素トリプル、フロント3,200万画素', text_en: 'Camera: Main, telephoto 50MP + 8MP triple, front 32MP' },
    { type: 'bullet', text_ja: 'バッテリー：5,000mAh、充電時間約78分（USB Type-C PD-PPS対応）', text_en: 'Battery: 5,000mAh, charging time approx. 78 minutes (USB Type-C PD-PPS compatible)' },
    { type: 'bullet', text_ja: 'サイズ・重量：約78×164×8.3mm / 約200g', text_en: 'Size/Weight: approx. 78×164×8.3mm / approx. 200g' },
    { type: 'p', text_ja: 'この端末の最大の特徴は、ユーザーの意図を予測・理解して操作をサポートするAI機能です。例えば、Googleカレンダーでスケジュールを確認して飲食店を予約し、LINEで同行者に送信するなど、複数のアプリをまたがる作業をNatural AIでまとめて実行できます。', text_en: 'The main feature of this device is the AI capability that predicts and understands user intentions to support operations. For example, you can seamlessly execute multiple tasks that span different apps with Natural AI, such as checking schedules on Google Calendar to make restaurant reservations and sending messages to companions on LINE.' },
    { type: 'link', href: 'https://www.softbank.jp/corp/news/press/sbkk/2026/20260417_03/', text_ja: '出典: ソフトバンク株式会社 - プレスリリース', text_en: 'Source: SoftBank Corp. - Press Release' },

    { type: 'divider' },

    { type: 'h2', text_ja: 'Galaxy A57 5G - 超薄ボディーと大容量バッテリー', text_en: 'Galaxy A57 5G - Ultra-thin Body and Large Battery' },
    { type: 'p', text_ja: 'サムスン電子が2026年4月23日にSIMロックフリーモデル「Samsung Galaxy A57 5G」の予約受付を開始しました。価格は7万9,800円で、4月24日から各店舗やECサイトでの販売が開始されています。', text_en: 'Samsung Electronics started accepting reservations for the SIM-free model "Samsung Galaxy A57 5G" on April 23, 2026. The price is ¥79,800, and sales began at various stores and EC sites from April 24.' },
    { type: 'image', src: '/images/articles/galaxy-a57.svg', alt: 'Galaxy A57 5G' },
    { type: 'bullet', text_ja: '約6.9mmボディーで従来比約13％薄型化', text_en: 'Approx. 6.9mm body, 13% thinner than previous model' },
    { type: 'bullet', text_ja: '5000mAhバッテリー搭載、約30分で最大60％充電可能', text_en: '5,000mAh battery, can charge up to 60% in about 30 minutes' },
    { type: 'bullet', text_ja: '1200万画素超広角カメラ＋5000万画素マクロカメラの3眼構成', text_en: '12MP ultra-wide-angle camera + 50MP macro camera 3-eye configuration' },
    { type: 'p', text_ja: '急速充電システムにより、約10分で50％充電でき、一日を通して快適に使用できます。最大連続通話時間は36時間、最大待受時間は680時間という優れたスペックを誇ります。', text_en: 'With the fast charging system, you can charge up to 50% in about 10 minutes, allowing comfortable use throughout the day. It boasts excellent specs with a maximum continuous call time of 36 hours and maximum standby time of 680 hours.' },
    { type: 'link', href: 'https://topics.smt.docomo.ne.jp/article/itmedia_mobile/trend/itmedia_mobile-20260416_077?fm=latestnews', text_ja: '出典: ITmedia Mobile', text_en: 'Source: ITmedia Mobile' },

    { type: 'divider' },

    { type: 'h2', text_ja: 'VIVE Eagle - AIグラスの進化', text_en: 'VIVE Eagle - Evolution of AI Glasses' },
    { type: 'p', text_ja: 'HTC NIPPONが2026年4月24日から、日常に溶け込むAIグラス「VIVE Eagle」の販売を開始しました。通勤時や旅行先で、周囲の音や状況をハンズフリーで把握できたり、音声で瞬間を自然に撮影できる新しい体験を提供します。', text_en: 'HTC NIPPON started sales of "VIVE Eagle," AI glasses that blend into daily life from April 24, 2026. It provides a new experience where you can grasp ambient sounds and situations hands-free during commutes or travel, and capture natural moments with your voice.' },
    { type: 'image', src: '/images/articles/vive-eagle.svg', alt: 'VIVE Eagle' },
    { type: 'bullet', text_ja: '音声で「Hey VIVE, take a photo」と指示するだけで、印象的な瞬間を一人称視点で撮影可能', text_en: 'Just say "Hey VIVE, take a photo" to capture memorable moments from a first-person perspective' },
    { type: 'bullet', text_ja: 'AIアシスタントでメニュー翻訳、レシピ提案、最新ニュースの確認などをサポート', text_en: 'AI assistant supports menu translation, recipe suggestions, checking latest news, and more' },
    { type: 'bullet', text_ja: '235mAhバッテリーで最大36時間の連続使用が可能', text_en: '235mAh battery enables up to 36 hours of continuous use' },
    { type: 'p', text_ja: 'デザイン性が高く評価され、Red Dot Award: Product Design 2026を受賞。クイックコントロールボタンでAIアシスタントを起動でき、日常から快適に使用できます。', text_en: 'The high design quality was highly evaluated, winning Red Dot Award: Product Design 2026. You can launch the AI assistant with a quick control button for comfortable daily use.' },
    { type: 'link', href: 'https://www.iza.ne.jp/press/release/prtimes/4YXX6QK2YJNXZPPUHBOY6AIHT4/', text_ja: '出典: SANKEI DIGITAL INC. - プレスリリース', text_en: 'Source: SANKEI DIGITAL INC. - Press Release' },

    { type: 'divider' },

    { type: 'h2', text_ja: 'Google Pixel 10a - カメラへの不満', text_en: 'Google Pixel 10a - Camera Issues' },
    { type: 'p', text_ja: 'Googleが79,900円から発売した「Pixel 10a」について、カメラが「完全フラット」でないという問題が報告されています。8万円台の価格設定に対する不満もあり、判断が遅れた理由と分析されています。', text_en: 'Regarding "Pixel 10a" released by Google for ¥79,900, issues have been reported that the camera is not "completely flat." There are also complaints about the pricing in the ¥80,000 range, and analysis of why the decision was delayed.' },
    { type: 'bullet', text_ja: '値上げに動いたソフトバンク、判断が遅れた理由はどこに', text_en: 'SoftBank raising prices, why the decision was delayed' },
    { type: 'bullet', text_ja: 'Google Pixel 10a、カメラが飛び出ていない、8万円台で割高感', text_en: 'Google Pixel 10a, camera not popping out, overpriced at ¥80,000' },
    { type: 'bullet', text_ja: 'iPhone 17e用ケースならESR！', text_en: 'ESR if you have an iPhone 17!' },
    { type: 'p', text_ja: '他にも、LGの34型曲面スマートモニターやRingの再発明など、多様なガジェットニュースがありました。特にAI搭載デバイスの増加傾向が顕著で、従来のスマートフォンからAI対応端末への切り替えが加速しています。', text_en: 'There were also various gadget news items, such as LG\'s 34-inch curved smart monitors and Ring\'s re-invention. The trend of AI-equipped devices is notably prominent, accelerating the switch from traditional smartphones to AI-capable devices.' },
    { type: 'link', href: 'https://gadget.phileweb.com/', text_ja: '出典: Gadget Gate', text_en: 'Source: Gadget Gate' },

    { type: 'divider' },

    { type: 'h2', text_ja: 'まとめ', text_en: 'Conclusion' },
    { type: 'p', text_ja: '2026年4月24日は、ガジェット業界にとって重要な日となりました。Natural AI PhoneのようなAI搭載スマートフォン、Galaxy A57のような薄型大容量モデル、VIVE EagleのようなAIグラスなど、AI技術を活用した製品が続々と登場しています。', text_en: 'April 24, 2026 was an important day for the gadget industry. Products utilizing AI technology are making their debut one after another, such as Natural AI Phone with AI capabilities, Galaxy A57 as a thin large-capacity model, and VIVE Eagle as AI glasses.' },
    { type: 'p', text_ja: 'AIは単なるカメラの画素数競争から、ユーザーの意図を理解してサポートする機能へと進化しています。今後はAIを活用した「だれでもAI」体験が標準になるかもしれません。', text_en: 'AI is evolving from simple camera megapixel competition to functionality that understands and supports user intentions. In the future, an "AI for everyone" experience utilizing AI might become the standard.' },
  ]
};

export { article };

console.log(JSON.stringify(article, null, 2));
