/* ════════════════════════════════════════════════════════
   calendar.js — 萬年曆・干支・時辰・梅花易數起卦
════════════════════════════════════════════════════════ */

const Cal = (() => {
  const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const DI_ZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const SHICHEN  = [
    {zhi:'子',start:23,label:'子時（23–01時）',animal:'鼠'},
    {zhi:'丑',start:1, label:'丑時（01–03時）',animal:'牛'},
    {zhi:'寅',start:3, label:'寅時（03–05時）',animal:'虎'},
    {zhi:'卯',start:5, label:'卯時（05–07時）',animal:'兔'},
    {zhi:'辰',start:7, label:'辰時（07–09時）',animal:'龍'},
    {zhi:'巳',start:9, label:'巳時（09–11時）',animal:'蛇'},
    {zhi:'午',start:11,label:'午時（11–13時）',animal:'馬'},
    {zhi:'未',start:13,label:'未時（13–15時）',animal:'羊'},
    {zhi:'申',start:15,label:'申時（15–17時）',animal:'猴'},
    {zhi:'酉',start:17,label:'酉時（17–19時）',animal:'雞'},
    {zhi:'戌',start:19,label:'戌時（19–21時）',animal:'狗'},
    {zhi:'亥',start:21,label:'亥時（21–23時）',animal:'豬'},
  ];
  const WU_XING  = ['木','火','土','金','水'];
  const JIE_QI   = ['小寒','大寒','立春','雨水','驚蟄','春分','清明','穀雨','立夏','小滿','芒種','夏至','小暑','大暑','立秋','處暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];

  // 天干地支年份 (以1984甲子年為基準)
  function getGanZhiYear(year) {
    const g = ((year - 4) % 10 + 10) % 10;
    const z = ((year - 4) % 12 + 12) % 12;
    return TIAN_GAN[g] + DI_ZHI[z];
  }

  // 月干支 (粗略：以農曆月推算，這裡用簡化的公式)
  function getGanZhiMonth(year, month) {
    // 月支：寅月(1月底)~丑月 → 按 (month-1+2) % 12
    const zIdx = (month + 1) % 12;
    // 月干：依年干推算
    const yearGanIdx = ((year - 4) % 10 + 10) % 10;
    const gIdx = (yearGanIdx % 5 * 2 + (month - 1) + 2) % 10;
    return TIAN_GAN[gIdx] + DI_ZHI[zIdx];
  }

  // 日干支 (用儒略日計算)
  function getGanZhiDay(year, month, day) {
    // 甲子日：2000-01-07 = JD 2451551
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    const base = 2451551; // 甲子日 JD
    const diff = ((jd - base) % 60 + 60) % 60;
    return TIAN_GAN[diff % 10] + DI_ZHI[diff % 12];
  }

  // 時辰
  function getShichen(hour) {
    if (hour === 23) return SHICHEN[0];
    return SHICHEN.find((s, i) => {
      const next = SHICHEN[(i + 1) % 12];
      const end = i === 0 ? 1 : next.start;
      return hour >= s.start && hour < end;
    }) || SHICHEN[0];
  }

  // 時辰序號 (0~11，用於梅花易數)
  function getShichenIndex(hour) {
    if (hour === 23) return 0;
    return SHICHEN.findIndex((s, i) => {
      const next = SHICHEN[(i + 1) % 12];
      return hour >= s.start && hour < (i === 0 ? 1 : next.start);
    });
  }

  // 完整干支信息
  function getFullGanZhi(date) {
    const y = date.getFullYear();
    const mo = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours();
    const sc = getShichen(h);
    const scIdx = getShichenIndex(h);
    return {
      year:  getGanZhiYear(y),
      month: getGanZhiMonth(y, mo),
      day:   getGanZhiDay(y, mo, d),
      hour:  sc.zhi + '時',
      shichen: sc.label,
      animal: sc.animal,
      shichenIdx: scIdx,
      raw: { y, mo, d, h }
    };
  }

  // ── 梅花易數起卦法 ──
  // 上卦 = (年數 + 月數 + 日數) % 8，0→8
  // 下卦 = (年數 + 月數 + 日數 + 時辰數) % 8，0→8
  // 動爻 = (年數 + 月數 + 日數 + 時辰數) % 6，0→6
  // 八卦序：乾1坤2震3巽4坎5離6艮7兌8
  const MEI_HUA_ORDER = [7, 0, 1, 6, 2, 5, 4, 3]; // 乾坤震巽坎離艮兌 → bits

  function castByTime(date) {
    const gz = getFullGanZhi(date);
    const { y, mo, d } = gz.raw;
    const scIdx = gz.shichenIdx;
    const yearNum = y; // 直接用年份
    const sum3 = (yearNum + mo + d);
    const sum4 = sum3 + scIdx;

    const upIdx = ((sum3 - 1) % 8 + 8) % 8; // 0-7 → 乾坤震巽坎離艮兌
    const loIdx = ((sum4 - 1) % 8 + 8) % 8;
    const yaoNum = ((sum4 - 1) % 6 + 6) % 6; // 動爻位置(0=初爻)

    const upBits = MEI_HUA_ORDER[upIdx];
    const loBits = MEI_HUA_ORDER[loIdx];

    // 查卦
    const hexNum = LK[upBits * 8 + loBits];

    // 生成六爻（靜卦，動爻設為9老陽或6老陰）
    // 先生成靜卦線
    const lines = buildStaticLines(upBits, loBits);
    // 設定動爻
    const movingLine = lines[yaoNum];
    lines[yaoNum] = movingLine === 7 ? 9 : 6; // 動（老）

    return { hexNum, lines, ganzhi: gz, upBits, loBits, yaoNum };
  }

  // 依上下卦bits建立靜卦爻值
  function buildStaticLines(up, lo) {
    const lines = [];
    // 下卦：線1~3（bits 0,1,2）
    for (let i = 0; i < 3; i++) lines.push((lo >> i & 1) ? 7 : 8);
    // 上卦：線4~6
    for (let i = 0; i < 3; i++) lines.push((up >> i & 1) ? 7 : 8);
    return lines;
  }

  // 格式化顯示用干支字串
  function formatGanZhiDisplay(gz) {
    return `${gz.year}年 ${gz.month}月 ${gz.day}日 ${gz.hour}`;
  }

  // 更新頁面時辰顯示
  function updateShichenUI() {
    const now = new Date();
    const gz = getFullGanZhi(now);
    const el = document.getElementById('shichen-info');
    if (!el) return;
    el.innerHTML = `
      <strong>${gz.shichen}</strong>
      &emsp;${gz.year}年 ${gz.month}月 ${gz.day}日
      &emsp;${now.toLocaleTimeString('zh-TW', {hour:'2-digit',minute:'2-digit'})}
    `;
  }

  return { getFullGanZhi, castByTime, formatGanZhiDisplay, updateShichenUI };
})();
