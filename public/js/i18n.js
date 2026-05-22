// ══════════════════════════════════════
// 多語言翻譯系統
// ══════════════════════════════════════
const I18N = {
  zh: {
    // Splash
    'splash.title':  '易 經 占 卦 系 統',
    'splash.sub':    '周易六十四卦全解 · 結合現代生活的決策反思工具',
    'splash.credit': '台南小莊製作 · 純屬娛樂',
    'splash.btn':    '開　始　占　卦',

    // Header / Nav
    'logo':          '☯ 易經占卦',
    'nav.cast':      '起卦',
    'nav.index':     '卦象索引',
    'nav.history':   '歷史記錄',
    'nav.mingua':    '命卦',

    // Cast page — guide
    'guide.header':  '📋 起卦前請閱讀',
    'guide.s1.title':'① 釐清並設定明確問題（最重要）',
    'guide.s2.title':'② 靜心與環境準備',
    'guide.s3.title':'③ 幫別人算時',

    // Cast page — question card
    'q.about':       '這件事關於⋯',
    'cat.career':    '💼 事業',
    'cat.love':      '❤️ 感情',
    'cat.finance':   '💰 財務',
    'cat.health':    '🌿 健康',
    'cat.social':    '🤝 人際',
    'cat.other':     '📝 其他',
    'q.label':       '你想問的是⋯',
    'q.placeholder': '描述你的狀況或問題（可留空）',
    'proxy.toggle':  '幫別人算',
    'proxy.caster':  '弟子姓名（你自己）',
    'proxy.subject': '被問者姓名（對方）',
    'optional.toggle':'＋ 補充背景，讓 AI 解讀更準確（選填）',
    'q.lean':        '你現在傾向怎麼做？（說出心裡的預設答案）',
    'q.worry':       '你最擔心的是什麼？',

    // Cast methods
    'method.label':  '起卦方式',
    'method.coins':  '🪙 三枚銅錢',
    'method.manual': '✍️ 手動輸入',

    // Buttons
    'btn.cast':      '起卦',
    'btn.save':      '💾 儲存記錄',
    'btn.ai':        '✦ AI 深度解卦',
    'btn.trad':      '☯ 傳統六爻解析',
    'btn.copy.ai':   '📋 複製一般解析指令',
    'btn.copy.trad': '📋 複製六爻解析指令',
    'btn.export':    '🖼 導出卦象圖',
    'btn.export.trad':'📜 導出六爻解析圖',
    'btn.reset':     '↺ 重新起卦',

    // AI style
    'style.friend':  '🌱 朋友風格',
    'style.strict':  '📜 傳統學術',
    'style.strategy':'⚔️ 策略顧問',

    // Reaction
    'reaction.label':'看到卦，你的第一感受？',
    'reaction.0':    '😮‍💨 鬆了一口氣',
    'reaction.1':    '😔 有點失望',
    'reaction.2':    '🤔 有點疑惑',
    'reaction.3':    '👍 完全認同',

    // History
    'hist.title':    '歷史記錄',
    'hist.empty':    '尚無記錄，起卦後可儲存。',
    'hist.delete':   '確定刪除這筆記錄？',

    // Mingua
    'mingua.title':  '命卦推算',

    // Settings
    'set.title':     '⚙ 系統設定',
    'set.key.label': 'Google AI API Key',
    'set.save':      '儲存並啟用',
    'set.cancel':    '取消',
    'set.guide.title':'📖 如何免費取得 Google AI Key？',
    'set.model.label':'AI 模型（自動切換）',

    // AI notes
    'ai.note.general':'💡 一般解析：讀卦意思，給感悟與方向',
    'ai.note.trad':  '💡 傳統六爻：論斷吉凶、人事、時機',

    // Status
    'save.msg.ok':   '✓ 已儲存於裝置',
    'save.msg.fail': '儲存失敗',
    'hist.stats':    '筆記錄（存於裝置）',
  },

  en: {
    // Splash
    'splash.title':  'I  C H I N G  O R A C L E',
    'splash.sub':    '64 Hexagrams of the I Ching · A Modern Divination & Reflection Tool',
    'splash.credit': 'Made by Tainan Zhuang · For Entertainment',
    'splash.btn':    'Begin Divination',

    // Header / Nav
    'logo':          '☯ I Ching Oracle',
    'nav.cast':      'Divination',
    'nav.index':     'Hexagram Index',
    'nav.history':   'History',
    'nav.mingua':    'Life Gua',

    // Cast page — guide
    'guide.header':  '📋 Before You Begin',
    'guide.s1.title':'① Clarify Your Question (Most Important)',
    'guide.s2.title':'② Calm Your Mind & Prepare',
    'guide.s3.title':'③ Casting for Someone Else',

    // Cast page — question card
    'q.about':       'This is about...',
    'cat.career':    '💼 Career',
    'cat.love':      '❤️ Love',
    'cat.finance':   '💰 Finance',
    'cat.health':    '🌿 Health',
    'cat.social':    '🤝 Social',
    'cat.other':     '📝 Other',
    'q.label':       'Your question is...',
    'q.placeholder': 'Describe your situation or question (optional)',
    'proxy.toggle':  'Casting for Others',
    'proxy.caster':  'Your name (the caster)',
    'proxy.subject': 'Their name (the subject)',
    'optional.toggle':'＋ Add context for better AI insight (optional)',
    'q.lean':        'What are you leaning toward? (your gut feeling)',
    'q.worry':       'What are you most worried about?',

    // Cast methods
    'method.label':  'Casting Method',
    'method.coins':  '🪙 Three Coins',
    'method.manual': '✍️ Manual Input',

    // Buttons
    'btn.cast':      'Cast Hexagram',
    'btn.save':      '💾 Save Reading',
    'btn.ai':        '✦ AI Deep Analysis',
    'btn.trad':      '☯ Traditional Six-Line Analysis',
    'btn.copy.ai':   '📋 Copy General Analysis Prompt',
    'btn.copy.trad': '📋 Copy Six-Line Prompt',
    'btn.export':    '🖼 Export Hexagram Image',
    'btn.export.trad':'📜 Export Six-Line Analysis Image',
    'btn.reset':     '↺ New Reading',

    // AI style
    'style.friend':  '🌱 Friendly',
    'style.strict':  '📜 Traditional Scholar',
    'style.strategy':'⚔️ Strategy Advisor',

    // Reaction
    'reaction.label':'Your first feeling upon seeing the hexagram?',
    'reaction.0':    '😮‍💨 Relieved',
    'reaction.1':    '😔 Disappointed',
    'reaction.2':    '🤔 Confused',
    'reaction.3':    '👍 Totally agree',

    // History
    'hist.title':    'Reading History',
    'hist.empty':    'No readings yet. Cast a hexagram and save it.',
    'hist.delete':   'Delete this reading?',

    // Mingua
    'mingua.title':  'Life Gua Calculator',

    // Settings
    'set.title':     '⚙ Settings',
    'set.key.label': 'Google AI API Key',
    'set.save':      'Save & Activate',
    'set.cancel':    'Cancel',
    'set.guide.title':'📖 How to get a free Google AI Key?',
    'set.model.label':'AI Model (auto-select)',

    // AI notes
    'ai.note.general':'💡 General: Interprets the hexagram meaning & gives guidance',
    'ai.note.trad':  '💡 Traditional: Six-line divination — fortune, people & timing',

    // Status
    'save.msg.ok':   '✓ Saved to your device',
    'save.msg.fail': 'Save failed',
    'hist.stats':    'readings (stored on device)',
  },

  ja: {
    // Splash
    'splash.title':  '易 経 占 卦 シ ス テ ム',
    'splash.sub':    '周易六十四卦完全解説 · 現代生活のための決断省察ツール',
    'splash.credit': '台南・小荘製作 · 娯楽目的のみ',
    'splash.btn':    '占　卦　を　始　め　る',

    // Header / Nav
    'logo':          '☯ 易経占卦',
    'nav.cast':      '占卦',
    'nav.index':     '卦象索引',
    'nav.history':   '履歴',
    'nav.mingua':    '命卦',

    // Cast page — guide
    'guide.header':  '📋 占卦前にお読みください',
    'guide.s1.title':'① 質問を明確にする（最重要）',
    'guide.s2.title':'② 心を落ち着かせ環境を整える',
    'guide.s3.title':'③ 他人のために占う場合',

    // Cast page — question card
    'q.about':       'これは何についてですか...',
    'cat.career':    '💼 仕事',
    'cat.love':      '❤️ 恋愛',
    'cat.finance':   '💰 財務',
    'cat.health':    '🌿 健康',
    'cat.social':    '🤝 人間関係',
    'cat.other':     '📝 その他',
    'q.label':       '聞きたいことは...',
    'q.placeholder': '状況や質問を記述（省略可）',
    'proxy.toggle':  '他人のために占う',
    'proxy.caster':  'あなたの名前（占者）',
    'proxy.subject': '相手の名前（対象者）',
    'optional.toggle':'＋ 背景情報を追加してAI解析を精度アップ（任意）',
    'q.lean':        '今どちらに傾いていますか？（直感・本音）',
    'q.worry':       '最も心配していることは？',

    // Cast methods
    'method.label':  '起卦方法',
    'method.coins':  '🪙 三枚のコイン',
    'method.manual': '✍️ 手動入力',

    // Buttons
    'btn.cast':      '卦を立てる',
    'btn.save':      '💾 記録を保存',
    'btn.ai':        '✦ AI詳細解析',
    'btn.trad':      '☯ 伝統六爻解析',
    'btn.copy.ai':   '📋 一般解析プロンプトをコピー',
    'btn.copy.trad': '📋 六爻解析プロンプトをコピー',
    'btn.export':    '🖼 卦象画像を出力',
    'btn.export.trad':'📜 六爻解析画像を出力',
    'btn.reset':     '↺ 新しく占う',

    // AI style
    'style.friend':  '🌱 フレンドリー',
    'style.strict':  '📜 伝統学術',
    'style.strategy':'⚔️ 戦略アドバイザー',

    // Reaction
    'reaction.label':'卦を見た第一感は？',
    'reaction.0':    '😮‍💨 ほっとした',
    'reaction.1':    '😔 少し残念',
    'reaction.2':    '🤔 少し混乱',
    'reaction.3':    '👍 完全に同意',

    // History
    'hist.title':    '占卦履歴',
    'hist.empty':    '記録がありません。占卦後に保存してください。',
    'hist.delete':   'この記録を削除しますか？',

    // Mingua
    'mingua.title':  '命卦計算',

    // Settings
    'set.title':     '⚙ システム設定',
    'set.key.label': 'Google AI APIキー',
    'set.save':      '保存して有効化',
    'set.cancel':    'キャンセル',
    'set.guide.title':'📖 無料Google AIキーの取得方法',
    'set.model.label':'AIモデル（自動選択）',

    // AI notes
    'ai.note.general':'💡 一般解析：卦の意味を読み解き、方向性を示す',
    'ai.note.trad':  '💡 伝統六爻：吉凶・人事・時機を直接判断',

    // Status
    'save.msg.ok':   '✓ デバイスに保存しました',
    'save.msg.fail': '保存失敗',
    'hist.stats':    '件の記録（デバイス保存）',
  }
};

