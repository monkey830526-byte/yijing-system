/* ════════════════════════════════════════════════════════
   app.js — 易經占卦系統前端主邏輯
════════════════════════════════════════════════════════ */
const App = (() => {

  // ── State ──
  let state = {
    method: 'coins',
    castLines: [],
    castStep: 0,
    manualVals: [7,7,7,7,7,7],
    currentReadingId: null,
    histPage: 1,
    indexFilter: '',
    indexUpFilter: '',
    trigFilterActive: null,
    category: '',
    reaction: '',
    aiStyle: 'friend',
    minguaGender: 'male',
    tcaTimer: null,   // 時辰起卦過場計時器 ID
    proxyMode: false, // 幫別人算
    guideOpen: true,  // 起卦守則預設展開
  };

  // ── 命卦資料（八宅命卦，東四命 / 西四命）──
  // 吉方：生氣 > 天醫 > 延年 > 伏位
  // 凶方：絕命 > 五鬼 > 六煞 > 禍害
  const MINGUA_DATA = {
    1:{ name:'坎', sym:'☵', dir:'正北', element:'水', group:'east', groupName:'東四命',
        trait:'智慧通達，善於在艱難中尋找出路，應變靈活，處變不驚',
        lucky:[
          {type:'生氣', typeCls:'shengqi', gua:'巽', sym:'☴', dir:'東南'},
          {type:'天醫', typeCls:'tianyi',  gua:'震', sym:'☳', dir:'正東'},
          {type:'延年', typeCls:'yannian', gua:'離', sym:'☲', dir:'正南'},
          {type:'伏位', typeCls:'fuwei',   gua:'坎', sym:'☵', dir:'正北'},
        ],
        unlucky:[
          {type:'禍害', typeCls:'huohai', gua:'兌', sym:'☱', dir:'正西'},
          {type:'六煞', typeCls:'liusha', gua:'乾', sym:'☰', dir:'西北'},
          {type:'五鬼', typeCls:'wugui',  gua:'坤', sym:'☷', dir:'西南'},
          {type:'絕命', typeCls:'juming', gua:'艮', sym:'☶', dir:'東北'},
        ]},
    2:{ name:'坤', sym:'☷', dir:'西南', element:'土', group:'west', groupName:'西四命',
        trait:'寬厚包容，以柔克剛，蓄勢待發，在穩定中成就大事',
        lucky:[
          {type:'生氣', typeCls:'shengqi', gua:'艮', sym:'☶', dir:'東北'},
          {type:'天醫', typeCls:'tianyi',  gua:'乾', sym:'☰', dir:'西北'},
          {type:'延年', typeCls:'yannian', gua:'兌', sym:'☱', dir:'正西'},
          {type:'伏位', typeCls:'fuwei',   gua:'坤', sym:'☷', dir:'西南'},
        ],
        unlucky:[
          {type:'禍害', typeCls:'huohai', gua:'震', sym:'☳', dir:'正東'},
          {type:'六煞', typeCls:'liusha', gua:'離', sym:'☲', dir:'正南'},
          {type:'五鬼', typeCls:'wugui',  gua:'坎', sym:'☵', dir:'正北'},
          {type:'絕命', typeCls:'juming', gua:'巽', sym:'☴', dir:'東南'},
        ]},
    3:{ name:'震', sym:'☳', dir:'正東', element:'木', group:'east', groupName:'東四命',
        trait:'行動力強，勇於開創，具有雷霆之勢，天生的領導先驅',
        lucky:[
          {type:'生氣', typeCls:'shengqi', gua:'離', sym:'☲', dir:'正南'},
          {type:'天醫', typeCls:'tianyi',  gua:'坎', sym:'☵', dir:'正北'},
          {type:'延年', typeCls:'yannian', gua:'巽', sym:'☴', dir:'東南'},
          {type:'伏位', typeCls:'fuwei',   gua:'震', sym:'☳', dir:'正東'},
        ],
        unlucky:[
          {type:'禍害', typeCls:'huohai', gua:'艮', sym:'☶', dir:'東北'},
          {type:'六煞', typeCls:'liusha', gua:'坤', sym:'☷', dir:'西南'},
          {type:'五鬼', typeCls:'wugui',  gua:'乾', sym:'☰', dir:'西北'},
          {type:'絕命', typeCls:'juming', gua:'兌', sym:'☱', dir:'正西'},
        ]},
    4:{ name:'巽', sym:'☴', dir:'東南', element:'木', group:'east', groupName:'東四命',
        trait:'靈活入微，善於溝通，隨勢應變，在細節中發現機會',
        lucky:[
          {type:'生氣', typeCls:'shengqi', gua:'坎', sym:'☵', dir:'正北'},
          {type:'天醫', typeCls:'tianyi',  gua:'離', sym:'☲', dir:'正南'},
          {type:'延年', typeCls:'yannian', gua:'震', sym:'☳', dir:'正東'},
          {type:'伏位', typeCls:'fuwei',   gua:'巽', sym:'☴', dir:'東南'},
        ],
        unlucky:[
          {type:'禍害', typeCls:'huohai', gua:'坤', sym:'☷', dir:'西南'},
          {type:'六煞', typeCls:'liusha', gua:'艮', sym:'☶', dir:'東北'},
          {type:'五鬼', typeCls:'wugui',  gua:'兌', sym:'☱', dir:'正西'},
          {type:'絕命', typeCls:'juming', gua:'乾', sym:'☰', dir:'西北'},
        ]},
    6:{ name:'乾', sym:'☰', dir:'西北', element:'金', group:'west', groupName:'西四命',
        trait:'剛健自強，胸懷大志，具有天賦的領導魅力與執行力',
        lucky:[
          {type:'生氣', typeCls:'shengqi', gua:'坤', sym:'☷', dir:'西南'},
          {type:'天醫', typeCls:'tianyi',  gua:'艮', sym:'☶', dir:'東北'},
          {type:'延年', typeCls:'yannian', gua:'兌', sym:'☱', dir:'正西'},
          {type:'伏位', typeCls:'fuwei',   gua:'乾', sym:'☰', dir:'西北'},
        ],
        unlucky:[
          {type:'禍害', typeCls:'huohai', gua:'離', sym:'☲', dir:'正南'},
          {type:'六煞', typeCls:'liusha', gua:'震', sym:'☳', dir:'正東'},
          {type:'五鬼', typeCls:'wugui',  gua:'巽', sym:'☴', dir:'東南'},
          {type:'絕命', typeCls:'juming', gua:'坎', sym:'☵', dir:'正北'},
        ]},
    7:{ name:'兌', sym:'☱', dir:'正西', element:'金', group:'west', groupName:'西四命',
        trait:'善言悅人，才思敏捷，口才出眾，具有天生的社交魅力',
        lucky:[
          {type:'生氣', typeCls:'shengqi', gua:'乾', sym:'☰', dir:'西北'},
          {type:'天醫', typeCls:'tianyi',  gua:'坤', sym:'☷', dir:'西南'},
          {type:'延年', typeCls:'yannian', gua:'艮', sym:'☶', dir:'東北'},
          {type:'伏位', typeCls:'fuwei',   gua:'兌', sym:'☱', dir:'正西'},
        ],
        unlucky:[
          {type:'禍害', typeCls:'huohai', gua:'巽', sym:'☴', dir:'東南'},
          {type:'六煞', typeCls:'liusha', gua:'坎', sym:'☵', dir:'正北'},
          {type:'五鬼', typeCls:'wugui',  gua:'震', sym:'☳', dir:'正東'},
          {type:'絕命', typeCls:'juming', gua:'離', sym:'☲', dir:'正南'},
        ]},
    8:{ name:'艮', sym:'☶', dir:'東北', element:'土', group:'west', groupName:'西四命',
        trait:'沉穩踏實，意志堅定，深思熟慮，在穩中求進的策略高手',
        lucky:[
          {type:'生氣', typeCls:'shengqi', gua:'兌', sym:'☱', dir:'正西'},
          {type:'天醫', typeCls:'tianyi',  gua:'乾', sym:'☰', dir:'西北'},
          {type:'延年', typeCls:'yannian', gua:'坤', sym:'☷', dir:'西南'},
          {type:'伏位', typeCls:'fuwei',   gua:'艮', sym:'☶', dir:'東北'},
        ],
        unlucky:[
          {type:'禍害', typeCls:'huohai', gua:'坎', sym:'☵', dir:'正北'},
          {type:'六煞', typeCls:'liusha', gua:'巽', sym:'☴', dir:'東南'},
          {type:'五鬼', typeCls:'wugui',  gua:'震', sym:'☳', dir:'正東'},
          {type:'絕命', typeCls:'juming', gua:'離', sym:'☲', dir:'正南'},
        ]},
    9:{ name:'離', sym:'☲', dir:'正南', element:'火', group:'east', groupName:'東四命',
        trait:'熱情洋溢，思維清晰，感染力強，具有出眾的創造力與表達力',
        lucky:[
          {type:'生氣', typeCls:'shengqi', gua:'震', sym:'☳', dir:'正東'},
          {type:'天醫', typeCls:'tianyi',  gua:'巽', sym:'☴', dir:'東南'},
          {type:'延年', typeCls:'yannian', gua:'坎', sym:'☵', dir:'正北'},
          {type:'伏位', typeCls:'fuwei',   gua:'離', sym:'☲', dir:'正南'},
        ],
        unlucky:[
          {type:'禍害', typeCls:'huohai', gua:'坤', sym:'☷', dir:'西南'},
          {type:'六煞', typeCls:'liusha', gua:'艮', sym:'☶', dir:'東北'},
          {type:'五鬼', typeCls:'wugui',  gua:'兌', sym:'☱', dir:'正西'},
          {type:'絕命', typeCls:'juming', gua:'乾', sym:'☰', dir:'西北'},
        ]},
  };

  // ══════════════════════════════════════
  // 納甲六親系統
  // ══════════════════════════════════════

  // 下卦(lo)各爻地支 [初爻, 二爻, 三爻]
  const NAJIA_DOWN = {
    7:['子','寅','辰'], // 乾
    0:['未','巳','卯'], // 坤
    1:['子','戌','申'], // 震
    6:['丑','亥','酉'], // 巽
    2:['寅','辰','午'], // 坎
    5:['卯','丑','亥'], // 離
    4:['辰','寅','子'], // 艮
    3:['巳','卯','丑'], // 兌
  };
  // 上卦(up)各爻地支 [四爻, 五爻, 六爻]
  const NAJIA_UP = {
    7:['午','申','戌'], // 乾
    0:['丑','亥','酉'], // 坤
    1:['午','辰','寅'], // 震
    6:['未','巳','卯'], // 巽
    2:['申','戌','子'], // 坎
    5:['酉','未','巳'], // 離
    4:['戌','申','午'], // 艮
    3:['亥','酉','未'], // 兌
  };
  // 地支 → 五行
  const ZHI_ELE = {
    '子':'水','亥':'水','寅':'木','卯':'木',
    '巳':'火','午':'火','申':'金','酉':'金',
    '丑':'土','辰':'土','未':'土','戌':'土',
  };
  // 六親對照：宮元素 → 爻元素 → 六親
  const LIUQIN = {
    '金':{'金':'兄弟','水':'子孫','木':'妻財','火':'官鬼','土':'父母'},
    '水':{'水':'兄弟','木':'子孫','火':'妻財','土':'官鬼','金':'父母'},
    '木':{'木':'兄弟','火':'子孫','土':'妻財','金':'官鬼','水':'父母'},
    '火':{'火':'兄弟','土':'子孫','金':'妻財','水':'官鬼','木':'父母'},
    '土':{'土':'兄弟','金':'子孫','水':'妻財','木':'官鬼','火':'父母'},
  };
  // 六親 → CSS class
  const LQ_CLS = {
    '父母':'lq-fumu','子孫':'lq-zisun','妻財':'lq-qicai',
    '官鬼':'lq-guanui','兄弟':'lq-xiongdi',
  };

  // 取得六爻六親陣列（順序：初爻→上爻）
  function getHexLiuQin(hexNum, loBits, upBits) {
    const palEle = PALACE_MAP[hexNum] || '土';
    const loZhi  = NAJIA_DOWN[loBits] || ['子','寅','辰'];
    const upZhi  = NAJIA_UP[upBits]   || ['午','申','戌'];
    return [...loZhi, ...upZhi].map(zhi => {
      const lineEle = ZHI_ELE[zhi] || '土';
      const lq = (LIUQIN[palEle] || {})[lineEle] || '父母';
      return { zhi, lq, cls: LQ_CLS[lq] || 'lq-fumu' };
    });
  }

  // ══════════════════════════════════════
  // 六爻傳統解析 — 輔助資料與函式
  // ══════════════════════════════════════

  // 世爻位置表（依八宮位推算）
  const SHI_YAO = (() => {
    const map = {};
    [7,3,5,1,6,2,4,0].forEach(T => {
      [
        [[T,T],6], [[T,T^1],1], [[T,T^3],2], [[T,T^7],3],
        [[T^1,T^7],4], [[T^3,T^7],5], [[T^2,T^7],4], [[T^2,T],3],
      ].forEach(([[up,lo],world]) => {
        const n = LK[(up&7)*8+(lo&7)];
        if (n && !map[n]) map[n] = world;
      });
    });
    return map;
  })();

  // 六獸輪值（依日天干起卦）
  const LIUSHOU_NAMES = ['青龍','朱雀','勾陳','螣蛇','白虎','玄武'];
  const LIUSHOU_START = {
    '甲':0,'乙':0, '丙':1,'丁':1, '戊':2, '己':3, '庚':4,'辛':4, '壬':5,'癸':5,
  };

  // 五行生剋
  const WUXING_SHENG = {'金':'水','水':'木','木':'火','火':'土','土':'金'};
  const WUXING_KE    = {'金':'木','木':'土','土':'水','水':'火','火':'金'};

  // 月日旺衰（lineEle=爻五行，refEle=月/日五行）
  function getWangShuai(lineEle, refEle) {
    if (refEle === lineEle)               return '旺';
    if (WUXING_SHENG[refEle] === lineEle) return '生';   // 月/日 生 爻
    if (WUXING_KE[refEle]    === lineEle) return '剋';   // 月/日 剋 爻
    if (WUXING_SHENG[lineEle]=== refEle)  return '休';   // 爻 生 月/日
    if (WUXING_KE[lineEle]   === refEle)  return '囚';   // 爻 剋 月/日
    return '平';
  }

  // 六合 / 六沖
  const LIUHE = {
    '子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯',
    '辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午',
  };
  const LIUCHONG = {
    '子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅',
    '卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳',
  };

  // 動化分析（origZhi=本卦地支，zhiZhi=之卦地支）
  function getDongHua(origZhi, zhiZhi) {
    if (!zhiZhi) return '';
    const oEle = ZHI_ELE[origZhi] || '';
    const zEle = ZHI_ELE[zhiZhi]  || '';
    if (LIUHE[origZhi]   === zhiZhi)            return '化合';
    if (LIUCHONG[origZhi]=== zhiZhi)            return '化沖（回頭剋）';
    if (WUXING_KE[zEle]  === oEle)              return '化回頭剋';
    if (WUXING_SHENG[zEle]=== oEle)             return '化回頭生';
    if (WUXING_SHENG[oEle]=== zEle)             return '化洩';
    if (WUXING_KE[oEle]  === zEle)              return '化進神';
    if (oEle === zEle)                           return '化比（同類）';
    return `化${zhiZhi}`;
  }

  // 空亡計算（依日干支，返回空亡兩支）
  const GAN_LIST = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const ZHI_LIST = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  function getKongWang(dayGanZhi) {
    if (!dayGanZhi || dayGanZhi.length < 2) return [];
    const ganI = GAN_LIST.indexOf(dayGanZhi[0]);
    const zhiI = ZHI_LIST.indexOf(dayGanZhi[1]);
    if (ganI < 0 || zhiI < 0) return [];
    const xunStart = (zhiI - ganI + 12) % 12;
    return [ZHI_LIST[(xunStart + 10) % 12], ZHI_LIST[(xunStart + 11) % 12]];
  }

  // 組建傳統六爻 AI prompt
  function buildTraditionalPrompt(mainNum, castLines, gz, changedHexNum, question) {
    const hx      = H[mainNum];
    if (!hx) return '';
    const upBits  = hx.up;
    const loBits  = hx.lo;
    const loZhi   = NAJIA_DOWN[loBits] || ['子','寅','辰'];
    const upZhi   = NAJIA_UP[upBits]   || ['午','申','戌'];
    const allZhi  = [...loZhi, ...upZhi];  // index 0=初爻

    const zhiHx   = changedHexNum ? H[changedHexNum] : null;
    let allZhiZhi = null;
    if (zhiHx) {
      const zLoZhi = NAJIA_DOWN[zhiHx.lo] || ['子','寅','辰'];
      const zUpZhi = NAJIA_UP[zhiHx.up]   || ['午','申','戌'];
      allZhiZhi = [...zLoZhi, ...zUpZhi];
    }

    // 世爻 / 應爻
    const shiYao  = SHI_YAO[mainNum] || 5;
    const yingYao = shiYao <= 3 ? shiYao + 3 : shiYao - 3;

    // 月日干支 & 五行
    const dayStr   = gz.day   || '';
    const monthStr = gz.month || '';
    const dayZhi   = dayStr[1]   || '';
    const monthZhi = monthStr[1] || '';
    const dayEle   = ZHI_ELE[dayZhi]   || '土';
    const monthEle = ZHI_ELE[monthZhi] || '土';

    // 空亡
    const kongWang = getKongWang(dayStr);

    // 六獸起卦（以日天干定起始）
    const dayGan      = dayStr[0] || '甲';
    const liushouStart= LIUSHOU_START[dayGan] ?? 0;

    // 六親
    const liuqin = getHexLiuQin(mainNum, loBits, upBits);

    // 動爻索引（0-based）
    const movingIdx = castLines.map((v,i) => (v===6||v===9) ? i : -1).filter(x=>x>=0);

    // 卦名
    const guaTitle = zhiHx ? `${hx.n}之${zhiHx.n}` : hx.n;

    // ── 爻象逐行分析 ──
    const yaoLines = [];
    for (let i = 0; i < 6; i++) {
      const lineNum    = i + 1;
      const zhi        = allZhi[i];
      const lineEle    = ZHI_ELE[zhi] || '土';
      const lq         = liuqin[i]?.lq || '父母';
      const isMoving   = movingIdx.includes(i);
      const isShi      = lineNum === shiYao;
      const isYing     = lineNum === yingYao;
      const isKong     = kongWang.includes(zhi);
      const lsName     = LIUSHOU_NAMES[(liushouStart + i) % 6];
      const monthWS    = getWangShuai(lineEle, monthEle);
      const dayWS      = getWangShuai(lineEle, dayEle);
      const roleTag    = isShi ? '【世爻】' : (isYing ? '【應爻】' : '');

      let line = `- ${lineNum}爻：${lsName}／${lq}／${zhi}${roleTag}`;
      if (isMoving) {
        const donghua = allZhiZhi ? getDongHua(zhi, allZhiZhi[i]) : '';
        line += ` → 動爻，月${monthWS}日${dayWS}${donghua ? '，' + donghua : ''}`;
        if (isKong) line += '，空亡';
      } else {
        line += `，月${monthWS}日${dayWS}`;
        if (isKong) line += '，空亡';
      }
      yaoLines.push(line);
    }

    // ── 動爻爻辭 ──
    const dongYaoCi = movingIdx.map(i => {
      const ln = hx.ln[i];
      return ln ? `第${i+1}爻「${ln[0]}」：${ln[1]}` : '';
    }).filter(Boolean);

    // ── 組建 prompt ──
    let p = `你是一位精通六爻納甲卜法的命理師，擅長以六親、六獸、世應爻、月日旺衰、空亡、動化進行精準解析。

【卦象】${guaTitle}（${hx.st || hx.n}）
【占卜時間】${gz.year}年　月柱：${monthStr}　日柱：${dayStr}
【空亡】本日空亡兩支：${kongWang.length ? kongWang.join('、') : '無'}

【六爻爻象（初爻→上爻）】
${yaoLines.join('\n')}
`;

    if (dongYaoCi.length > 0) {
      p += `
【動爻爻辭】
${dongYaoCi.join('\n')}
`;
    }

    p += `
【卦辭參考】
本卦《${hx.n}》：「${hx.gc}」`;
    if (zhiHx) p += `\n變卦《${zhiHx.n}》：「${zhiHx.gc}」`;

    p += `

【占問事項】${question || '（未指定）'}

請依上述六爻完整資料，以傳統六爻卜法（納甲法）進行解析，用繁體中文，依以下格式回覆：

🔮 卦象總論
說明本卦格局、世應爻關係，以及整體吉凶趨勢（3-4句）。

⚡ 動爻詳析
逐一分析各動爻的六親、六獸含義，說明動化（回頭剋/回頭生/化合/化沖等）對卦象的影響。

📖 爻辭解讀
結合動爻爻辭的傳統義理，說明對占問事項的指示與啟示。

🎯 綜合斷語
針對「${question || '此問'}」，給出具體明確的吉凶判斷，並提出2-3條實用建議。

請盡量深入詳細，語氣肅穆深沉，符合傳統術數風格，不要自行限制字數。`;

    return p;
  }

  // 複製傳統六爻指令到剪貼簿
  async function copyTraditionalPrompt() {
    const btn = document.getElementById('copy-prompt-btn');
    const mainNum = linesToHexNum(state.castLines);
    const cv      = hasChanging(state.castLines) ? changedVals(state.castLines) : null;
    const cn      = cv ? linesToHexNum(cv) : null;
    const gz      = state.castTimeGz || Cal.getFullGanZhi(new Date());
    const question= getEffectiveQuestion();

    const prompt = buildTraditionalPrompt(mainNum, state.castLines, gz, cn, question);
    if (!prompt) return;

    try {
      await _copyToClipboard(prompt);
      btn.textContent = '✓ 已複製！';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '📋 複製六爻指令';
        btn.classList.remove('copied');
      }, 2000);
    } catch(e) {
      btn.textContent = '複製失敗';
      setTimeout(() => { btn.textContent = '📋 複製六爻指令'; }, 2000);
    }
  }

  // 傳統六爻 AI 解析（呼叫 /api/ai-raw）
  async function doTraditionalAI() {
    const btn       = document.getElementById('trad-ai-btn');
    const resultDiv = document.getElementById('trad-ai-result');
    const textDiv   = document.getElementById('trad-ai-text');
    btn.disabled    = true;
    btn.textContent = '✦ 解析中…';
    resultDiv.style.display = 'block';
    textDiv.innerHTML = '<span class="ai-loading">正在以傳統六爻卜法解析，請稍候…</span>';

    const mainNum = linesToHexNum(state.castLines);
    const cv      = hasChanging(state.castLines) ? changedVals(state.castLines) : null;
    const cn      = cv ? linesToHexNum(cv) : null;
    const gz      = state.castTimeGz || Cal.getFullGanZhi(new Date());
    const question= getEffectiveQuestion();

    try {
      const prompt = buildTraditionalPrompt(mainNum, state.castLines, gz, cn, question);
      const r = await fetch('/api/ai-raw', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-api-key': getApiKey() },
        body: JSON.stringify({ prompt }),
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);

      const rendered = data.interpretation
        .replace(/^(🔮[^\n]*)/gm, '<div class="ai-section-h trad-head">$1</div>')
        .replace(/^(⚡[^\n]*)/gm,  '<div class="ai-section-h trad-head">$1</div>')
        .replace(/^(📖[^\n]*)/gm, '<div class="ai-section-h trad-head">$1</div>')
        .replace(/^(🎯[^\n]*)/gm, '<div class="ai-section-h trad-head trad-judge">$1</div>')
        .replace(/\n/g, '<br>');
      textDiv.innerHTML = rendered;
      if (data.model) {
        textDiv.innerHTML += `<div class="ai-model-note">使用模型：${data.model}</div>`;
      }
      btn.textContent = '✦ 重新解析';
      btn.disabled    = false;
      // 顯示導出按鈕列
      const tradActions = document.getElementById('result-actions-trad');
      if (tradActions) tradActions.classList.add('visible');
    } catch(e) {
      textDiv.innerHTML = `<span style="color:#c0392b">解析失敗：${e.message}</span>`;
      btn.textContent   = '✦ 六爻傳統解析';
      btn.disabled      = false;
    }
  }

  // 命卦與本卦方位連結
  function renderMinguaLink(hexNum, loBits, upBits) {
    const saved = localStorage.getItem('saved_mingua');
    if (!saved) return '';
    let guaNum, year;
    try { ({ guaNum, year } = JSON.parse(saved)); } catch(e) { return ''; }
    const mg = MINGUA_DATA[guaNum];
    if (!mg) return '';
    const upName = TRIG[upBits]?.name;
    const loName = TRIG[loBits]?.name;
    const links = [];
    [['上卦', upName], ['下卦', loName]].forEach(([pos, tName]) => {
      if (!tName) return;
      const lk = mg.lucky.find(d => d.gua === tName);
      const ul = mg.unlucky.find(d => d.gua === tName);
      if (lk) links.push({ pos, tName, type:lk.type, typeCls:lk.typeCls, good:true });
      if (ul) links.push({ pos, tName, type:ul.type, typeCls:ul.typeCls, good:false });
    });
    if (!links.length) return '';
    const itemsHTML = links.map(l =>
      `<div class="ml-item">
        <span class="ml-pos">${l.pos}・${l.tName}</span>
        <span class="ml-badge dir-${l.typeCls}">${l.type}</span>
        <span class="ml-hint ${l.good?'ml-lucky':'ml-unlucky'}">${l.good?'✦ 吉方呼應，此卦得勢':'⚠ 凶方臨卦，需留意'}</span>
      </div>`
    ).join('');
    return `<div class="mingua-link-card">
      <div class="ml-head">
        <span class="ml-sym">${mg.sym}</span>
        <div>
          <div class="ml-title">${mg.groupName} · ${mg.name}命</div>
          <div class="ml-sub">${year}年生 · 命卦${guaNum} · 方位呼應分析</div>
        </div>
      </div>
      ${itemsHTML}
    </div>`;
  }

  // ── Fortune heuristic (classical I Ching reference) ──
  // 各 12 卦，平均分布：大吉19% / 吉19% / 平44% / 宜謹慎19%
  const FORTUNE = {
    // 大吉：卦辭明確大吉、元亨利貞者
    great: new Set([1,2,11,14,15,19,25,35,42,45,46,55]),
    // 吉：整體向好，適時而動可獲吉
    good:  new Set([5,8,13,17,24,26,30,32,40,49,50,58]),
    // 宜謹慎：卦辭含凶、險、悔、厲，或有明確警示
    caution: new Set([4,6,10,12,23,28,29,36,38,39,44,47]),
  };
  // 其餘 28 卦歸平（混吉凶、需視動爻而定）
  function getFortuneLabel(hexNum) {
    if (FORTUNE.great.has(hexNum))   return { label:'大吉', cls:'ft-great' };
    if (FORTUNE.caution.has(hexNum)) return { label:'宜謹慎', cls:'ft-caution' };
    if (FORTUNE.good.has(hexNum))    return { label:'吉', cls:'ft-good' };
    return { label:'平', cls:'ft-neutral' };
  }

  function formatDate(isoStr) {
    const d = new Date(isoStr);
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  // ── Guided Question Helpers ──
  function setCategory(btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.category = btn.dataset.cat;
  }

  function toggleOptional() {
    const fields = document.getElementById('q-optional-fields');
    const icon = document.getElementById('q-toggle-icon');
    const open = fields.style.display === 'block';
    fields.style.display = open ? 'none' : 'block';
    icon.textContent = open ? '＋' : '－';
  }

  // ── 起卦守則展開/收合 ──
  function toggleGuide() {
    const body = document.getElementById('guide-body');
    const icon = document.getElementById('guide-icon');
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    icon.textContent = open ? '▸' : '▾';
    state.guideOpen = !open;
  }

  // ── 幫別人算 ──
  function toggleProxy() {
    state.proxyMode = !state.proxyMode;
    const fields = document.getElementById('proxy-fields');
    const icon = document.getElementById('proxy-toggle-icon');
    fields.style.display = state.proxyMode ? 'block' : 'none';
    icon.textContent = state.proxyMode ? '☑' : '☐';
    if (!state.proxyMode) document.getElementById('proxy-label').textContent = '';
  }

  function updateProxyLabel() {
    const caster  = (document.getElementById('proxy-caster')  || {}).value?.trim() || '';
    const subject = (document.getElementById('proxy-subject') || {}).value?.trim() || '';
    const label   = document.getElementById('proxy-label');
    if (!label) return;
    if (caster || subject) {
      label.textContent = `聲明：弟子${caster || '（你的名字）'}幫${subject || '（對方名字）'}算`;
      label.className = 'proxy-label-text';
    } else {
      label.textContent = '';
    }
  }

  // 取得有效問題（含幫別人算前綴）
  function getEffectiveQuestion() {
    const q = document.getElementById('q-input')?.value?.trim() || '';
    if (!state.proxyMode) return q;
    const caster  = document.getElementById('proxy-caster')?.value?.trim()  || '';
    const subject = document.getElementById('proxy-subject')?.value?.trim() || '';
    const prefix  = `弟子${caster}幫${subject}算`;
    return q ? `${prefix}：${q}` : prefix;
  }

  function setReaction(btn, type) {
    document.querySelectorAll('.react-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.reaction = type;
    const insights = {
      relieved: '你心裡已有答案，卦象只是幫你確認。放心前進吧。',
      disappointed: '失望感說明你期待另一種結果。反思一下，那個期待從哪裡來的？',
      confused: '疑惑是好事，代表你正在認真思考。細看動爻的提示，答案藏在細節裡。',
      agree: '完全認同是難得的清醒時刻。這個方向是對的，堅持下去。',
    };
    const el = document.getElementById('reaction-insight');
    el.textContent = insights[type] || '';
    el.style.display = 'block';
  }

  function setAiStyle(btn) {
    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.aiStyle = btn.dataset.style;
  }

  // ── 手動教學 toggle ──
  function toggleTutorial() {
    const box = document.getElementById('coin-tutorial');
    const btn = document.getElementById('tutorial-btn');
    const open = box.style.display === 'block';
    box.style.display = open ? 'none' : 'block';
    btn.classList.toggle('open', !open);
    btn.textContent = open
      ? '📚 如何用 1 元硬幣起卦？點此展開圖解教學 ▾'
      : '📚 如何用 1 元硬幣起卦？點此收起教學 ▴';
  }

  // ── 命卦 ──
  // 計算命卦數（八宅法，西元年份）
  // 男：年份各位數加至個位 n，n=5→坤(2)，否則 = 10-n
  // 女：年份各位數加至個位 n，n=5→艮(8)，否則 = 5+n（若>9則-9，若結果=5→8）
  function calcMingGuaNum(year, gender) {
    let n = [...String(Math.abs(year))].reduce((a, c) => a + +c, 0);
    while (n >= 10) n = [...String(n)].reduce((a, c) => a + +c, 0);

    if (n === 5) return gender === 'male' ? 2 : 8;

    let gua;
    if (gender === 'male') {
      gua = 10 - n;
    } else {
      gua = 5 + n;
      if (gua > 9) gua -= 9;
    }
    // 萬一仍為 5（如女命 n=9 → 5+9=14-9=5）
    if (gua === 5) return gender === 'male' ? 2 : 8;
    if (gua === 0) gua = 9;
    return gua;
  }

  function setMinguaGender(btn) {
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.minguaGender = btn.dataset.gender;
  }

  function calcAndShowMingua() {
    const yearEl = document.getElementById('mingua-year');
    const errEl  = document.getElementById('mingua-err');
    const year   = parseInt(yearEl.value);
    errEl.textContent = '';
    if (!year || year < 1900 || year > 2100) {
      errEl.textContent = '請輸入有效出生年份（1900–2100）';
      return;
    }
    const guaNum = calcMingGuaNum(year, state.minguaGender);
    // 儲存命卦供起卦頁關聯分析使用
    localStorage.setItem('saved_mingua', JSON.stringify({ guaNum, year }));
    renderMingGuaResult(guaNum, year);
  }

  // ══════════════════════════════════════
  // 梅花易數本命卦
  // ══════════════════════════════════════

  // 先天八卦數(1-8) → TRIG bit key
  // 1=乾,2=兌,3=離,4=震,5=巽,6=坎,7=艮,8=坤
  const MH_NUM_TO_BITS = [null, 7, 3, 5, 1, 6, 2, 4, 0];
  const MH_SHICHEN_NAME = ['','子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

  function calcMeiHuaMingGua(year, month, day, shichen) {
    // 年份數字根（各位相加至個位）
    let ySum = [...String(Math.abs(year))].reduce((a,c) => a + +c, 0);
    while (ySum >= 10) ySum = [...String(ySum)].reduce((a,c) => a + +c, 0);

    const sumYMD  = ySum + month + day;
    const sumYMDT = sumYMD + shichen;

    const upNum   = sumYMD  % 8 || 8;   // 上卦先天數 1-8
    const loNum   = sumYMDT % 8 || 8;   // 下卦先天數 1-8
    const movLine = sumYMDT % 6 || 6;   // 動爻 1-6

    const upBits = MH_NUM_TO_BITS[upNum];
    const loBits = MH_NUM_TO_BITS[loNum];
    const hexNum = LK[upBits * 8 + loBits];

    return { hexNum, upBits, loBits, movLine, upNum, loNum, sumYMD, sumYMDT, ySum };
  }

  function calcAndShowMeihua() {
    const yearEl    = document.getElementById('mh-year');
    const monthEl   = document.getElementById('mh-month');
    const dayEl     = document.getElementById('mh-day');
    const shichenEl = document.getElementById('mh-shichen');
    const errEl     = document.getElementById('mh-err');
    errEl.textContent = '';

    const year    = parseInt(yearEl.value);
    const month   = parseInt(monthEl.value);
    const day     = parseInt(dayEl.value);
    const shichen = parseInt(shichenEl.value);

    if (!year || year < 1900 || year > 2100) {
      errEl.textContent = '請輸入有效出生年份（1900–2100）'; return;
    }
    if (!month) { errEl.textContent = '請選擇月份'; return; }
    if (!day)   { errEl.textContent = '請選擇日期'; return; }
    if (!shichen) { errEl.textContent = '請選擇時辰'; return; }

    const result = calcMeiHuaMingGua(year, month, day, shichen);
    // 儲存至 localStorage 供起卦頁使用
    const saved = JSON.parse(localStorage.getItem('saved_mingua') || '{}');
    saved.meihua = { ...result, year, month, day, shichen };
    localStorage.setItem('saved_mingua', JSON.stringify(saved));

    renderMeihuaResult(result, year, month, day, shichen);
  }

  function renderMeihuaResult(r, year, month, day, shichen) {
    const hx      = H[r.hexNum];
    const tUp     = TRIG[r.upBits];
    const tLo     = TRIG[r.loBits];
    const ft      = getFortuneLabel(r.hexNum);
    const palEle  = PALACE_MAP[r.hexNum] || '土';

    // 之卦：把動爻翻轉
    const mhVals = Array(6).fill(7);
    mhVals[r.movLine - 1] = 9; // 標記動爻為老陽（顯示用，實際方向不影響）
    const chgVals = mhVals.map((v, i) => i === r.movLine - 1 ? 8 : v);
    // 之卦：flip 動爻 bit
    let zhiUpBits = r.upBits, zhiLoBits = r.loBits;
    const lineIdx = r.movLine - 1; // 0-based
    if (lineIdx < 3) {
      zhiLoBits = zhiLoBits ^ (1 << lineIdx);
    } else {
      zhiUpBits = zhiUpBits ^ (1 << (lineIdx - 3));
    }
    const zhiNum  = LK[zhiUpBits * 8 + zhiLoBits];
    const zhiHx   = H[zhiNum];
    const zhiTUp  = TRIG[zhiUpBits];
    const zhiTLo  = TRIG[zhiLoBits];

    // 六爻畫面（從上到下 = 爻6..1）
    let linesHTML = '';
    for (let i = 5; i >= 0; i--) {
      const isYang = true; // 本命卦爻都以陽爻示意，動爻特別標示
      const isMoving = (i === r.movLine - 1);
      const bars = `<div class="bar bar-yang"></div>`;
      linesHTML += `<div class="hline${isMoving ? ' mh-moving' : ''}">
        <div class="hline-num">${['初','二','三','四','五','上'][i]}爻</div>
        <div class="hline-bars">${bars}</div>
        <div class="hline-lq" style="width:3rem"></div>
        <div class="hline-tag">
          ${isMoving
            ? '<span class="tag-chg">動爻</span>'
            : '<span class="tag-yang">陽</span>'}
        </div>
      </div>`;
    }

    document.getElementById('meihua-result').innerHTML = `
      <div class="card mh-result-card">
        <div class="mh-res-header">
          <div class="mh-res-sym">${hx.u}</div>
          <div class="mh-res-info">
            <div class="mh-res-birth">${year}年${month}月${day}日 ${MH_SHICHEN_NAME[shichen]}時</div>
            <div class="mh-res-name">本命卦・第${r.hexNum}卦　${hx.n}</div>
            <div class="mh-res-detail">
              上${tUp.name}（${tUp.sym}）下${tLo.name}（${tLo.sym}）・動爻第${r.movLine}爻
            </div>
            <div class="mh-res-calc">
              年根${r.ySum}+${month}月+${day}日=${r.sumYMD}→上卦${r.upNum}(${tUp.name})　+${shichen}時=${r.sumYMDT}→下卦${r.loNum}(${tLo.name})・動${r.movLine}爻
            </div>
            <div class="palace-tag" style="margin-top:.3rem">宮：<span class="palace-ele palace-${palEle}">${palEle}</span>　<span class="ft-badge ${ft.cls}" style="font-size:.6rem">${ft.label}</span></div>
          </div>
        </div>
        <div class="hex-visual" style="margin:.7rem 0">${linesHTML}</div>
        <div class="trigram-row">
          <div class="trigram-box">
            <div class="trigram-sym">${tUp.sym}</div>
            <div class="trigram-name">上卦 ${tUp.name}</div>
            <div class="trigram-attr">${tUp.attr}・${tUp.ele}・${tUp.dir}</div>
          </div>
          <div class="trig-arrow">✕</div>
          <div class="trigram-box">
            <div class="trigram-sym">${tLo.sym}</div>
            <div class="trigram-name">下卦 ${tLo.name}</div>
            <div class="trigram-attr">${tLo.attr}・${tLo.ele}・${tLo.dir}</div>
          </div>
        </div>
        <div class="sec-label" style="margin-top:.8rem">📜 卦辭</div>
        <div class="guaci">《${hx.n}》${hx.gc}</div>
        <div class="sec-label">💡 本命啟示</div>
        <div class="modern-text">${hx.md}</div>
        <div class="sec-label">🔄 之卦（動爻第${r.movLine}爻變）</div>
        <div class="mh-zhigua-row">
          <div class="mh-zg-item">
            <div class="mh-zg-sym">${hx.u}</div>
            <div class="mh-zg-name">${hx.n}</div>
            <div class="mh-zg-label">本命卦</div>
          </div>
          <div class="mh-zg-arrow">→</div>
          <div class="mh-zg-item">
            <div class="mh-zg-sym">${zhiHx.u}</div>
            <div class="mh-zg-name">${zhiHx.n}</div>
            <div class="mh-zg-label">之卦</div>
          </div>
        </div>
        <div class="mh-zhigua-note">
          之卦上${zhiTUp.name}（${zhiTUp.sym}）下${zhiTLo.name}（${zhiTLo.sym}）・${zhiHx.vt}
        </div>
        <div class="mingua-ai-wrap">
          <button class="mingua-ai-btn mh-ai-btn" id="mhai-btn" onclick="App.doMeihuaAI()">✦ AI 本命卦解析</button>
          <div id="mhai-result" class="mingua-ai-result" style="display:none">
            <div id="mhai-text"></div>
          </div>
        </div>
      </div>`;
    // 儲存供 AI 使用
    state.meihuaData = { r, year, month, day, shichen, zhiNum, zhiHx };
  }

  // ── 命卦 AI 解析（八宅）──
  async function doMinguaAI() {
    const btn     = document.getElementById('mgai-btn');
    const resDiv  = document.getElementById('mgai-result');
    const textDiv = document.getElementById('mgai-text');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = '✦ AI解析中…';
    resDiv.style.display = 'block';
    textDiv.innerHTML = '<span class="ai-loading">正在解析命卦，請稍候…</span>';

    const { guaNum, year } = state.minguaData || {};
    const mg = MINGUA_DATA[guaNum];
    if (!mg) { textDiv.innerHTML = '<span style="color:#c0392b">命卦資料不足</span>'; btn.disabled=false; return; }

    try {
      const r = await fetch('/api/ai-mingua', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-api-key': getApiKey() },
        body: JSON.stringify({
          type:       'bagua',
          gua_num:    guaNum,
          gua_name:   mg.name,
          gua_sym:    mg.sym,
          element:    mg.element,
          dir:        mg.dir,
          group_name: mg.groupName,
          trait:      mg.trait,
          lucky:      mg.lucky,
          unlucky:    mg.unlucky,
          year,
          gender:     state.minguaGender,
        })
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      const rendered = data.interpretation
        .replace(/^(💡[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/^(🧭[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/^(⚠️[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/^(🤝[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/^(✨[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/\n/g, '<br>');
      textDiv.innerHTML = rendered;
      if (data.model) textDiv.innerHTML += `<div class="ai-model-note">使用模型：${data.model}</div>`;
      btn.textContent = '✦ 重新解析';
      btn.disabled = false;
    } catch(e) {
      textDiv.innerHTML = `<span style="color:#c0392b">AI解析失敗：${e.message}</span>`;
      btn.textContent = '✦ AI 命卦解析';
      btn.disabled = false;
    }
  }

  // ── 命卦 AI 解析（梅花易數）──
  async function doMeihuaAI() {
    const btn     = document.getElementById('mhai-btn');
    const resDiv  = document.getElementById('mhai-result');
    const textDiv = document.getElementById('mhai-text');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = '✦ AI解析中…';
    resDiv.style.display = 'block';
    textDiv.innerHTML = '<span class="ai-loading">正在解析本命卦，請稍候…</span>';

    const { r, year, month, day, shichen, zhiNum, zhiHx } = state.meihuaData || {};
    if (!r) { textDiv.innerHTML = '<span style="color:#c0392b">本命卦資料不足</span>'; btn.disabled=false; return; }

    const hx     = H[r.hexNum];
    const tUp    = TRIG[r.upBits];
    const tLo    = TRIG[r.loBits];

    try {
      const res = await fetch('/api/ai-mingua', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-api-key': getApiKey() },
        body: JSON.stringify({
          type:         'meihua',
          hex_num:      r.hexNum,
          hex_name:     hx.n,
          guaci:        hx.gc,
          virtue:       hx.vt,
          modern:       hx.md,
          up_name:      tUp.name,
          up_sym:       tUp.sym,
          lo_name:      tLo.name,
          lo_sym:       tLo.sym,
          mov_line:     r.movLine,
          zhi_num:      zhiNum,
          zhi_name:     zhiHx.n,
          zhi_guaci:    zhiHx.gc,
          year, month, day,
          shichen_name: MH_SHICHEN_NAME[shichen],
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const rendered = data.interpretation
        .replace(/^(💫[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/^(🔑[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/^(🌊[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/^(🔄[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/^(🗺️[^\n]*)/gm, '<div class="ai-sec-title">$1</div>')
        .replace(/\n/g, '<br>');
      textDiv.innerHTML = rendered;
      if (data.model) textDiv.innerHTML += `<div class="ai-model-note">使用模型：${data.model}</div>`;
      btn.textContent = '✦ 重新解析';
      btn.disabled = false;
    } catch(e) {
      textDiv.innerHTML = `<span style="color:#c0392b">AI解析失敗：${e.message}</span>`;
      btn.textContent = '✦ AI 本命卦解析';
      btn.disabled = false;
    }
  }

  function renderMingGuaResult(guaNum, year) {
    const mg = MINGUA_DATA[guaNum];
    if (!mg) return;
    const groupNote = mg.group === 'east'
      ? '與東四命者（坎・震・巽・離）相合；遇西四命者（坤・乾・兌・艮）需多包容'
      : '與西四命者（坤・乾・兌・艮）相合；遇東四命者（坎・震・巽・離）需多包容';

    const luckyHTML = mg.lucky.map(d =>
      `<div class="dir-item dir-${d.typeCls}">
        <div class="dir-sym">${d.sym}</div>
        <div class="dir-name">${d.dir}</div>
        <div class="dir-type">${d.type}</div>
      </div>`).join('');

    const unluckyHTML = mg.unlucky.map(d =>
      `<div class="dir-item dir-${d.typeCls}">
        <div class="dir-sym">${d.sym}</div>
        <div class="dir-name">${d.dir}</div>
        <div class="dir-type">${d.type}</div>
      </div>`).join('');

    document.getElementById('mingua-result').innerHTML = `
      <div class="card mingua-result-card">
        <div class="mg-header">
          <div class="mg-sym">${mg.sym}</div>
          <div class="mg-info">
            <div class="mg-num">${year} 年 · 命卦 ${guaNum}</div>
            <div class="mg-name">${mg.name} 命</div>
            <div class="mg-badges">
              <span class="mg-group-badge ${mg.group === 'east' ? 'e4-badge' : 'w4-badge'}">${mg.groupName}</span>
              <span class="mg-ele-badge">${mg.element} · ${mg.dir}</span>
            </div>
          </div>
        </div>
        <div class="mg-trait">「${mg.trait}」</div>

        <div class="sec-label" style="margin-top:.9rem">✦ 四吉方（趨吉）</div>
        <div class="dir-grid">${luckyHTML}</div>

        <div class="sec-label" style="margin-top:.6rem">✦ 四凶方（避凶）</div>
        <div class="dir-grid">${unluckyHTML}</div>

        <div class="mg-note">💡 ${groupNote}</div>
        <div class="mingua-ai-wrap">
          <button class="mingua-ai-btn" id="mgai-btn" onclick="App.doMinguaAI()">✦ AI 命卦解析</button>
          <div id="mgai-result" class="mingua-ai-result" style="display:none">
            <div id="mgai-text"></div>
          </div>
        </div>
      </div>`;
    // 儲存供 AI 使用
    state.minguaData = { guaNum, year };
  }

  // ── Splash ──
  function closeSplash() {
    const el = document.getElementById('splash');
    el.classList.add('hide');
    setTimeout(() => el.style.display = 'none', 450);
  }

  function initSplash() {
    // 每次隨機顯示一張啟動圖
    const splashImgs = [
      '/images/splash.jpg',
      '/images/ChatGPT Image 2026年5月17日 下午09_39_53.png',
      '/images/ChatGPT Image 2026年5月17日 下午09_41_13.png',
    ];
    const pick = splashImgs[Math.floor(Math.random() * splashImgs.length)];
    const img = document.getElementById('splash-img');
    if (img) img.src = pick;
  }

  // ── Boot ──
  function init() {
    initSplash();
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.addEventListener('click', () => switchPage(b.dataset.page));
    });
    Cal.updateShichenUI();
    setInterval(Cal.updateShichenUI, 30000);
    checkStatus();
    buildHexGrid();
    document.getElementById('q-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') startCast();
    });
  }

  function getApiKey() {
    return localStorage.getItem('gemini_api_key') || '';
  }

  // 匿名用戶識別（localStorage 永久保留，不同瀏覽器/裝置各自獨立）
  function getUserId() {
    let uid = localStorage.getItem('yijing_user_id');
    if (!uid) {
      uid = 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('yijing_user_id', uid);
    }
    return uid;
  }

  async function checkStatus() {
    try {
      const key = getApiKey();
      const r = await fetch('/api/status', {
        headers: key ? { 'x-api-key': key } : {}
      }).then(x => x.json());
      const el = document.getElementById('ai-status');
      const enabled = r.ai_enabled || !!key;
      el.textContent = enabled ? '✦ AI已啟用' : '✧ 點此設定 AI';
      el.style.color = enabled ? '#a0a0d0' : '#5a5060';
    } catch(e) {}
  }

  // ── 設定 Modal ──
  function openSettings() {
    const key = getApiKey();
    document.getElementById('api-key-input').value = key;
    document.getElementById('key-msg').textContent = '';
    document.getElementById('model-status').textContent =
      'gemini-2.5-flash → gemini-2.5-flash-lite → gemini-2.0-flash → gemini-2.5-pro';
    document.getElementById('settings-modal').style.display = 'flex';
  }

  function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
  }

  function toggleKeyGuide() {
    const body = document.getElementById('key-guide-body');
    const icon = document.getElementById('key-guide-icon');
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    icon.textContent = open ? '▸' : '▾';
  }

  async function saveApiKey() {
    const key = document.getElementById('api-key-input').value.trim();
    const msg = document.getElementById('key-msg');
    const btn = document.getElementById('btn-save-key');
    if (!key) { msg.style.color='var(--red)'; msg.textContent='請輸入 API Key'; return; }
    btn.disabled = true;
    btn.textContent = '驗證中…';
    msg.textContent = '';
    try {
      const r = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key })
      });
      const data = await r.json();
      if (data.ok) {
        localStorage.setItem('gemini_api_key', key);
        msg.style.color = 'var(--green)';
        msg.textContent = `✓ 成功！使用模型：${data.model}`;
        checkStatus();
        setTimeout(closeSettings, 1500);
      } else {
        msg.style.color = 'var(--red)';
        msg.textContent = '✗ ' + (data.error || '驗證失敗');
      }
    } catch(e) {
      msg.style.color = 'var(--red)';
      msg.textContent = '✗ 連線失敗';
    }
    btn.disabled = false;
    btn.textContent = '儲存並啟用';
  }

  // ── Page Routing ──
  function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + page).style.display = 'block';
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    if (page === 'history') loadHistory(1);
  }

  // ══════════════════════════════════════
  // 起卦 — 方法切換
  // ══════════════════════════════════════
  function setMethod(m) {
    state.method = m;
    document.getElementById('btn-coins').classList.toggle('active', m === 'coins');
    document.getElementById('btn-manual').classList.toggle('active', m === 'manual');
    const mw = document.getElementById('manual-wrap');
    mw.style.display = m === 'manual' ? 'block' : 'none';
    if (m === 'manual') buildManualUI();
  }

  function buildManualUI() {
    const c = document.getElementById('manual-lines');
    if (c.children.length) return;
    const names = ['初爻（最下）','二爻','三爻','四爻','五爻','上爻（最上）'];
    names.forEach((nm, i) => {
      const row = document.createElement('div');
      row.className = 'm-line';
      const opts = [
        {v:7, l:'━━━ 少陽', cls:'m-yang'},
        {v:9, l:'━○━ 老陽', cls:'m-yangc'},
        {v:8, l:'━ ━ 少陰', cls:'m-yin'},
        {v:6, l:'━×━ 老陰', cls:'m-yinc'},
      ];
      const btns = opts.map(o => {
        const b = document.createElement('button');
        b.textContent = o.l;
        b.dataset.v = o.v;
        if (o.v === 7) b.className = o.cls;
        b.onclick = () => {
          row.querySelectorAll('button').forEach(x => x.className = '');
          b.className = o.cls;
          state.manualVals[i] = o.v;
        };
        return b;
      });
      row.innerHTML = `<span class="m-line-name">${nm}</span>`;
      const wrap = document.createElement('div');
      wrap.className = 'm-line-btns';
      btns.forEach(b => wrap.appendChild(b));
      row.appendChild(wrap);
      c.appendChild(row);
    });
  }

  // ══════════════════════════════════════
  // 起卦 — 時辰起卦
  // ══════════════════════════════════════
  function castByTime() {
    const result = Cal.castByTime(new Date());
    state.castLines = result.lines;
    state.castTimeGz = result.ganzhi;
    state.castMethod = 'time';
    document.getElementById('q-card').style.display = 'none';
    document.getElementById('cast-anim').style.display = 'none';
    document.getElementById('result-wrap').style.display = 'none';
    const tcaEl = document.getElementById('time-cast-anim');
    tcaEl.classList.add('active');
    state.tcaTimer = setTimeout(() => {
      tcaEl.classList.remove('active');
      displayResult();
    }, 1400);
  }

  // ══════════════════════════════════════
  // 起卦 — 銅錢法
  // ══════════════════════════════════════
  function startCast() {
    if (state.method === 'manual') {
      state.castLines = [...state.manualVals];
      state.castMethod = 'manual';
      displayResult();
      return;
    }
    state.castLines = [];
    state.castStep = 0;
    state.castTimeGz = null;
    state.castMethod = 'coins';
    document.getElementById('q-card').style.display = 'none';
    document.getElementById('cast-anim').style.display = 'block';
    document.getElementById('result-wrap').style.display = 'none';
    // Progress dots
    const prog = document.getElementById('line-progress');
    prog.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const d = document.createElement('div');
      d.className = 'lp-dot' + (i === 0 ? ' current' : '');
      d.id = 'dot' + i;
      prog.appendChild(d);
    }
    castNextLine();
  }

  function throwLine() {
    const c = [Math.random()<.5?3:2, Math.random()<.5?3:2, Math.random()<.5?3:2];
    return c[0]+c[1]+c[2];
  }

  function animateCoins(sum, cb) {
    const cs = [document.getElementById('c0'),document.getElementById('c1'),document.getElementById('c2')];
    cs.forEach(c => { c.classList.remove('flip'); void c.offsetWidth; c.classList.add('flip'); });
    setTimeout(() => {
      cs.forEach((c, i) => {
        const h = Math.random() > 0.5;
        c.className = 'coin ' + (h ? 'coin-h' : 'coin-t');
        c.textContent = h ? '☰' : '☷';
      });
      const labels = {6:'老陰 ━×━',7:'少陽 ━━━',8:'少陰 ━ ━',9:'老陽 ━○━'};
      document.getElementById('cast-line-label').textContent = `第${state.castStep+1}爻：${labels[sum]}`;
      cb();
    }, 680);
  }

  function castNextLine() {
    if (state.castStep >= 6) { displayResult(); return; }
    document.getElementById('dot'+state.castStep).className = 'lp-dot current';
    const sum = throwLine();
    animateCoins(sum, () => {
      state.castLines.push(sum);
      document.getElementById('dot'+state.castStep).className = 'lp-dot done';
      state.castStep++;
      if (state.castStep < 6) setTimeout(castNextLine, 550);
      else setTimeout(displayResult, 750);
    });
  }

  // ══════════════════════════════════════
  // 顯示結果
  // ══════════════════════════════════════
  function trigramBits(vals, start) {
    let b = 0;
    if (vals[start]===7||vals[start]===9) b|=1;
    if (vals[start+1]===7||vals[start+1]===9) b|=2;
    if (vals[start+2]===7||vals[start+2]===9) b|=4;
    return b;
  }

  function linesToHexNum(vals) {
    return LK[trigramBits(vals,3)*8 + trigramBits(vals,0)];
  }

  function hasChanging(vals) { return vals.some(v => v===6||v===9); }

  function changedVals(vals) { return vals.map(v => v===9?8:v===6?7:v); }

  function displayResult() {
    document.getElementById('cast-anim').style.display = 'none';
    document.getElementById('q-card').style.display = 'none';
    document.getElementById('ai-result').style.display = 'none';
    const rw = document.getElementById('result-wrap');
    rw.classList.remove('anim-in');
    void rw.offsetWidth;
    rw.style.display = 'block';
    rw.classList.add('anim-in');
    document.getElementById('save-msg').textContent = '';
    state.currentReadingId = null;

    const mainNum = linesToHexNum(state.castLines);
    renderHexCard(document.getElementById('main-card'), mainNum, state.castLines, false);

    if (hasChanging(state.castLines)) {
      const cv = changedVals(state.castLines);
      const cn = linesToHexNum(cv);
      // 動態更新之卦箭頭說明
      const arrowEl = document.getElementById('change-arrow');
      if (arrowEl) {
        const chgNums = state.castLines
          .map((v,i) => (v===6||v===9) ? (i+1)+'爻' : null)
          .filter(Boolean).join('・');
        arrowEl.innerHTML =
          `<span class="ca-main">${H[mainNum].u} ${H[mainNum].n}</span>` +
          `<span class="ca-arrow">→</span>` +
          `<span class="ca-label">動爻 ${chgNums}</span>` +
          `<span class="ca-arrow">→</span>` +
          `<span class="ca-changed">${H[cn].u} ${H[cn].n}</span>`;
      }
      document.getElementById('change-wrap').style.display = 'block';
      renderHexCard(document.getElementById('changed-card'), cn, cv, true);
    } else {
      document.getElementById('change-wrap').style.display = 'none';
    }
  }

  function renderHexCard(el, hexNum, vals, isChanged) {
    const hx = H[hexNum];
    const loBits = trigramBits(vals, 0);
    const upBits = trigramBits(vals, 3);
    const tLo = TRIG[loBits], tUp = TRIG[upBits];
    const ft = getFortuneLabel(hexNum);
    const lqData = getHexLiuQin(hexNum, loBits, upBits);
    const palEle = PALACE_MAP[hexNum] || '土';

    // Visual lines (top to bottom = index 5..0)
    let linesHTML = '';
    for (let i = 5; i >= 0; i--) {
      const yang = vals[i]===7||vals[i]===9;
      const chg = !isChanged && (vals[i]===6||vals[i]===9);
      const bars = yang
        ? `<div class="bar bar-yang"></div>`
        : `<div class="bar bar-yin1"></div><div class="bar bar-yin2"></div>`;
      const tagTxt = chg ? (yang?'老陽 變':'老陰 變') : (yang?'陽':'陰');
      const tagCls = chg ? 'tag-chg' : (yang ? 'tag-yang' : 'tag-yin');
      const lq = lqData[i];
      linesHTML += `<div class="hline${chg?' changing':''}">
        <div class="hline-num">${hx.ln[i][0].slice(0,2)}</div>
        <div class="hline-bars">${bars}</div>
        <div class="hline-lq">
          <span class="lq-zhi">${lq.zhi}</span>
          <span class="lq-badge ${lq.cls}">${lq.lq}</span>
        </div>
        <div class="hline-tag"><span class="${tagCls}">${tagTxt}</span></div>
      </div>`;
    }

    // Trigram row
    const triHTML = `
      <div class="trigram-row">
        <div class="trigram-box">
          <div class="trigram-sym">${tUp.sym}</div>
          <div class="trigram-name">上卦 ${tUp.name}</div>
          <div class="trigram-attr">${tUp.attr}・${tUp.ele}・${tUp.dir}</div>
        </div>
        <div class="trig-arrow">✕</div>
        <div class="trigram-box">
          <div class="trigram-sym">${tLo.sym}</div>
          <div class="trigram-name">下卦 ${tLo.name}</div>
          <div class="trigram-attr">${tLo.attr}・${tLo.ele}・${tLo.dir}</div>
        </div>
      </div>`;

    // Lines interpretation
    let interpHTML = '';
    if (!isChanged) {
      const anyChg = hasChanging(vals);
      const items = hx.ln.map((ln,i) => {
        const chg = vals[i]===6||vals[i]===9;
        if (anyChg && !chg) return '';
        return `<div class="line-item${chg?' changing':''}">
          <div class="line-item-hd">
            <span class="line-item-name">${ln[0]}</span>
            ${chg ? '<span class="line-chg-badge">動爻</span>' : ''}
          </div>
          <div class="line-item-text">「${ln[1]}」</div>
          <div class="line-item-interp">${ln[2]}</div>
        </div>`;
      }).join('');
      const secLabel = anyChg
        ? '🔄 動爻提示'
        : '📋 六爻詳解';
      const secHint = anyChg
        ? '<div class="sec-hint">動爻是這次占卦的關鍵變化所在</div>'
        : '<div class="sec-hint">靜卦，六爻皆可參考</div>';
      interpHTML = `<div class="sec-label">${secLabel}</div>${secHint}<div class="lines-list">${items}</div>`;
    }

    el.classList.remove('anim-enter');
    void el.offsetWidth;
    el.innerHTML = `
      <div class="hex-header">
        <div class="hex-symbol-wrap">
          <div class="hex-symbol" title="第${hexNum}卦">${hx.u}</div>
          ${!isChanged ? `<div class="ft-badge ${ft.cls}">${ft.label}</div>` : ''}
        </div>
        <div class="hex-info">
          <div class="hex-num">第 ${hexNum} 卦</div>
          <div class="hex-name">${hx.n}卦</div>
          <div class="hex-struct">${hx.st}</div>
          <div class="hex-virtue">核心：${hx.vt}</div>
          <div class="palace-tag">宮：<span class="palace-ele palace-${palEle}">${palEle}</span></div>
        </div>
      </div>
      ${triHTML}
      <div class="hex-visual">${linesHTML}</div>
      <div class="sec-label">📜 卦辭</div>
      <div class="guaci">《${hx.n}》${hx.gc}</div>
      <div class="sec-label">💡 現代解讀</div>
      <div class="modern-text">${hx.md}</div>
      ${interpHTML}
      ${!isChanged ? renderMinguaLink(hexNum, loBits, upBits) : ''}
    `;
    el.classList.add('anim-enter');
    el.querySelectorAll('.hline').forEach((hline, idx) => {
      const d = (0.38 + idx * 0.12).toFixed(2) + 's';
      hline.style.animationDelay = d;
      hline.querySelectorAll('.bar').forEach(bar => {
        bar.style.animationDelay = (0.38 + idx * 0.12 + 0.06).toFixed(2) + 's';
      });
    });
  }

  // ══════════════════════════════════════
  // AI 解卦
  // ══════════════════════════════════════
  // 複製一般 AI 解卦的 prompt
  async function copyAIPrompt() {
    const btn = document.getElementById('copy-ai-prompt-btn');
    const mainNum = linesToHexNum(state.castLines);
    const hx = H[mainNum];
    const cv = hasChanging(state.castLines) ? changedVals(state.castLines) : null;
    const cn = cv ? linesToHexNum(cv) : null;
    const changingLines = hx.ln
      .map((ln,i) => state.castLines[i]===6||state.castLines[i]===9 ? {name:ln[0],text:ln[1]} : null)
      .filter(Boolean);
    const q    = getEffectiveQuestion();
    const lean = (document.getElementById('q-lean') || {}).value || '';
    const worry= (document.getElementById('q-worry') || {}).value || '';
    const gz   = state.castTimeGz || Cal.getFullGanZhi(new Date());

    btn.disabled = true;
    btn.textContent = '取得中…';
    try {
      const r = await fetch('/api/ai-interpret', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-api-key': getApiKey() },
        body: JSON.stringify({
          return_prompt_only: true,
          question: q, category: state.category, inclination: lean,
          worry: worry, reaction: state.reaction, ai_style: state.aiStyle,
          main_hex: mainNum, main_name: hx.n, guaci: hx.gc,
          virtue: hx.vt, modern: hx.md,
          changing_lines: changingLines,
          changed_hex: cn, changed_name: cn ? H[cn].n : null,
          changed_guaci: cn ? H[cn].gc : null,
          ganzhi_info: gz,
        })
      });
      const data = await r.json();
      if (!data.prompt) throw new Error('無法取得 prompt');
      await _copyToClipboard(data.prompt);
      btn.textContent = '✓ 已複製！';
      btn.classList.add('copied');
    } catch(e) {
      btn.textContent = '複製失敗';
    }
    btn.disabled = false;
    setTimeout(() => { btn.textContent = '📋 複製解卦指令'; btn.classList.remove('copied'); }, 2000);
  }

  // 共用剪貼簿工具
  async function _copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch(e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  async function doAI() {
    const btn = document.getElementById('ai-btn');
    const resultDiv = document.getElementById('ai-result');
    const textDiv = document.getElementById('ai-text');
    btn.disabled = true;
    btn.textContent = '✦ AI解析中…';
    resultDiv.style.display = 'block';
    textDiv.innerHTML = '<span class="ai-loading">正在以易經智慧解析，請稍候…</span>';

    const mainNum = linesToHexNum(state.castLines);
    const hx = H[mainNum];
    const cv = hasChanging(state.castLines) ? changedVals(state.castLines) : null;
    const cn = cv ? linesToHexNum(cv) : null;

    const changingLines = hx.ln
      .map((ln,i) => state.castLines[i]===6||state.castLines[i]===9 ? {name:ln[0],text:ln[1]} : null)
      .filter(Boolean);

    const q = getEffectiveQuestion();
    const lean = (document.getElementById('q-lean') || {}).value || '';
    const worry = (document.getElementById('q-worry') || {}).value || '';
    const gz = state.castTimeGz || Cal.getFullGanZhi(new Date());

    try {
      const r = await fetch('/api/ai-interpret', {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'x-api-key': getApiKey()},
        body: JSON.stringify({
          reading_id: state.currentReadingId,
          question: q,
          category: state.category,
          inclination: lean,
          worry: worry,
          reaction: state.reaction,
          ai_style: state.aiStyle,
          main_hex: mainNum,
          main_name: hx.n,
          guaci: hx.gc,
          virtue: hx.vt,
          modern: hx.md,
          changing_lines: changingLines,
          changed_hex: cn,
          changed_name: cn ? H[cn].n : null,
          changed_guaci: cn ? H[cn].gc : null,
          ganzhi_info: gz,
        })
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      // Render AI text with section highlights
      const rendered = data.interpretation
        .replace(/^(⭐[^\n]*)/gm, '<div class="ai-fortune">$1</div>')
        .replace(/^(💬[^\n]*\n)([\s\S]*?)(?=\n[📖🎯✅⚠️]|$)/gm, '<div class="ai-oneline"><div class="ai-sec-title">$1</div>$2</div>')
        .replace(/\n/g, '<br>');
      textDiv.innerHTML = rendered;
      if (data.model) {
        textDiv.innerHTML += `<div class="ai-model-note">使用模型：${data.model}</div>`;
      }
      btn.textContent = '✦ 重新解卦';
      btn.disabled = false;
    } catch(e) {
      textDiv.innerHTML = `<span style="color:#c0392b">AI解卦失敗：${e.message}</span>`;
      btn.textContent = '✦ AI 深度解卦';
      btn.disabled = false;
    }
  }

  // ══════════════════════════════════════
  // 儲存記錄
  // ══════════════════════════════════════
  async function saveReading() {
    const mainNum = linesToHexNum(state.castLines);
    const cv = hasChanging(state.castLines) ? changedVals(state.castLines) : null;
    const cn = cv ? linesToHexNum(cv) : null;
    const q = getEffectiveQuestion();
    const lean = (document.getElementById('q-lean') || {}).value || '';
    const worry = (document.getElementById('q-worry') || {}).value || '';
    const gz = state.castTimeGz || Cal.getFullGanZhi(new Date());
    const questionFull = [
      state.category ? `【${state.category}】` : '',
      q,
      lean ? `傾向：${lean}` : '',
      worry ? `擔心：${worry}` : '',
    ].filter(Boolean).join(' ');

    try {
      const r = await fetch('/api/readings', {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'x-user-id': getUserId()},
        body: JSON.stringify({
          question: questionFull || q,
          main_hex: mainNum,
          main_name: H[mainNum].n,
          lines: state.castLines,
          changed_hex: cn,
          changed_name: cn ? H[cn].n : null,
          cast_method: state.castMethod === 'time' ? '時辰起卦' : state.castMethod === 'manual' ? '手動輸入' : '銅錢法',
          ganzhi_info: gz,
        })
      });
      const data = await r.json();
      state.currentReadingId = data.id;
      document.getElementById('save-msg').textContent = `✓ 已儲存（記錄 #${data.id}）`;
    } catch(e) {
      document.getElementById('save-msg').textContent = '儲存失敗，請確認伺服器連線。';
    }
  }

  function resetAll() {
    state.castLines = [];
    state.castStep = 0;
    state.castTimeGz = null;
    state.castMethod = null;
    state.currentReadingId = null;
    state.category = '';
    state.reaction = '';
    state.aiStyle = 'friend';
    if (state.tcaTimer) { clearTimeout(state.tcaTimer); state.tcaTimer = null; }
    const rwEl = document.getElementById('result-wrap');
    rwEl.classList.remove('anim-in');
    rwEl.style.display = 'none';
    document.getElementById('cast-anim').style.display = 'none';
    document.getElementById('time-cast-anim').classList.remove('active');
    document.getElementById('q-card').style.display = 'block';
    document.getElementById('ai-result').style.display = 'none';
    document.getElementById('q-input').value = '';
    document.getElementById('save-msg').textContent = '';
    document.getElementById('ai-btn').textContent = '✦ AI 深度解卦';
    document.getElementById('ai-btn').disabled = false;
    // Reset category buttons
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    // Reset reaction panel
    document.querySelectorAll('.react-btn').forEach(b => b.classList.remove('active'));
    const ri = document.getElementById('reaction-insight');
    if (ri) { ri.textContent = ''; ri.style.display = 'none'; }
    // Reset AI style to friend
    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
    const defStyle = document.querySelector('.style-btn[data-style="friend"]');
    if (defStyle) defStyle.classList.add('active');
    // Reset optional fields
    document.getElementById('q-optional-fields').style.display = 'none';
    document.getElementById('q-toggle-icon').textContent = '＋';
    const lean = document.getElementById('q-lean');
    const worry = document.getElementById('q-worry');
    if (lean) lean.value = '';
    if (worry) worry.value = '';
    // 隱藏傳統解析與導出列
    const tradResult  = document.getElementById('trad-ai-result');
    const tradActions = document.getElementById('result-actions-trad');
    if (tradResult)  tradResult.style.display = 'none';
    if (tradActions) tradActions.classList.remove('visible');
    const tradBtn = document.getElementById('trad-ai-btn');
    if (tradBtn) { tradBtn.textContent = '☯ 六爻傳統解析'; tradBtn.disabled = false; }
  }

  // ══════════════════════════════════════
  // 卦象索引
  // ══════════════════════════════════════
  function buildHexGrid() {
    const grid = document.getElementById('hex-grid');
    grid.innerHTML = '';
    for (let i = 1; i <= 64; i++) {
      const hx = H[i];
      const tile = document.createElement('div');
      tile.className = 'hex-tile';
      tile.dataset.num = i;
      tile.dataset.name = hx.n;
      tile.dataset.vt = hx.vt;
      tile.dataset.up = hx.up;
      tile.dataset.lo = hx.lo;
      tile.innerHTML = `
        <div class="tile-num">第${i}卦</div>
        <span class="tile-sym">${hx.u}</span>
        <div class="tile-name">${hx.n}</div>
        <div class="tile-vt">${hx.vt}</div>
      `;
      tile.onclick = () => showHexModal(i);
      grid.appendChild(tile);
    }
  }

  function filterIndex(q) {
    state.indexFilter = q.toLowerCase();
    applyIndexFilter();
  }

  function filterByTrigram(btn, type) {
    document.querySelectorAll('.trig-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.indexUpFilter = btn.dataset.up;
    applyIndexFilter();
  }

  function applyIndexFilter() {
    document.querySelectorAll('.hex-tile').forEach(tile => {
      const num = parseInt(tile.dataset.num);
      const hx = H[num];
      const q = state.indexFilter;
      const up = state.indexUpFilter;
      const nameMatch = !q || hx.n.includes(q) || hx.vt.includes(q) || hx.md.includes(q) || String(num) === q;
      const upMatch = !up || String(hx.up) === up;
      tile.classList.toggle('hidden', !(nameMatch && upMatch));
    });
  }

  function showHexModal(num) {
    const hx = H[num];
    const tUp = TRIG[hx.up], tLo = TRIG[hx.lo];
    const linesHTML = hx.ln.map((ln,i) => `
      <div class="line-item">
        <div class="line-item-name">${ln[0]}</div>
        <div class="line-item-text">「${ln[1]}」</div>
        <div class="line-item-interp">${ln[2]}</div>
      </div>
    `).join('');
    document.getElementById('hex-modal-body').innerHTML = `
      <div class="hex-header">
        <div class="hex-symbol">${hx.u}</div>
        <div>
          <div class="hex-num">第 ${num} 卦</div>
          <div class="hex-name">${hx.n}卦</div>
          <div class="hex-struct">${hx.st}</div>
          <div class="hex-virtue">${hx.vt}</div>
        </div>
      </div>
      <div class="trigram-row">
        <div class="trigram-box"><div class="trigram-sym">${tUp.sym}</div><div class="trigram-name">上卦・${tUp.name}（${tUp.attr}）${tUp.dir}・${tUp.ele}</div></div>
        <div class="trigram-box"><div class="trigram-sym">${tLo.sym}</div><div class="trigram-name">下卦・${tLo.name}（${tLo.attr}）${tLo.dir}・${tLo.ele}</div></div>
      </div>
      <div class="sec-label">卦辭</div>
      <div class="guaci">《${hx.n}》${hx.gc}</div>
      <div class="sec-label">卦義</div>
      <div class="modern-text">${hx.md}</div>
      <div class="sec-label">六爻全解</div>
      <div class="lines-list">${linesHTML}</div>
    `;
    document.getElementById('hex-modal').style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('hex-modal').style.display = 'none';
  }

  // ══════════════════════════════════════
  // 歷史記錄
  // ══════════════════════════════════════
  async function loadHistory(page) {
    state.histPage = page;
    try {
      const r = await fetch(`/api/readings?page=${page}&limit=15`, {
        headers: {'x-user-id': getUserId()}
      }).then(x => x.json());
      const el = document.getElementById('hist-list');
      const statsEl = document.getElementById('hist-stats');
      statsEl.textContent = `共 ${r.total} 筆記錄`;
      if (!r.data.length) { el.innerHTML = '<div class="card" style="color:var(--ink2);text-align:center">尚無記錄，起卦後可儲存。</div>'; return; }

      el.innerHTML = r.data.map(row => {
        const gz = row.ganzhi_info || null;
        const gzStr = gz ? `${gz.year}年 ${gz.month}月 ${gz.day}日 ${gz.hour}（${gz.shichen}）` : '';
        const ft = getFortuneLabel(row.main_hex);
        const changed = row.changed_hex ? `<span class="hist-tag changed">→ ${row.changed_name}卦</span>` : '';
        const ai = row.has_ai ? '<span class="hist-tag ai">✦ AI解卦</span>' : '';
        const methodIcon = row.cast_method === '時辰起卦' ? '🕐' : row.cast_method === '手動輸入' ? '✍️' : '🪙';
        const methodCls  = row.cast_method === '時辰起卦' ? 'method-time' : row.cast_method === '手動輸入' ? 'method-manual' : 'method-coins';
        const method = row.cast_method ? `<span class="hist-tag method ${methodCls}">${methodIcon} ${row.cast_method}</span>` : '';
        return `<div class="hist-item" onclick="App.viewHistDetail('${row.id}')">
          <div class="hist-top">
            <span class="hist-sym">${H[row.main_hex]?.u||'?'}</span>
            <div class="hist-main">
              <div class="hist-name-row">
                <span class="hist-num">第${row.main_hex}卦</span>
                <span class="hist-name">${row.main_name}</span>
                <span class="ft-mini ${ft.cls}">${ft.label}</span>
              </div>
              ${row.question ? `<div class="hist-q">「${row.question}」</div>` : '<div class="hist-q" style="color:var(--ink3)">未填問題</div>'}
            </div>
            <div class="hist-right">
              <div class="hist-date">${formatDate(row.created_at)}</div>
              <button class="hist-delete" onclick="App.deleteReading(event,'${row.id}')">✕</button>
            </div>
          </div>
          ${gzStr ? `<div class="hist-gz">${gzStr}</div>` : ''}
          <div class="hist-tags">${method}${changed}${ai}</div>
        </div>`;
      }).join('');

      // Pagination
      const pages = Math.ceil(r.total / 15);
      const pg = document.getElementById('hist-pagination');
      pg.innerHTML = '';
      for (let i = 1; i <= pages; i++) {
        const b = document.createElement('button');
        b.className = 'pg-btn' + (i === page ? ' active' : '');
        b.textContent = i;
        b.onclick = () => loadHistory(i);
        pg.appendChild(b);
      }
    } catch(e) {
      document.getElementById('hist-list').innerHTML = '<div class="card" style="color:var(--ink2)">無法載入記錄，請確認伺服器連線。</div>';
    }
  }

  async function viewHistDetail(id) {
    const row = await fetch(`/api/readings/${id}`, {
      headers: {'x-user-id': getUserId()}
    }).then(x => x.json());
    const lines = Array.isArray(row.lines) ? row.lines : JSON.parse(row.lines);
    state.castLines = lines;
    state.currentReadingId = id;
    const gz = row.ganzhi_info || null;
    state.castTimeGz = gz;
    if (row.question) document.getElementById('q-input').value = row.question;
    switchPage('cast');
    displayResult();
    if (row.ai_interp) {
      document.getElementById('ai-result').style.display = 'block';
      document.getElementById('ai-text').textContent = row.ai_interp;
    }
  }

  async function deleteReading(e, id) {
    e.stopPropagation();
    if (!confirm('確定刪除這筆記錄？')) return;
    await fetch(`/api/readings/${id}`, {
      method:'DELETE',
      headers: {'x-user-id': getUserId()}
    });
    loadHistory(state.histPage);
  }

  // ══════════════════════════════════════
  // 導出 PNG（書法風卡片）
  // ══════════════════════════════════════
  // ══════════════════════════════════════
  // 傳統六爻解析 — 導出圖檔
  // ══════════════════════════════════════
  async function exportTradResult() {
    const textDiv = document.getElementById('trad-ai-text');
    if (!textDiv || !textDiv.innerText.trim()) return;

    const btn = document.getElementById('trad-export-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳'; }

    const mainNum = linesToHexNum(state.castLines);
    const hx      = H[mainNum];
    const gz      = state.castTimeGz || Cal.getFullGanZhi(new Date());
    const question= getEffectiveQuestion();

    // 取得純文字（innerText 會把 <br> 轉換為換行）
    const rawText = textDiv.innerText.trim();

    const W   = 820;
    const PAD = 52;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const C = {
      bg:'#f5f0e8', bg2:'#ede5d0',
      border:'#2a1e0e', borderLight:'#8a7060',
      gold:'#8a6018',
      ink:'#1a1208', ink2:'#3a2e1e', ink3:'#6a5c48', ink4:'#9a8c78',
      yin:'#2a3c52', yin2:'#3a5068',
      red:'#8b1a1a',
    };

    function wrapTxt(ctx, text, maxW) {
      const out = []; let line = '';
      for (const ch of [...text]) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = ch; }
        else line = test;
      }
      if (line) out.push(line);
      return out;
    }

    // 先用臨時 canvas 計算總高度
    const tmpC = document.createElement('canvas');
    const tmpX = tmpC.getContext('2d');

    const FONT_BODY = `15px 'Noto Serif TC', serif`;
    const FONT_HEAD = `bold 15px 'Noto Serif TC', serif`;
    const LINE_H    = 26;
    const CONTENT_W = W - PAD * 2;

    function calcHeight() {
      let y = 0;
      y += 60;  // 頂部 header
      y += 50;  // 卦名區
      if (question) y += 36; // 問事
      y += 16;  // hairline
      // 解析文字
      const lines = rawText.split('\n');
      for (const ln of lines) {
        const trimmed = ln.trim();
        if (!trimmed) { y += 10; continue; }
        const isHead = /^[🔮⚡📖🎯]/.test(trimmed);
        tmpX.font = isHead ? FONT_HEAD : FONT_BODY;
        const wrapped = wrapTxt(tmpX, trimmed, CONTENT_W - 16);
        y += wrapped.length * LINE_H + (isHead ? 14 : 4);
      }
      y += 60; // footer
      return y + 40;
    }

    const totalH = calcHeight();

    const canvas = document.createElement('canvas');
    canvas.width  = W * dpr;
    canvas.height = totalH * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // ── 背景 ──
    const bg = ctx.createLinearGradient(0, 0, W, totalH);
    bg.addColorStop(0, '#f8f3ea'); bg.addColorStop(1, '#ede5d0');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, totalH);

    // ── 外框 ──
    ctx.strokeStyle = C.border; ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, W-36, totalH-36);
    ctx.strokeStyle = C.borderLight; ctx.lineWidth = 0.5;
    ctx.strokeRect(24, 24, W-48, totalH-48);

    // ── 角括號 ──
    [[18,18,1,1],[W-18,18,-1,1],[18,totalH-18,1,-1],[W-18,totalH-18,-1,-1]].forEach(([cx,cy,dx,dy]) => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy+dy*24); ctx.lineTo(cx,cy); ctx.lineTo(cx+dx*24,cy);
      ctx.stroke();
    });

    let y = 46;

    // ── 頂部標題 ──
    ctx.textAlign = 'center';
    ctx.font = `13px serif`; ctx.fillStyle = C.ink3;
    ctx.fillText('易  經  占  卦  系  統', W/2, y); y += 12;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(PAD+30,y); ctx.lineTo(W-PAD-30,y); ctx.stroke(); y += 18;

    // ── 傳統六爻卜法解析 標題 ──
    ctx.font = `bold 18px serif`; ctx.fillStyle = C.yin;
    ctx.fillText('傳  統  六  爻  卜  法  解  析', W/2, y); y += 10;
    ctx.strokeStyle = 'rgba(42,60,82,.25)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(PAD+30,y); ctx.lineTo(W-PAD-30,y); ctx.stroke(); y += 16;

    // ── 卦名 ──
    ctx.font = `bold 22px serif`; ctx.fillStyle = C.ink;
    ctx.fillText(`${hx.u}  第${mainNum}卦《${hx.n}》`, W/2, y); y += 8;
    ctx.font = `13px serif`; ctx.fillStyle = C.ink3;
    ctx.fillText(hx.st || '', W/2, y); y += 16;

    // ── 時間 ──
    ctx.font = `12px serif`; ctx.fillStyle = C.ink4;
    ctx.fillText(`${gz.year}年　月柱 ${gz.month}　日柱 ${gz.day}`, W/2, y); y += 18;

    // ── 問事 ──
    if (question) {
      ctx.font = `13px serif`; ctx.fillStyle = C.red;
      ctx.fillText(`問：${question}`, W/2, y); y += 20;
    }

    // ── 分隔線 ──
    ctx.strokeStyle = C.borderLight; ctx.lineWidth = 0.5;
    ctx.setLineDash([3,7]);
    ctx.beginPath(); ctx.moveTo(PAD+20,y); ctx.lineTo(W-PAD-20,y); ctx.stroke();
    ctx.setLineDash([]); y += 18;

    // ── 解析內容 ──
    ctx.textAlign = 'left';
    const lines = rawText.split('\n');
    for (const ln of lines) {
      const trimmed = ln.trim();
      if (!trimmed) { y += 10; continue; }
      const isHead = /^[🔮⚡📖🎯]/.test(trimmed);
      if (isHead) {
        y += 6;
        ctx.font = FONT_HEAD;
        ctx.fillStyle = /🎯/.test(trimmed) ? C.red : C.yin;
        const wrapped = wrapTxt(ctx, trimmed, CONTENT_W);
        for (const wl of wrapped) { ctx.fillText(wl, PAD, y); y += LINE_H; }
        y += 4;
      } else {
        ctx.font = FONT_BODY; ctx.fillStyle = C.ink2;
        const wrapped = wrapTxt(ctx, trimmed, CONTENT_W - 12);
        for (const wl of wrapped) { ctx.fillText(wl, PAD + 12, y); y += LINE_H; }
        y += 2;
      }
    }

    // ── footer ──
    y += 20;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(PAD+30,y); ctx.lineTo(W-PAD-30,y); ctx.stroke(); y += 14;
    ctx.textAlign = 'center';
    ctx.font = `11px serif`; ctx.fillStyle = C.ink4;
    ctx.fillText('易 經 占 卦 系 統　· 傳 統 六 爻 卜 法', W/2, y);

    // ── 下載 ──
    const link = document.createElement('a');
    const dateStr = new Date().toLocaleDateString('zh-TW').replace(/\//g, '-');
    link.download = `六爻解析_第${mainNum}卦_${hx.n}_${dateStr}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    if (btn) { btn.disabled = false; btn.textContent = '📄'; }
  }

  async function exportCard() {
    if (!state.castLines.length) return;
    const btn = document.getElementById('btn-export');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ 生成中…'; }

    const mainNum = linesToHexNum(state.castLines);
    const hx = H[mainNum];
    const cv = hasChanging(state.castLines) ? changedVals(state.castLines) : null;
    const cn = cv ? linesToHexNum(cv) : null;
    const ft = getFortuneLabel(mainNum);
    const gz = state.castTimeGz || Cal.getFullGanZhi(new Date());

    const W = 820, PAD = 56;

    const C = {
      bg:'#faf6ef', bg2:'#f0e8d4', paper:'#e8ddc4',
      border:'#2a1e0e', borderLight:'#8a7060',
      gold:'#8a6018', gold2:'#a07828',
      seal:'#8b1a1a', sealLight:'#c03030',
      ink:'#1a1208', ink2:'#5a4030', ink3:'#8a7060',
      yin:'#2a4060', yin2:'#3a5070',
    };

    const ftInfo = {
      'ft-great':   { label:'大 吉', color:'#8b1a1a', border:'#8b1a1a' },
      'ft-good':    { label:'吉',    color:'#1a5a2a', border:'#1a5a2a' },
      'ft-neutral': { label:'平',    color:'#5a4030', border:'#5a4030' },
      'ft-caution': { label:'謹慎',  color:'#6a3a10', border:'#6a3a10' },
    }[ft.cls];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function wrapTxt(ctx, text, maxW) {
      const out = [];
      let line = '';
      for (const ch of [...text]) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = ch; }
        else line = test;
      }
      if (line) out.push(line);
      return out;
    }

    function rFill(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
      ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
      ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
      ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
      ctx.closePath(); ctx.fill();
    }
    function rStroke(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
      ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
      ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
      ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
      ctx.closePath(); ctx.stroke();
    }

    function hairline(ctx, w, y) {
      ctx.save();
      ctx.strokeStyle = C.borderLight;
      ctx.lineWidth = 0.6;
      ctx.setLineDash([3, 7]);
      ctx.beginPath(); ctx.moveTo(PAD+30,y); ctx.lineTo(w-PAD-30,y); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
    }

    function sectionLabel(ctx, text, x, y) {
      ctx.font = `11px serif`;
      ctx.fillStyle = C.gold;
      ctx.textAlign = 'left';
      ctx.fillText(text, x, y);
    }

    function draw(ctx, totalH) {
      const w = W, pad = PAD;

      // Paper background
      const bg = ctx.createLinearGradient(0, 0, w, totalH);
      bg.addColorStop(0, '#faf6ef'); bg.addColorStop(1, '#f2e8d5');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, totalH);

      // Outer + inner border lines
      ctx.strokeStyle = C.border; ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, w-40, totalH-40);
      ctx.strokeStyle = C.borderLight; ctx.lineWidth = 0.6;
      ctx.strokeRect(26, 26, w-52, totalH-52);

      // Corner brackets
      [[20,20,1,1],[w-20,20,-1,1],[20,totalH-20,1,-1],[w-20,totalH-20,-1,-1]].forEach(([cx,cy,dx,dy]) => {
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy+dy*28); ctx.lineTo(cx,cy); ctx.lineTo(cx+dx*28,cy);
        ctx.stroke();
      });

      let y = 50;

      // Header
      ctx.textAlign = 'center';
      ctx.font = `bold 13px serif`;
      ctx.fillStyle = C.ink2;
      ctx.fillText('易  經  占  卦  系  統', w/2, y);
      y += 10;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(pad+50,y); ctx.lineTo(w-pad-50,y); ctx.stroke();
      y += 30;

      // Hexagram unicode symbol
      ctx.font = `120px serif`;
      ctx.fillStyle = C.border;
      ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 10;
      ctx.fillText(hx.u, w/2, y+108);
      ctx.shadowBlur = 0;
      y += 126;

      // Fortune seal (right of symbol)
      const sealSz = 52, sealX = w/2+96, sealY = y - 120;
      ctx.strokeStyle = ftInfo.border; ctx.lineWidth = 1.5;
      rStroke(ctx, sealX, sealY, sealSz, sealSz, 4);
      ctx.fillStyle = ftInfo.color; ctx.textAlign = 'center';
      if (ftInfo.label.length > 2) {
        ctx.font = `bold 12px serif`;
        ctx.fillText(ftInfo.label.slice(0,2), sealX+sealSz/2, sealY+22);
        ctx.fillText(ftInfo.label.slice(2),   sealX+sealSz/2, sealY+38);
      } else {
        ctx.font = `bold ${ftInfo.label.length===1?'22':'16'}px serif`;
        ctx.fillText(ftInfo.label, sealX+sealSz/2, sealY+34);
      }

      // Hex number + name
      ctx.textAlign = 'center';
      ctx.font = `12px serif`; ctx.fillStyle = C.ink3;
      ctx.fillText(`第  ${mainNum}  卦`, w/2, y); y += 24;
      ctx.font = `bold 36px serif`; ctx.fillStyle = C.border;
      ctx.fillText(`${hx.n} 卦`, w/2, y); y += 12;

      // Structure
      ctx.font = `12px serif`; ctx.fillStyle = C.ink2;
      ctx.fillText(hx.st, w/2, y); y += 20;

      // Virtue box
      ctx.font = `12px serif`;
      const vtW = ctx.measureText(hx.vt).width + 26;
      const vtX = w/2 - vtW/2;
      ctx.fillStyle = C.bg2; rFill(ctx, vtX, y, vtW, 23, 4);
      ctx.strokeStyle = C.borderLight; ctx.lineWidth = 0.7; rStroke(ctx, vtX, y, vtW, 23, 4);
      ctx.fillStyle = C.ink2; ctx.fillText(hx.vt, w/2, y+16);
      y += 36;

      hairline(ctx, w, y); y += 22;

      // Trigrams
      const loBits = trigramBits(state.castLines, 0);
      const upBits = trigramBits(state.castLines, 3);
      const tLo = TRIG[loBits], tUp = TRIG[upBits];
      const triW = (w - pad*2 - 28) / 2;

      [{ trig:tUp, label:'上卦', x:pad }, { trig:tLo, label:'下卦', x:pad+triW+28 }].forEach(({ trig, label, x }) => {
        ctx.fillStyle = C.bg2; rFill(ctx, x, y, triW, 64, 5);
        ctx.strokeStyle = C.borderLight; ctx.lineWidth = 0.7; rStroke(ctx, x, y, triW, 64, 5);
        ctx.textAlign = 'center';
        ctx.font = `24px serif`; ctx.fillStyle = C.border;
        ctx.fillText(trig.sym, x+triW/2, y+30);
        ctx.font = `12px serif`; ctx.fillStyle = C.ink2;
        ctx.fillText(`${label}・${trig.name}（${trig.attr}）`, x+triW/2, y+48);
        ctx.font = `10px serif`; ctx.fillStyle = C.ink3;
        ctx.fillText(`${trig.ele}・${trig.dir}`, x+triW/2, y+62);
      });
      y += 80;

      hairline(ctx, w, y); y += 16;

      // Six lines
      sectionLabel(ctx, '六  爻  卦  象', pad, y); y += 18;
      const barX = pad + 36, barW = w - pad*2 - 36 - 64;
      const lh = 14, lg = 10;
      for (let i = 5; i >= 0; i--) {
        const v = state.castLines[i];
        const yang = v===7||v===9, chg = v===6||v===9;
        ctx.font = `10px serif`; ctx.fillStyle = C.ink3; ctx.textAlign = 'right';
        ctx.fillText(hx.ln[i][0].slice(0,2), pad+30, y+lh-2);
        if (yang) {
          ctx.fillStyle = chg ? C.sealLight : C.ink2;
          if (chg) { ctx.shadowColor='rgba(192,48,48,0.3)'; ctx.shadowBlur=6; }
          rFill(ctx, barX, y+2, barW, lh-4, 2);
          ctx.shadowBlur = 0;
        } else {
          const half = (barW - 12) / 2;
          ctx.fillStyle = chg ? C.sealLight : C.yin;
          rFill(ctx, barX, y+2, half, lh-4, 2);
          rFill(ctx, barX+half+12, y+2, half, lh-4, 2);
        }
        ctx.textAlign = 'left'; ctx.font = `10px serif`;
        ctx.fillStyle = chg ? C.sealLight : (yang ? C.gold : C.yin);
        ctx.fillText(chg?(yang?'老陽 →':'老陰 →'):(yang?'陽':'陰'), barX+barW+8, y+lh-2);
        y += lh + lg;
      }
      y += 10;

      hairline(ctx, w, y); y += 18;

      // Question
      const qText = getEffectiveQuestion();
      const catText = state.category;
      if (qText || catText) {
        sectionLabel(ctx, '問  事', pad, y); y += 16;
        const qFull = [catText?`【${catText}】`:'', qText].filter(Boolean).join('　');
        ctx.font = `14px "Noto Serif TC", serif`;
        const qLines = wrapTxt(ctx, qFull, w - pad*2 - 24);
        const qBoxH = qLines.length * 23 + 16;
        ctx.fillStyle = C.bg2; rFill(ctx, pad, y, w-pad*2, qBoxH, 4);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pad, y+5); ctx.lineTo(pad, y+qBoxH-5); ctx.stroke();
        ctx.fillStyle = C.ink; ctx.textAlign = 'left';
        qLines.forEach((l,i) => ctx.fillText(l, pad+16, y+18+i*23));
        y += qBoxH + 14;
        hairline(ctx, w, y); y += 18;
      }

      // Guaci
      sectionLabel(ctx, '卦  辭', pad, y); y += 16;
      ctx.font = `15px "Noto Serif TC", serif`;
      const gcLines = wrapTxt(ctx, `《${hx.n}》${hx.gc}`, w - pad*2 - 24);
      const gcBoxH = gcLines.length * 26 + 18;
      ctx.fillStyle = C.bg2; rFill(ctx, pad, y, w-pad*2, gcBoxH, 4);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(pad, y+5); ctx.lineTo(pad, y+gcBoxH-5); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left';
      gcLines.forEach((l,i) => ctx.fillText(l, pad+16, y+22+i*26));
      y += gcBoxH + 14;

      hairline(ctx, w, y); y += 18;

      // Modern interpretation
      sectionLabel(ctx, '現  代  解  讀', pad, y); y += 16;
      ctx.font = `14px "Noto Serif TC", serif`; ctx.fillStyle = C.ink; ctx.textAlign = 'left';
      wrapTxt(ctx, hx.md, w - pad*2).forEach(l => { ctx.fillText(l, pad, y); y += 22; });
      y += 10;

      // Changed hex
      if (cn) {
        hairline(ctx, w, y); y += 18;
        sectionLabel(ctx, '之  卦', pad, y); y += 18;
        ctx.font = `bold 24px serif`; ctx.fillStyle = C.yin; ctx.textAlign = 'center';
        ctx.fillText(`${H[cn].u}  →  第${cn}卦《${H[cn].n}》`, w/2, y); y += 18;
        ctx.font = `13px "Noto Serif TC", serif`; ctx.fillStyle = C.ink2;
        wrapTxt(ctx, H[cn].gc, w - pad*2).forEach(l => { ctx.fillText(l, w/2, y); y += 21; });
        y += 8; ctx.textAlign = 'left';
      }

      // AI text
      const aiResultEl = document.getElementById('ai-result');
      const aiTextEl   = document.getElementById('ai-text');
      if (aiResultEl?.style.display !== 'none' && aiTextEl) {
        const aiRaw = aiTextEl.innerText.trim().split('\n')
          .filter(l => !l.startsWith('使用模型：')).join('\n').trim();
        if (aiRaw) {
          hairline(ctx, w, y); y += 18;
          sectionLabel(ctx, 'AI  解  卦', pad, y); y += 16;
          for (const rawLine of aiRaw.split('\n')) {
            if (!rawLine.trim()) { y += 6; continue; }
            const isSec = /^[⭐💬📖🎯✅⚠️]/.test(rawLine);
            ctx.font = isSec ? `bold 13px "Noto Serif TC", serif` : `13px "Noto Serif TC", serif`;
            ctx.fillStyle = isSec ? C.gold2 : C.ink;
            ctx.textAlign = 'left';
            wrapTxt(ctx, rawLine, w - pad*2).forEach(l => { ctx.fillText(l, pad, y); y += 21; });
          }
          y += 6;
        }
      }

      // Bottom
      hairline(ctx, w, y); y += 20;
      ctx.textAlign = 'center';
      ctx.font = `12px serif`; ctx.fillStyle = C.ink3;
      const tzStr = gz ? `${gz.year}年　${gz.month}月　${gz.day}日　${gz.shichen}` : '';
      if (tzStr) { ctx.fillText(tzStr, w/2, y); y += 18; }
      ctx.font = `10px serif`; ctx.fillStyle = C.borderLight;
      ctx.fillText('易  經  占  卦  系  統', w/2, y); y += 18;
      ctx.font = `11px serif`; ctx.fillStyle = C.seal;
      ctx.fillText('台  南  小  莊  製  作', w/2, y);
      y += 34;
      return y;
    }

    // Two-pass: estimate height, then render at full DPR
    const est = document.createElement('canvas');
    est.width = W; est.height = 4000;
    const totalH = draw(est.getContext('2d'), 4000) + 10;

    const canvas = document.createElement('canvas');
    canvas.width = W * dpr; canvas.height = totalH * dpr;
    const ctx2 = canvas.getContext('2d');
    ctx2.scale(dpr, dpr);
    draw(ctx2, totalH);

    const link = document.createElement('a');
    const dateStr = new Date().toLocaleDateString('zh-TW').replace(/\//g, '-');
    link.download = `易經_第${mainNum}卦_${hx.n}_${dateStr}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    if (btn) { btn.disabled = false; btn.textContent = '📄 導出圖檔'; }
  }

  // Expose
  return { init, setMethod, startCast, castByTime, doAI, saveReading, resetAll,
           filterIndex, filterByTrigram, closeModal, loadHistory, viewHistDetail, deleteReading,
           openSettings, closeSettings, saveApiKey,
           setCategory, toggleOptional, setReaction, setAiStyle, exportCard, closeSplash,
           toggleTutorial, setMinguaGender, calcAndShowMingua, calcAndShowMeihua,
           doMinguaAI, doMeihuaAI, doTraditionalAI, copyTraditionalPrompt, copyAIPrompt,
           toggleGuide, toggleProxy, updateProxyLabel, exportTradResult, toggleKeyGuide };
})();

document.addEventListener('DOMContentLoaded', App.init);
