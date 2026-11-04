/* ======================================================
   page-index.js —— 第一页：今日养生
   日期 / 天气 / 节气中医知识 / 家人体质提示 / 时辰 / 五运六气
   ====================================================== */

(function () {
  const JQ = window.JQ;
  const TCM = window.TCM;
  const R = window.RULE;

  const now = new Date();
  const cur = JQ.currentJieqi(now);
  const nxt = JQ.nextJieqi(now);
  const daysToNext = Math.ceil((nxt.start - now) / 86400000);

  /* ---------- 1. 日期 + 天气 ---------- */
  (function () {
    const week = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
    document.getElementById("tcDate").innerHTML =
      "📅 <b>" + now.getFullYear() + "年" + (now.getMonth() + 1) + "月" + now.getDate() + "日</b>　星期" + week +
      '<span class="tc-jqtag">' + cur.name + " · " + cur.season + "季</span>";

    const wEl = document.getElementById("tcWeather");
    const prof = loadProfile();
    const lat = prof.lat || 24.51;
    const lon = prof.lon || 117.65;
    const region = prof.region || "漳州";

    const codeMap = {
      0: "晴 ☀️", 1: "多云转晴 🌤", 2: "多云 ⛅", 3: "阴 ☁️",
      45: "雾 🌫", 48: "雾凇 🌫",
      51: "小毛毛雨 🌦", 53: "毛毛雨 🌦", 55: "大毛毛雨 🌧",
      61: "小雨 🌦", 63: "中雨 🌧", 65: "大雨 ⛈",
      66: "冻雨 🌨", 67: "强冻雨 🌨",
      71: "小雪 🌨", 73: "中雪 ❄️", 75: "大雪 ❄️", 77: "雪粒 🌨",
      80: "阵雨 🌦", 81: "中阵雨 🌧", 82: "强阵雨 ⛈",
      85: "小阵雪 🌨", 86: "大阵雪 ❄️",
      95: "雷阵雨 ⛈", 96: "雷暴伴冰雹 ⛈", 99: "强雷暴伴冰雹 ⛈"
    };

    // 超时降级：3 秒未响应就显示文字提示
    let done = false;
    const timer = setTimeout(function () {
      if (!done) { done = true; wEl.textContent = "🌤 " + region + "天气获取超时（可离线使用本工具）"; }
    }, 8000);

    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
          "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
          "&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Shanghai&forecast_days=1")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (done) return;
        done = true; clearTimeout(timer);
        if (!d || !d.current) throw new Error("no data");
        const c = d.current;
        const wt = codeMap[c.weather_code] || ("天气代码 " + c.weather_code);
        let extra = "";
        if (d.daily && d.daily.temperature_2m_max) {
          extra = "　今日 " + Math.round(d.daily.temperature_2m_min[0]) + "~" +
                  Math.round(d.daily.temperature_2m_max[0]) + "℃";
        }
        wEl.innerHTML = "🌤 <b>" + region + "</b>：" + wt + "　<b>" + Math.round(c.temperature_2m) + "℃</b>" +
          "（体感 " + Math.round(c.apparent_temperature) + "℃）" +
          '<span class="tc-wdet">湿度 ' + c.relative_humidity_2m + "%　风 " + Math.round(c.wind_speed_10m) + " km/h" + extra + "</span>";
      })
      .catch(function () {
        if (done) return;
        done = true; clearTimeout(timer);
        wEl.textContent = "🌤 " + region + "天气未能获取（离线状态），可参考下方节气调理重点";
      });
  })();

  /* ---------- 2. 节气主卡 ---------- */
  (function () {
    const el = document.getElementById("jqMain");
    const t = JQ.JQ_TIP[cur.name] || {};
    const c = TCM.JQ_TCM[cur.name] || {};

    let html = '<div class="jm-head">' +
      '<span class="jm-name">' + cur.name + '</span>' +
      '<span class="jm-season">' + cur.season + '季</span>' +
      '<span class="jm-count">距 ' + nxt.name + ' 还有 ' + daysToNext + ' 天</span>' +
      '</div>' +
      '<div class="jm-date">' + fmt(cur.start) + ' — ' + fmt(cur.end) + '　｜　六气：' + (c.qi || "-") + '</div>';

    // 调理重点
    if (cur.tiaoli) {
      html += '<div class="jm-block key"><div class="jb-title">🎯 这个节气要调什么</div>' +
        '<p>' + cur.tiaoli + '</p></div>';
    }

    // 当令经络 + 穴位
    if (c.meridians) {
      html += '<div class="jm-block meridian"><div class="jb-title">🌀 当令经络</div>' +
        '<p class="jm-mer">' + c.meridians.map(function (m) { return '<span class="mer-tag">' + m + '</span>'; }).join("") + '</p>' +
        (c.acupoints ? '<p class="jm-acu">重点穴位：' + c.acupoints.map(function (a) {
          return '<span class="acu-tag">' + a + '</span>';
        }).join("") + '</p>' : '') +
        (c.meridianTip ? '<p class="jm-mtip">' + c.meridianTip + '</p>' : '') +
        '</div>';
    }

    // 补什么
    if (c.supplement) {
      html += '<div class="jm-block food"><div class="jb-title">🍲 要补些什么</div><p>' + c.supplement + '</p>' +
        (t.diet ? '<p class="jm-sub">' + t.diet + '</p>' : '') + '</div>';
    }

    // 运动
    if (c.exercise) {
      html += '<div class="jm-block sport"><div class="jb-title">🏃 做什么运动</div><p>' + c.exercise + '</p>' +
        (t.life ? '<p class="jm-sub">' + t.life + '</p>' : '') + '</div>';
    }

    // 健康提醒
    if (t.warn || c.common) {
      html += '<div class="jm-block warn"><div class="jb-title">⚠️ 特别注意</div>' +
        (c.common ? '<p>' + c.common + '</p>' : '') +
        (t.warn ? '<p class="jm-sub">' + t.warn + '</p>' : '') + '</div>';
    }

    // 下个节气预告
    html += '<div class="jm-next">下个节气 <b>' + nxt.name + '</b>（' + fmt(nxt.start) + ' 起）' +
      (nxt.tiaoli ? '：' + nxt.tiaoli : '') + '</div>';

    el.innerHTML = html;
  })();

  /* ---------- 3. 家人体质提示（每人显示当月重点，详情折叠） ---------- */
  (function () {
    const el = document.getElementById("familyTip");
    const members = loadMembers();

    if (!members.length) {
      el.innerHTML = '<div class="ft-empty">还没有录入家人信息。' +
        '<a href="family.html">去添加家人 →</a>（添加后这里会按家人体质给出专属提示）</div>';
      return;
    }

    const tzAll = window.ENGINE.mergeTizhi(members);
    const disAll = window.ENGINE.mergeDisease(members);

    // 当月（当前节气所属月份）重点：节气调理方向 + 季节要点
    const monthKey = cur.name + "·" + cur.season + "季";
    const t = JQ.JQ_TIP[cur.name] || {};

    let html = '<div class="section-title" style="margin-top:22px">家人今天要注意什么</div>';

    // 全家共同重点（当月/本节气）
    html += '<div class="ft-month">' +
      '<div class="ftm-head"><span class="ftm-tag">' + monthKey + '全家重点</span></div>' +
      '<div class="ftm-body">' +
        (cur.tiaoli ? '<p>' + cur.tiaoli + '</p>' : '') +
        (t.warn ? '<p class="ftm-warn">' + t.warn + '</p>' : '') +
      '</div>' +
    '</div>';

    html += '<div class="ft-card">';

    // 合并体质
    html += '<div class="ft-row"><span class="ft-k">全家体质</span><span class="ft-v">' +
      (tzAll.length ? tzAll.map(function (t2) { return '<span class="tag tz">' + t2 + '</span>'; }).join("") : "平和") +
      '</span></div>';

    if (disAll.length) {
      html += '<div class="ft-row"><span class="ft-k">体检异常</span><span class="ft-v">' +
        disAll.map(function (d) {
          return '<span class="tag warn">' + (R.DISEASE[d] ? R.DISEASE[d].label : d) + '</span>';
        }).join("") + '</span></div>';
    }

    // 逐个成员：先给当月重点（一行），详细折叠
    html += '<div class="ft-members">';
    members.forEach(function (m, mi) {
      const tzList = (m.tizhi && m.tizhi.length) ? m.tizhi : ["平和"];
      const disList = m.disease || [];

      // 计算当月重点：取该成员第一个体质的节气对应要点 + 慢病
      const mainTz = tzList[0];
      const care = TCM.TZ_CARE[mainTz] || {};
      const monthFocus = monthFocusFor(mainTz, cur, care);
      const disFocus = disList.map(function (d) {
        return R.DISEASE[d] ? R.DISEASE[d].label : d;
      });

      html += '<div class="ft-mem">' +
        '<div class="fm-head">' +
          '<span class="fm-name">' + (m.name || "未命名") + '</span>' +
          '<span class="fm-tags">' +
            tzList.map(function (x) { return '<span class="tag tz">' + x + '</span>'; }).join("") +
            disFocus.map(function (x) { return '<span class="tag warn">' + x + '</span>'; }).join("") +
          '</span>' +
        '</div>' +
        '<div class="fm-focus">' + monthFocus + '</div>';

      // 折叠详情
      const bodyId = "fmBody" + mi;
      html += '<button type="button" class="fold-btn small" data-fold="' + bodyId + '" aria-expanded="false">' +
        '<span>查看详细调理</span><span class="fold-arrow">▾</span></button>';
      html += '<div class="fold-body" id="' + bodyId + '" hidden>';

      tzList.forEach(function (tz) {
        const c = TCM.TZ_CARE[tz];
        if (!c) return;
        html += '<div class="fm-tz">' +
          '<div class="fm-tz-name">' + tz + '</div>' +
          '<div class="fm-line"><b>宜吃</b>' + c.eat + '</div>' +
          '<div class="fm-line avoid"><b>少吃</b>' + c.avoid + '</div>' +
          '<div class="fm-line mer"><b>通经络</b>' + c.meridian + '</div>' +
          '<div class="fm-line"><b>建议</b>' + c.advice + '</div>' +
        '</div>';
      });

      disList.forEach(function (d) {
        const info = R.DISEASE[d];
        if (info) html += '<div class="fm-dis"><b>' + info.label + '</b>：' + info.tip + '</div>';
      });

      html += '</div></div>';
    });
    html += '</div>';

    // 本节气共同建议（茶饮与穴位）
    const tzAdvice = tzAll.map(function (tz) {
      const c = TCM.TZ_CARE[tz];
      return c ? { tz: tz, tea: c.tea, acu: c.acupoint } : null;
    }).filter(Boolean);

    if (tzAdvice.length) {
      html += '<div class="ft-tea"><div class="jb-title">🍵 适合全家的茶饮与穴位</div>';
      tzAdvice.forEach(function (a) {
        html += '<div class="ft-tea-row"><b>' + a.tz + '</b>：' + a.tea +
          (a.acu ? '　｜　穴位：' + a.acu.join("、") : '') + '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;

    // 绑定所有折叠按钮
    el.querySelectorAll("[data-fold]").forEach(function (btn) {
      const body = document.getElementById(btn.dataset.fold);
      btn.onclick = function () {
        const open = body.hasAttribute("hidden");
        if (open) body.removeAttribute("hidden");
        else body.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.querySelector("span").textContent = open ? "收起详细调理" : "查看详细调理";
        btn.querySelector(".fold-arrow").textContent = open ? "▴" : "▾";
      };
    });

    /* 按体质 + 当前节气生成「当月重点」一句话 */
    function monthFocusFor(tz, jq, care) {
      const gist = {
        "平和": "保持规律作息与均衡饮食",
        "湿热": "清热利湿，少油少甜，忌烧烤冰啤",
        "寒湿": "温中散寒，食物务必温热，忌生冷",
        "痰湿": "健脾化痰，少油少糖，饭后走一走",
        "肝郁": "疏肝理气，少熬夜，多走动",
        "肾阴虚": "滋阴润燥，忌辛辣温燥，务必早睡",
        "肾阳虚": "温补肾阳，护住腰腹脚，忌生冷",
        "胃寒": "温胃散寒，食物温热软烂，忌凉拌",
        "结节体质": "疏肝化痰散结，定期复查，忌烧烤发物",
      };
      const base = gist[tz] || "按体质调理";
      // 节气侧重
      const seasonTip = {
        "春": "春季重在疏肝升发，可多走动、早睡早起。",
        "夏": "夏季重在养心清热，冰饮是头号大忌。",
        "秋": "秋季重在润燥护肺，多喝水、早添衣。",
        "冬": "冬季重在温阳藏精，注意保暖、早睡晚起。",
      }[jq.season] || "";
      return '<b>' + jq.name + '重点</b>：' + base + (seasonTip ? '　' + seasonTip : '');
    }
  })();

  /* ---------- 4. 十二时辰（折叠：默认只露当前时辰，点开看全部） ---------- */
  (function () {
    const el = document.getElementById("shichenBox");
    const h = now.getHours();
    const idx = Math.floor(((h + 1) % 24) / 2);
    const curSc = TCM.SHICHEN[idx] || TCM.SHICHEN[0];

    // 当前时辰卡片（始终显示）
    let html = '<div class="sc-now-card">' +
      '<div class="scn-label">此刻当令</div>' +
      '<div class="scn-main">' +
        '<span class="scn-name">' + curSc.name + '</span>' +
        '<span class="scn-h">' + curSc.h + '</span>' +
      '</div>' +
      '<div class="scn-mer">' + curSc.meridian + '</div>' +
      '<div class="scn-tip">' + curSc.tip + '</div>' +
    '</div>';

    // 折叠区：默认隐藏
    html += '<button type="button" class="fold-btn" id="scToggle" aria-expanded="false">' +
      '<span>展开十二时辰全部</span><span class="fold-arrow">▾</span>' +
    '</button>';

    html += '<div class="fold-body" id="scBody" hidden>' +
      TCM.SHICHEN.map(function (s, i) {
        const on = (i === idx) ? " now" : "";
        return '<div class="sc-row' + on + '">' +
          '<div class="sc-left"><span class="sc-name">' + s.name + '</span>' +
          '<span class="sc-h">' + s.h + '</span></div>' +
          '<div class="sc-right"><div class="sc-mer">' + s.meridian + '</div>' +
          '<div class="sc-tip">' + s.tip + '</div></div>' +
        '</div>';
      }).join("") +
    '</div>';

    el.innerHTML = html;

    const btn = document.getElementById("scToggle");
    const body = document.getElementById("scBody");
    btn.onclick = function () {
      const open = body.hasAttribute("hidden");
      if (open) body.removeAttribute("hidden");
      else body.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.querySelector("span").textContent = open ? "收起十二时辰" : "展开十二时辰全部";
      btn.querySelector(".fold-arrow").textContent = open ? "▴" : "▾";
    };
  })();

  /* ---------- 5. 五运六气（默认只显示当前主气，其余折叠） ---------- */
  (function () {
    const el = document.getElementById("wuyunBox");
    const W = TCM.WUYUN;
    const curQi = (TCM.JQ_TCM[cur.name] || {}).qi || "";

    let html = '<div class="wy-intro">' + W.intro + '</div>';

    // 当前主气卡（始终显示）
    const curQ = W.liuqi.find(function (q) { return curQi.indexOf(q.name) >= 0; });
    const curQiName = curQ ? curQ.name : "";
    if (curQ) {
      html += '<div class="wy-now-card">' +
        '<div class="wyn-label">当前主气</div>' +
        '<div class="wyn-name">' + curQ.name + '<span class="wyn-jq">' + curQ.jq + '</span></div>' +
        '<div class="wyn-tip">' + curQ.tip + '</div>' +
      '</div>';
    } else {
      html += '<div class="wy-now-card"><div class="wyn-label">当前主气</div>' +
        '<div class="wyn-tip">按节气推算，当前处于六气交替期。</div></div>';
    }

    // 折叠：其余五气
    const others = W.liuqi.filter(function (q) { return q.name !== curQiName; });
    html += '<button type="button" class="fold-btn" id="wyToggle" aria-expanded="false">' +
      '<span>展开其余五气（' + others.length + '）</span><span class="fold-arrow">▾</span>' +
    '</button>';

    html += '<div class="fold-body" id="wyBody" hidden><div class="wy-list">' +
      others.map(function (q) {
        return '<div class="wy-item">' +
          '<div class="wy-name">' + q.name + '</div>' +
          '<div class="wy-jq">' + q.jq + '</div>' +
          '<div class="wy-tip">' + q.tip + '</div>' +
        '</div>';
      }).join("") +
    '</div></div>';

    html += '<p class="hint">' + W.note + '</p>';

    el.innerHTML = html;

    const btn = document.getElementById("wyToggle");
    const body = document.getElementById("wyBody");
    btn.onclick = function () {
      const open = body.hasAttribute("hidden");
      if (open) body.removeAttribute("hidden");
      else body.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.querySelector("span").textContent = open ? "收起其余五气" : "展开其余五气（" + others.length + "）";
      btn.querySelector(".fold-arrow").textContent = open ? "▴" : "▾";
    };
  })();

  /* ---------- 工具 ---------- */
  function fmt(d) {
    if (typeof d === "string") return d;
    return (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }
})();