// ── 取得翻譯文字 ──
function t(key) {
  const lang = window._lang || 'zh';
  return (I18N[lang] && I18N[lang][key]) || (I18N['zh'] && I18N['zh'][key]) || key;
}

// ── 套用語言到 DOM ──
function applyLang(lang) {
  window._lang = lang;
  localStorage.setItem('yijing_lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-TW' : lang === 'ja' ? 'ja' : 'en';

  const set = (id, key, attr) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (attr) el[attr] = t(key);
    else el.textContent = t(key);
  };
  const setQ = (id, key) => set(id, key, 'placeholder');

  // Splash
  set('splash-title', 'splash.title');
  set('splash-sub', 'splash.sub');
  set('splash-credit', 'splash.credit');
  set('splash-btn', 'splash.btn');

  // Logo
  set('logo', 'logo');

  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const page = btn.dataset.page;
    const key = 'nav.' + page;
    if (t(key) !== key) btn.textContent = t(key);
  });

  // Guide header
  set('guide-header-text', 'guide.header');

  // Category buttons
  const catMap = { '事業':'cat.career','感情':'cat.love','財務':'cat.finance','健康':'cat.health','人際':'cat.social','其他':'cat.other' };
  document.querySelectorAll('.cat-btn').forEach(btn => {
    const cat = btn.dataset.cat;
    if (catMap[cat]) btn.textContent = t(catMap[cat]);
  });

  // Question card labels
  set('q-about-label', 'q.about');
  set('q-section-label', 'q.label');
  setQ('q-input', 'q.placeholder');
  setQ('proxy-caster', 'proxy.caster');
  setQ('proxy-subject', 'proxy.subject');
  setQ('q-lean', 'q.lean');
  setQ('q-worry', 'q.worry');

  // Proxy toggle
  const proxyToggle = document.getElementById('proxy-toggle');
  if (proxyToggle) {
    const icon = proxyToggle.querySelector('#proxy-toggle-icon');
    const iconText = icon ? icon.textContent : '';
    proxyToggle.innerHTML = `<span id="proxy-toggle-icon">${iconText}</span> ${t('proxy.toggle')}`;
  }

  // Optional toggle
  const optToggle = document.getElementById('q-optional-toggle');
  if (optToggle) {
    const icon = optToggle.querySelector('#q-toggle-icon');
    const iconText = icon ? icon.textContent : '＋';
    optToggle.innerHTML = `<span id="q-toggle-icon">${iconText}</span> ${t('optional.toggle').replace('＋ ','')}`;
  }

  // Method buttons
  set('btn-coins', 'method.coins');
  set('btn-manual', 'method.manual');

  // Action buttons
  set('ai-btn', 'btn.ai');
  set('trad-ai-btn', 'btn.trad');
  set('copy-ai-prompt-btn', 'btn.copy.ai');
  set('copy-prompt-btn', 'btn.copy.trad');
  set('btn-save', 'btn.save');
  set('btn-export-card', 'btn.export');
  set('btn-export-trad', 'btn.export.trad');
  set('btn-reset', 'btn.reset');

  // AI style buttons
  document.querySelectorAll('.style-btn').forEach(btn => {
    const s = btn.dataset.style;
    const key = 'style.' + s;
    if (t(key) !== key) btn.textContent = t(key);
  });

  // Reaction label
  set('reaction-label', 'reaction.label');
  document.querySelectorAll('.rxn-btn').forEach((btn, i) => {
    const key = 'reaction.' + i;
    if (t(key) !== key) btn.textContent = t(key);
  });

  // Settings
  set('settings-title', 'set.title');
  set('set-key-label', 'set.key.label');
  set('btn-save-key', 'set.save');
  set('btn-cancel-settings', 'set.cancel');
  set('set-model-label', 'set.model.label');

  // AI notes
  set('ai-note-general', 'ai.note.general');
  set('ai-note-trad', 'ai.note.trad');

  // Lang switcher active state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// ── 初始化語言 ──
function initLang() {
  const saved = localStorage.getItem('yijing_lang') || 'zh';
  applyLang(saved);
}
