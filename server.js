require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { readings } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Gemini AI setup ──
const MODEL_FALLBACK = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
];

let genAI = null;
if (process.env.GOOGLE_AI_KEY && process.env.GOOGLE_AI_KEY !== 'your_google_ai_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
}

// Try each model in fallback order; returns { text, model } or throws
async function generateWithFallback(prompt, apiKey) {
  const client = apiKey ? new GoogleGenerativeAI(apiKey) : genAI;
  if (!client) throw new Error('未設定 API Key');
  let lastErr;
  for (const modelName of MODEL_FALLBACK) {
    try {
      const m = client.getGenerativeModel({ model: modelName });
      const result = await m.generateContent(prompt);
      const text = result.response.text();
      console.log(`[AI] 使用模型：${modelName}`);
      return { text, model: modelName };
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('503') || msg.includes('overloaded') ||
          msg.includes('429') || msg.includes('quota') ||
          msg.includes('UNAVAILABLE') || msg.includes('Resource has been exhausted')) {
        console.warn(`[AI] ${modelName} 過載，切換下一個...`);
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// ════════════════════════════════════════════════════════
// API: 儲存占卦記錄
// POST /api/readings
// ════════════════════════════════════════════════════════
app.post('/api/readings', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  const { question, main_hex, main_name, lines, changed_hex, changed_name, cast_method, ganzhi_info } = req.body;
  if (!main_hex || !main_name || !lines) return res.status(400).json({ error: '缺少必要欄位' });

  const doc = {
    user_id: userId,
    created_at: new Date().toISOString(),
    question: question || '',
    main_hex,
    main_name,
    lines: Array.isArray(lines) ? lines : JSON.parse(lines),
    changed_hex: changed_hex || null,
    changed_name: changed_name || null,
    ai_interp: null,
    cast_method: cast_method || 'coins',
    ganzhi_info: ganzhi_info || null,
  };

  try {
    const inserted = await readings.insertAsync(doc);
    res.json({ id: inserted._id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// API: 取得歷史記錄
// GET /api/readings?page=1&limit=20
// ════════════════════════════════════════════════════════
app.get('/api/readings', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const query = { user_id: userId };

  try {
    const total = await readings.countAsync(query);
    const rows = await readings
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .execAsync();

    const data = rows.map(r => ({
      id: r._id,
      created_at: r.created_at,
      question: r.question,
      main_hex: r.main_hex,
      main_name: r.main_name,
      changed_hex: r.changed_hex,
      changed_name: r.changed_name,
      lines: r.lines,
      cast_method: r.cast_method,
      ganzhi_info: r.ganzhi_info,
      has_ai: r.ai_interp ? 1 : 0,
    }));

    res.json({ total, page, limit, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// API: 取得單筆記錄
// GET /api/readings/:id
// ════════════════════════════════════════════════════════
app.get('/api/readings/:id', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  try {
    const row = await readings.findOneAsync({ _id: req.params.id, user_id: userId });
    if (!row) return res.status(404).json({ error: '找不到記錄' });
    res.json({ ...row, id: row._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// API: AI 解卦
// POST /api/ai-interpret
// ════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════
// API: 測試 API Key
// POST /api/ai-test
// ════════════════════════════════════════════════════════
app.post('/api/ai-test', async (req, res) => {
  const apiKey = req.body.api_key;
  if (!apiKey) return res.status(400).json({ error: '請提供 api_key' });
  try {
    const { model } = await generateWithFallback('請回覆「OK」兩個字即可。', apiKey);
    res.json({ ok: true, model });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.post('/api/ai-interpret', async (req, res) => {
  const apiKey = req.headers['x-api-key'] || '';
  // return_prompt_only 不需要 API Key
  if (!req.body.return_prompt_only && !genAI && !apiKey) {
    return res.status(503).json({ error: '未設定 Google AI Key，請點右上角 ⚙ 設定' });
  }

  const { reading_id, question, category, inclination, worry, reaction, ai_style,
          main_hex, main_name, guaci, virtue, modern,
          changing_lines, changed_hex, changed_name, changed_guaci, ganzhi_info } = req.body;

  const changingDesc = changing_lines && changing_lines.length > 0
    ? `動爻：${changing_lines.map(l => l.name + '（' + l.text + '）').join('、')}`
    : '無動爻（靜卦）';

  const ganzhiDesc = ganzhi_info
    ? `\n占卦時辰：${ganzhi_info.year}年 ${ganzhi_info.month}月 ${ganzhi_info.day}日 ${ganzhi_info.hour}時（${ganzhi_info.shichen}）`
    : '';

  const changedDesc = changed_hex
    ? `\n之卦：第${changed_hex}卦《${changed_name}》，卦辭：${changed_guaci}`
    : '';

  const categoryDesc = category ? `\n問事類別：${category}` : '';
  const inclinationDesc = inclination ? `\n目前傾向：${inclination}` : '';
  const worryDesc = worry ? `\n最擔心的是：${worry}` : '';
  const reactionMap = { relieved:'鬆了一口氣', disappointed:'有點失望', confused:'有點疑惑', agree:'完全認同' };
  const reactionDesc = reaction ? `\n看到卦象的第一反應：${reactionMap[reaction] || reaction}` : '';

  const contextBlock = `【問事】${question || '（未填寫問題，請就卦象做全面分析）'}${categoryDesc}${ganzhiDesc}${inclinationDesc}${worryDesc}${reactionDesc}

【本卦】第${main_hex}卦《${main_name}》
卦辭：${guaci}
核心精神：${virtue}
現代意涵：${modern}

【爻動情況】${changingDesc}${changedDesc}`;

  const stylePrompts = {
    friend: `你是一位友善、睿智的易經老師，擅長用現代人能理解的語言解讀古老智慧。有人來問卦，請像面對面談話一樣，給出溫暖且實用的解讀。

${contextBlock}

請用繁體中文，按以下格式回覆（語氣親切易懂，像朋友給建議，不要太文言文）：

⭐ 整體運勢：（只寫「大吉」「吉」「平」「待觀察」「宜謹慎」其中一個）

💬 一句話說重點
用一句話，說出這個卦對問卦者最重要的啟示。

📖 卦象怎麼說
用2段話，結合問事內容，解釋這個卦的意思。語氣像朋友解釋，不要背書。

🎯 動爻在提示什麼${changing_lines && changing_lines.length > 0 ? '\n說明動爻帶來的變化方向和具體提示。' : '\n（此次為靜卦，無動爻，請說明靜卦的意義。）'}

✅ 建議你這樣做
寫3條實際可行的建議，每條一句話，要具體，讓人看完知道怎麼做。

⚠️ 特別提醒
最重要的一條注意事項。

請盡量深入詳細，不要自行限制字數。`,

    strict: `你是一位嚴謹的易經學者，精通《周易》原典及歷代注疏（王弼、程頤、朱熹等），以傳統學術角度解卦。

${contextBlock}

請用繁體中文，按以下格式回覆（文辭典雅，引用原典，深度解析）：

⭐ 整體運勢：（只寫「大吉」「吉」「平」「待觀察」「宜謹慎」其中一個）

💬 一句話說重點
以一句精煉的話，道出此卦對問卦者最核心的啟示。

📖 卦象本義
從卦名字義、卦德、上下卦象關係入手，闡述此卦的根本義理，引用卦辭原文加以詮釋。

🎯 爻動之義${changing_lines && changing_lines.length > 0 ? '\n就動爻之位、爻辭義理，析論變爻所示的吉凶悔吝及應對之道。' : '\n（靜卦，六爻安靜，就卦象整體義理論述。）'}

✅ 處世之道
依據卦義，提出切合當前問事的具體建議，務求實際可行。

⚠️ 戒慎之處
引用卦爻辭或易理，點出最需警惕之處。

請盡量深入詳細，不要自行限制字數。`,

    strategy: `你是一位結合易經智慧與現代決策思維的策略顧問。你的解讀聚焦於實際行動，幫助問卦者做出最佳決策。

${contextBlock}

請用繁體中文，按以下格式回覆（語氣直接、重點清晰、聚焦行動）：

⭐ 整體運勢：（只寫「大吉」「吉」「平」「待觀察」「宜謹慎」其中一個）

💬 策略核心
一句話點出這個局面的關鍵變數。

📖 形勢研判
從卦象分析當前形勢：優勢在哪、阻力在哪、時機如何。要具體、不泛泛而談。

🎯 關鍵動作${changing_lines && changing_lines.length > 0 ? '\n動爻代表形勢正在變化，說明這個轉折點最應該做什麼、避免什麼。' : '\n（靜卦代表形勢穩定，說明在這個穩定局面下的最佳策略。）'}

✅ 行動清單
列出優先行動，每個都要有明確的「做什麼」和「為什麼」，格式：行動 → 原因。

⚠️ 風險預警
點出最大的策略風險，以及如何提前防範。

請盡量深入詳細，不要自行限制字數。`,
  };

  const prompt = stylePrompts[ai_style] || stylePrompts.friend;

  // 僅回傳 prompt（供複製）
  if (req.body.return_prompt_only) {
    return res.json({ prompt });
  }

  try {
    const { text, model } = await generateWithFallback(prompt, apiKey);

    if (reading_id) {
      const userId = req.headers['x-user-id'] || 'anonymous';
      await readings.updateAsync({ _id: reading_id, user_id: userId }, { $set: { ai_interp: text } });
    }

    res.json({ interpretation: text, model });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ error: 'AI 解卦失敗：' + err.message });
  }
});

// ════════════════════════════════════════════════════════
// API: 命卦 AI 解析
// POST /api/ai-mingua
// ════════════════════════════════════════════════════════
app.post('/api/ai-mingua', async (req, res) => {
  const apiKey = req.headers['x-api-key'] || '';
  if (!genAI && !apiKey) {
    return res.status(503).json({ error: '未設定 Google AI Key，請點右上角 ⚙ 設定' });
  }

  const { type, ...data } = req.body;
  let prompt = '';

  if (type === 'bagua') {
    // 八宅命卦
    const { gua_num, gua_name, gua_sym, element, dir, group_name, trait,
            lucky, unlucky, year, gender } = data;
    const luckyStr  = lucky.map(d  => `${d.type}（${d.gua}・${d.dir}）`).join('、');
    const unluckyStr= unlucky.map(d => `${d.type}（${d.gua}・${d.dir}）`).join('、');

    prompt = `你是一位精通八宅風水的命理老師，擅長以現代語言解說命卦與方位的實際應用。

【命主資料】
出生年份：${year} 年　性別：${gender === 'male' ? '男' : '女'}
命卦：${gua_sym} ${gua_name}命（卦${gua_num}）
所屬：${group_name}　五行：${element}　本命方：${dir}
命格特質：「${trait}」

【四吉方】${luckyStr}
【四凶方】${unluckyStr}

請用繁體中文，以親切易懂的方式，依下列格式回覆：

💡 命格總覽
用2-3句話說明這個命卦的核心特質，以及此命格的人生主軸與天賦。

🧭 方位活用指南
依四吉方（生氣→天醫→延年→伏位）說明各方位的具體用途，例如：睡眠頭向、辦公桌朝向、開門方位、求財方向等，每個方位用一句話說明。

⚠️ 四凶方避忌
依四凶方（絕命→五鬼→六煞→禍害）說明應避免的情境，簡潔一句話各一條。

🤝 命格相合
說明${group_name}的人與哪些命格相合、相剋，以及在感情、合作上的參考。

✨ 開運重點
給出3條針對此命格最實用的開運建議，要具體（不要泛泛「多行善」）。

請盡量深入詳細，語氣溫暖實用，不要自行限制字數。`;

  } else if (type === 'meihua') {
    // 梅花易數本命卦
    const { hex_num, hex_name, guaci, virtue, modern,
            up_name, up_sym, lo_name, lo_sym,
            mov_line, zhi_num, zhi_name, zhi_guaci,
            year, month, day, shichen_name } = data;

    prompt = `你是一位精通梅花易數的易學老師，擅長以本命卦解析一個人的先天性格、命運格局與人生方向。

【命主生辰】${year}年${month}月${day}日 ${shichen_name}時
【本命卦】第${hex_num}卦《${hex_name}》${up_sym}${lo_sym}
上卦：${up_name}　下卦：${lo_name}　動爻：第${mov_line}爻
卦辭：${guaci}
核心精神：${virtue}
現代意涵：${modern}
【之卦】第${zhi_num}卦《${zhi_name}》，卦辭：${zhi_guaci}

請用繁體中文，依下列格式回覆（語氣深刻而不艱澀）：

💫 本命格局
用2-3句話點出這個卦賦予命主的先天氣質、人生主題與命運底色。

🔑 核心性格
從上下卦的五行屬性與卦象，分析命主的性格特質（優勢與盲點各點出2項）。

🌊 動爻啟示
第${mov_line}爻為本命動爻，說明這條爻對命主的人生帶來什麼流動性與轉化力。

🔄 之卦方向
本命卦化入《${zhi_name}》，說明命主的生命進化方向與晚年格局。

🗺️ 人生建議
給出3條最切合此本命卦的人生指引，要具體實用（事業、關係、處世各一條）。

請盡量深入詳細，文字優美而有深度，不要自行限制字數。`;
  } else {
    return res.status(400).json({ error: '未知命卦類型' });
  }

  try {
    const { text, model } = await generateWithFallback(prompt, apiKey);
    res.json({ interpretation: text, model });
  } catch (err) {
    console.error('命卦AI error:', err.message);
    res.status(500).json({ error: 'AI 解析失敗：' + err.message });
  }
});

// ════════════════════════════════════════════════════════
// API: 傳統六爻 AI 解析（接受預建 prompt）
// POST /api/ai-raw
// ════════════════════════════════════════════════════════
app.post('/api/ai-raw', async (req, res) => {
  const apiKey = req.headers['x-api-key'] || '';
  if (!genAI && !apiKey) {
    return res.status(503).json({ error: '未設定 Google AI Key，請點右上角 ⚙ 設定' });
  }
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: '缺少 prompt' });
  try {
    const { text, model } = await generateWithFallback(prompt, apiKey);
    res.json({ interpretation: text, model });
  } catch (err) {
    console.error('ai-raw error:', err.message);
    res.status(500).json({ error: 'AI 解析失敗：' + err.message });
  }
});

// ════════════════════════════════════════════════════════
// API: 刪除記錄
// DELETE /api/readings/:id
// ════════════════════════════════════════════════════════
app.delete('/api/readings/:id', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  try {
    const removed = await readings.removeAsync({ _id: req.params.id, user_id: userId }, {});
    if (removed === 0) return res.status(403).json({ error: '無權限刪除此記錄' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// API: 系統狀態
// GET /api/status
// ════════════════════════════════════════════════════════
app.get('/api/status', async (req, res) => {
  try {
    const count = await readings.countAsync({});
    res.json({
      ai_enabled: !!genAI,
      total_readings: count,
      version: '1.0.0'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║    易經占卦系統 已啟動               ║`);
  console.log(`║    http://localhost:${PORT}            ║`);
  console.log(`║    AI解卦：${genAI ? '✓ 已啟用' : '✗ 未設定 API Key'}         ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});
