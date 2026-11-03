/* ======================================================
   page-menu.js —— 第二页：周食谱
   支持：全家版 / 单人版 · 地区选择 · 多次生成换一套
         单菜替换 · 采购清单导出 · 节气要点
   ====================================================== */

(function () {
  const R = window.RULE;
  const JQ = window.JQ;
  let week = null;       // 当前周数据
  let members = [];
  let persons = 3;
  let mode = "family";
  let startDate = null;
  let seedRound = 0;     // 「换一套」的计数，参与随机种子
  let whoLabel = "";     // 单人版的成员称呼（全家版为空）

  const el = function (id) { return document.getElementById(id); };

  /* ---------- 初始化：区域下拉 ---------- */
  (function () {
    const prof = loadProfile();
    el("regionSel").innerHTML = R.REGIONS.map(function (r) {
      return '<option value="' + r.key + '"' + (r.key === prof.region ? " selected" : "") + '>' + r.label + '</option>';
    }).join("");

    // 默认起始日期 = 本周一
    const d = new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - (day - 1));
    el("startDate").value = iso(d);

    // 口味偏好
    const PREF_TAGS = ["清淡", "少油", "少盐", "不吃辣", "爱吃鱼", "爱吃鸡", "不吃牛羊", "不吃内脏", "不吃香菜"];
    const prefs = loadPrefs();
    el("prefBox").innerHTML = PREF_TAGS.map(function (p) {
      const on = prefs.likes.indexOf(p) >= 0 ? " on" : "";
      return '<label class="chip' + on + '"><input type="checkbox" value="' + p + '"' +
        (on ? " checked" : "") + '><span>' + p + '</span></label>';
    }).join("");
    el("prefBox").querySelectorAll(".chip").forEach(function (c) {
      c.addEventListener("change", function () {
        c.classList.toggle("on", c.querySelector("input").checked);
      });
    });

    refreshMembers();
  })();

  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* ---------- 成员下拉刷新 ---------- */
  function refreshMembers() {
    members = loadMembers();
    const warn = el("memberWarn");

    if (!members.length) {
      warn.innerHTML = '⚠️ 还没有录入家人信息，' +
        '<a href="family.html" style="color:#b34a4a;text-decoration:underline">去第三页添加 →</a>' +
        '（也可先在下方用「平和体质」生成通用食谱）';
    } else {
      warn.textContent = "已录入 " + members.length + " 位家人：" +
        members.map(function (m) { return m.name; }).join("、");
    }

    // 单人版下拉
    el("singlePick").innerHTML = members.length
      ? members.map(function (m) { return '<option value="' + m.id + '">' + m.name + '</option>'; }).join("")
      : '<option value="">（无成员）</option>';
  }

  /* ---------- 版本切换 ---------- */
  el("modeSel").onchange = function () {
    mode = el("modeSel").value;
    el("singlePickWrap").style.display = (mode === "single") ? "" : "none";
  };

  /* ---------- 生成 ---------- */
  el("genBtn").onclick = function () {
    doGenerate(true);
  };

  el("resetBtn").onclick = function () {
    seedRound = 0;
    el("personNum").value = 3;
    el("modeSel").value = "family";
    el("singlePickWrap").style.display = "none";
    mode = "family";
    el("prefBox").querySelectorAll(".chip").forEach(function (c) {
      c.classList.remove("on");
      c.querySelector("input").checked = false;
    });
    savePrefs({ likes: [], dislikes: [] });
  };

  function doGenerate(isNew) {
    persons = Number(el("personNum").value) || 3;
    startDate = new Date(el("startDate").value + "T00:00:00");

    if (isNaN(startDate.getTime())) {
      alert("请选择起始日期");
      return;
    }

    refreshMembers();

    let useMembers = members;
    whoLabel = "";
    if (mode === "single") {
      const sid = el("singlePick").value;
      const one = members.find(function (m) { return m.id === sid; });
      if (!one) { alert("单人版请先选择成员"); return; }
      useMembers = [one];
      whoLabel = one.name || "该成员";
      persons = 1;
      el("personNum").value = 1;
    }

    if (!useMembers.length) {
      // 无成员时用平和体质兜底
      useMembers = [{ id: "tmp", name: "通用", tizhi: ["平和"], disease: [] }];
    }

    // 收集偏好
    const likes = [];
    el("prefBox").querySelectorAll(".chip.on input").forEach(function (cb) { likes.push(cb.value); });
    savePrefs({ likes: likes, dislikes: [] });

    // 记住地区
    const prof = loadProfile();
    const rk = el("regionSel").value;
    const rd = R.REGIONS.find(function (r) { return r.key === rk; }) || R.REGIONS[0];
    prof.region = rd.key; prof.lat = rd.lat; prof.lon = rd.lon;
    saveProfile(prof);

    if (isNew) seedRound++;

    const seed = "menu|" + (prof.region || "漳州") + "|" + seedRound + "|" + likes.join(",");

    week = window.ENGINE.buildWeek(useMembers, startDate, { seed: seed, region: prof.region, prefs: { likes: likes } });

    render();
    el("resultBox").scrollIntoView({ behavior: "smooth", block: "start" });
    saveCurrentHistory();
  }

  /* ---------- 渲染 ---------- */
  function render() {
    const box = el("resultBox");
    const tzAll = week.tizhiAll;
    const disAll = week.diseases;
    const jqNow = week.days[0].jq;

    let html = "";

    // 头部信息卡
    html += '<div class="head-card">' +
      '<div class="hc-row"><span class="k">周期</span><span class="v">' + fmt(startDate) + ' 起 7 天</span></div>' +
      '<div class="hc-row"><span class="k">节气</span><span class="v">' + jqNow.name + '（' + jqNow.season + '季）</span></div>' +
      '<div class="hc-row"><span class="k">版本</span><span class="v">' +
        (mode === "single" ? "单人版（" + whoLabel + "）" : "全家版（" + persons + " 人）") + '</span></div>' +
      '<div class="hc-row"><span class="k">体质</span><span class="v">' +
        (tzAll.length ? tzAll.join(" + ") : "平和") + '</span></div>' +
      (disAll.length ? '<div class="hc-row"><span class="k">异常</span><span class="v">' +
        disAll.map(function (d) { return R.DISEASE[d] ? R.DISEASE[d].label : d; }).join("、") + '</span></div>' : '') +
      '<div class="hc-row"><span class="k">地区</span><span class="v">' +
        (week.region || "漳州") + ' · 当季食材优先</span></div>' +
      '<div class="hc-note">选菜规则：慢病禁忌整桌不上；一道菜同时不利于两位以上家人体质的不选；单人不宜只降权不禁用。生腌刺身家里有胃寒/寒湿/胃病者一律不做。<b>点菜品名可展开做法，点「换」可单独换掉这道菜。</b></div>' +
    '</div>';

    // Tabs
    html += '<div class="tabs">' +
      '<button type="button" class="tab active" data-tab="week">本周食谱</button>' +
      '<button type="button" class="tab" data-tab="month">月度总览</button>' +
      '<button type="button" class="tab" data-tab="shop">采购清单</button>' +
      '<button type="button" class="tab" data-tab="jq">节气要点</button>' +
    '</div>' +
    '<div id="tab-week" class="tab-pane active"></div>' +
    '<div id="tab-month" class="tab-pane"></div>' +
    '<div id="tab-shop" class="tab-pane"></div>' +
    '<div id="tab-jq" class="tab-pane"></div>';

    box.innerHTML = html;

    renderWeek();
    renderMonth();
    renderShop();
    renderJq();
    bindTabs();
  }

  /* ---------- 本周食谱 ---------- */
  function renderWeek() {
    const elw = el("tab-week");
    elw.innerHTML = week.days.map(function (day, i) {
      const dstr = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][i];
      return '<div class="day-card">' +
        '<div class="day-head">' +
          '<span class="day-name">' + dstr + '</span>' +
          '<span class="day-date">' + fmt(day.date) + '</span>' +
          '<span class="day-jq">' + day.jq.name + '</span>' +
        '</div>' +
        '<div class="meal-block"><div class="meal-title">🌅 早餐</div>' +
          day.menu.breakfast.map(function (d) { return dishHtml(d, i, "breakfast"); }).join("") + '</div>' +
        '<div class="meal-block"><div class="meal-title">☀️ 午餐</div>' +
          day.menu.lunch.map(function (d) { return dishHtml(d, i, "lunch"); }).join("") + '</div>' +
        '<div class="meal-block"><div class="meal-title">🌙 晚餐</div>' +
          day.menu.dinner.map(function (d) { return dishHtml(d, i, "dinner"); }).join("") + '</div>' +
      '</div>';
    }).join("");

    elw.addEventListener("click", onDishClick);
  }

  function dishHtml(dish, dayIdx, meal) {
    const roleTxt = { staple: "主食", protein: "主菜", veg: "素菜", soup: "汤" };
    const scale = persons / (dish.servings || 3);
    const ingTxt = (dish.ing || []).map(function (i) {
      return i.n + " " + (Math.round(Number(i.a) * scale * 10) / 10) + i.u;
    }).join("、");
    const vid = encodeURIComponent(dish.name + " 做法");

    return '<div class="dish" data-did="' + dish.id + '" data-day="' + dayIdx + '" data-meal="' + meal + '">' +
      '<div class="dish-head">' +
        '<span class="dish-role">' + (roleTxt[dish.role] || "") + '</span>' +
        '<span class="dish-name">' + dish.name + '</span>' +
        '<button type="button" class="dish-swap" data-swap="' + dish.id + '">换</button>' +
        '<span class="dish-arrow">▾</span>' +
      '</div>' +
      '<div class="dish-body">' +
        '<div class="db-sec"><b>用料（' + persons + '人份）</b><p>' + ingTxt + '</p></div>' +
        '<div class="db-sec"><b>做法</b><ol>' +
          (dish.steps || []).map(function (s) { return "<li>" + s + "</li>"; }).join("") + '</ol></div>' +
        '<div class="db-sec why"><b>为什么这样吃</b><p>' + (dish.why || "") + '</p></div>' +
        '<div class="db-sec"><b>参考视频</b><p>' +
          '<a class="vid" target="_blank" rel="noopener" href="https://search.bilibili.com/all?keyword=' + vid + '">B站：' + dish.name + '</a>' +
          '<a class="vid" target="_blank" rel="noopener" href="https://www.baidu.com/s?wd=' + vid + '">百度：' + dish.name + '</a>' +
        '</p></div>' +
        '<p class="db-time">约 ' + (dish.time || "-") + ' 分钟</p>' +
      '</div>' +
    '</div>';
  }

  function onDishClick(e) {
    // 单菜替换
    const swapBtn = e.target.closest("[data-swap]");
    if (swapBtn) {
      e.stopPropagation();
      const dishEl = swapBtn.closest(".dish");
      const dayIdx = Number(dishEl.dataset.day);
      const meal = dishEl.dataset.meal;
      swapDish(dayIdx, meal, dishEl.dataset.did);
      return;
    }
    // 展开
    const head = e.target.closest(".dish-head");
    if (head) head.parentElement.classList.toggle("open");
  }

  /* ---------- 单菜替换 ---------- */
  function swapDish(dayIdx, meal, oldId) {
    const day = week.days[dayIdx];
    const list = day.menu[meal];
    const idx = list.findIndex(function (d) { return d.id === oldId; });
    if (idx < 0) return;
    const old = list[idx];

    // 候选：同餐次同角色、当前周未被使用的、已通过过滤
    const usedIds = {};
    week.days.forEach(function (dd) {
      dd.menu.all.forEach(function (d) { usedIds[d.id] = 1; });
    });

    const ctx = {
      season: day.season,
      tizhiAll: week.tizhiAll,
      diseases: week.diseases,
      region: week.region || "漳州",
      prefs: loadPrefs(),
    };

    let cands = window.DISHES.filter(function (d) {
      if (d.id === oldId) return false;
      if (usedIds[d.id]) return false;
      if (d.role !== old.role) return false;
      if ((d.meal || []).indexOf(meal) < 0) return false;
      return window.ENGINE.dishAllowed(d, ctx);
    });

    // 若没有新菜，放宽为「当前餐次同角色任意菜（排除自身）」
    if (!cands.length) {
      cands = window.DISHES.filter(function (d) {
        return d.id !== oldId && d.role === old.role && (d.meal || []).indexOf(meal) >= 0;
      });
    }

    if (!cands.length) { alert("没有可替换的同类型菜品"); return; }

    // 评分排序取前几名随机
    const scored = cands.map(function (d) {
      return { d: d, s: window.ENGINE.dishScore(d, ctx) };
    }).sort(function (a, b) { return b.s - a.s; });

    const pick = scored[Math.floor(Math.random() * Math.min(4, scored.length))].d;

    // 替换
    list[idx] = pick;
    day.menu.all = day.menu.breakfast.concat(day.menu.lunch, day.menu.dinner);

    // 重渲染
    const scrollY = window.scrollY;
    render();
    window.scrollTo(0, scrollY);
  }

  /* ---------- 月度总览 ---------- */
  function renderMonth() {
    const elm = el("tab-month");
    const weeks = [];
    const prof = loadProfile();
    const likes = (loadPrefs().likes || []);
    const seedBase = "menu|" + (prof.region || "漳州") + "|" + seedRound + "|" + likes.join(",");

    for (let w = 0; w < 4; w++) {
      const ws = new Date(startDate.getTime() + w * 7 * 86400000);
      let useM = members;
      if (mode === "single") {
        const one = members.find(function (m) { return m.id === el("singlePick").value; });
        useM = one ? [one] : [];
      }
      if (!useM.length) {
        useM = [{ id: "tmp", name: "通用", tizhi: ["平和"], disease: [] }];
      }
      weeks.push(window.ENGINE.buildWeek(
        useM, ws, { seed: seedBase + "|m" + w, region: prof.region, prefs: { likes: likes } }
      ));
    }

    let html = '<p class="hint">按 4 周展示，每周按真实节气取菜。第一周与上方「本周食谱」一致。</p>';
    html += weeks.map(function (wk, wi) {
      const rows = wk.days.map(function (day, di) {
        return '<tr>' +
          '<td class="td-d">' + ["一", "二", "三", "四", "五", "六", "日"][di] + '</td>' +
          '<td class="td-jq">' + day.jq.name + '</td>' +
          '<td>' + names(day.menu.breakfast) + '</td>' +
          '<td>' + names(day.menu.lunch) + '</td>' +
          '<td>' + names(day.menu.dinner) + '</td>' +
        '</tr>';
      }).join("");

      return '<div class="month-week">' +
        '<div class="mw-head">第 ' + (wi + 1) + ' 周（' + fmt(wk.startDate) + ' 起）</div>' +
        '<div class="table-wrap"><table class="menu-table">' +
          '<thead><tr><th>日</th><th>节气</th><th>早餐</th><th>午餐</th><th>晚餐</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table></div>' +
      '</div>';
    }).join("");
    elm.innerHTML = html;
  }

  function names(list) {
    return list.filter(function (d) { return d.role !== "tea"; })
      .map(function (d) { return d.name; }).join("、");
  }

  /* ---------- 采购清单 ---------- */
  let shopping = [];
  function renderShop() {
    const els = el("tab-shop");
    shopping = window.ENGINE.aggregateShopping(week.days, persons);

    const byCat = {};
    shopping.forEach(function (s) {
      if (!byCat[s.c]) byCat[s.c] = [];
      byCat[s.c].push(s);
    });

    let html = '<p class="hint">按本周 7 天食谱自动汇总，用量已按 ' + persons + ' 人份换算。可导出 Excel 带去超市。</p>';
    Object.keys(byCat).forEach(function (cat) {
      html += '<div class="shop-cat"><div class="sc-title">' + cat + '</div><div class="sc-items">';
      byCat[cat].forEach(function (s) {
        html += '<span class="sc-item">' + s.n + ' <b>' + s.a + s.u + '</b></span>';
      });
      html += '</div></div>';
    });

    html += '<button type="button" id="exportBtn" class="primary" style="margin-top:16px">导出采购表 Excel</button>';
    els.innerHTML = html;
    el("exportBtn").onclick = exportExcel;
  }

  function exportExcel() {
    const rows = ['<tr><th>分类</th><th>食材</th><th>用量</th><th>单位</th><th>用于菜品</th></tr>'];
    shopping.forEach(function (s) {
      rows.push('<tr><td>' + s.c + '</td><td>' + s.n + '</td><td>' + s.a +
        '</td><td>' + s.u + '</td><td>' + s.dishes.join("、") + '</td></tr>');
    });

    const title = "家庭周食谱采购清单（" + iso(startDate) + " 起7天）";
    const html =
      '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8">' +
      '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
      '<x:Name>采购清单</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>' +
      '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
      '<style>td,th{border:1px solid #999;padding:4px 8px;font-size:12pt;mso-number-format:"\\@";}' +
      'th{background:#f2e3c8;font-weight:bold;}</style></head><body>' +
      '<table><tr><td colspan="5" style="font-size:15pt;font-weight:bold;text-align:center">' +
      title + '</td></tr>' + rows.join("") + '</table></body></html>';

    const blob = new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "采购清单_" + iso(startDate) + ".xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  /* ---------- 节气要点 ---------- */
  function renderJq() {
    const elj = el("tab-jq");
    const seen = {}, list = [];
    week.days.forEach(function (d) {
      if (!seen[d.jq.name]) { seen[d.jq.name] = 1; list.push(d.jq); }
    });

    let html = list.map(function (j) {
      const t = JQ.JQ_TIP[j.name] || {};
      const c = window.TCM.JQ_TCM[j.name] || {};
      return '<div class="jq-card">' +
        '<div class="jc-head">' + j.name + ' <span class="jc-season">' + j.season + '季</span>' +
        '<span class="jc-date">' + fmt(j.start) + ' — ' + fmt(j.end) + '</span></div>' +
        (c.meridians ? '<div class="jc-sec"><b>当令经络</b><p>' + c.meridians.join("、") +
          (c.acupoints ? '　穴位：' + c.acupoints.join("、") : "") + '</p></div>' : '') +
        (t.diet ? '<div class="jc-sec"><b>饮食</b><p>' + t.diet + '</p></div>' : '') +
        (t.life ? '<div class="jc-sec"><b>起居</b><p>' + t.life + '</p></div>' : '') +
        (c.exercise ? '<div class="jc-sec"><b>运动</b><p>' + c.exercise + '</p></div>' : '') +
        (t.warn ? '<div class="jc-sec warn"><b>健康提醒</b><p>' + t.warn + '</p></div>' : '') +
      '</div>';
    }).join("");

    // 当季食材
    const prof = loadProfile();
    const season = week.days[0].season;
    const localFoods = R.localSeason(prof.region || "漳州", season);
    html += '<div class="jq-card"><div class="jc-head">' + (prof.region || "漳州") + '当季食材</div>' +
      '<p class="jc-food">' + localFoods.join("、") + '</p>' +
      '<p class="hint">' + R.LOCAL.note + '</p></div>';

    elj.innerHTML = html;
  }

  /* ---------- Tab 切换 ---------- */
  function bindTabs() {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.onclick = function () {
        document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
        document.querySelectorAll(".tab-pane").forEach(function (p) { p.classList.remove("active"); });
        tab.classList.add("active");
        el("tab-" + tab.dataset.tab).classList.add("active");
      };
    });
  }

  /* ---------- 存历史（可选，供日后回顾） ---------- */
  function saveCurrentHistory() {
    try {
      const key = "mnd_menu_hist_v1";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.unshift({
        t: Date.now(),
        start: iso(startDate),
        mode: mode,
        region: loadProfile().region,
        persons: persons,
        members: members.map(function (m) { return { name: m.name, tizhi: m.tizhi }; }),
        days: week.days.map(function (d) {
          return {
            date: fmt(d.date), jq: d.jq.name,
            b: names(d.menu.breakfast), l: names(d.menu.lunch), dn: names(d.menu.dinner),
          };
        }),
      });
      while (list.length > 20) list.pop();
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  }

  function fmt(d) {
    if (typeof d === "string") return d;
    return (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }
})();