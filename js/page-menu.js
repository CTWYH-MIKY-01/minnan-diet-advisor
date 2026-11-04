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
  let weekRules = [];    // 本周要求：[{id, kw, meal, max}]

  // 常用快捷项：一键添加（避免手动输入）
  const WR_QUICK = [
    { kw: "豆浆", meal: "breakfast", max: 1 },
    { kw: "粥",   meal: "breakfast", max: 1 },
    { kw: "牛奶", meal: "breakfast", max: 1 },
    { kw: "面条", meal: "all",       max: 2 },
    { kw: "米饭", meal: "all",       max: 7 },
    { kw: "红茶", meal: "all",       max: 3 },
  ];

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

    // 本周要求：恢复已存规则 + 渲染快捷项
    // 首次使用（从未保存过）时给两条默认规则：豆浆、稀粥早餐各限 1 次/周，
    // 用户可自行修改或删除（删光后不再自动补回）
    if (localStorage.getItem("mnd_weekreq_v1") === null) {
      saveWeekRules([
        { id: "wr_default_1", kw: "豆浆", meal: "breakfast", max: 1 },
        { id: "wr_default_2", kw: "粥",   meal: "breakfast", max: 1 },
      ]);
    }
    weekRules = loadWeekRules();
    renderWeekRules();
    renderWrQuick();
    el("wrAddBtn").onclick = addWeekRule;
    el("wrKw").addEventListener("keydown", function (e) {
      if (e.key === "Enter") addWeekRule();
    });

    refreshMembers();
  })();

  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* ---------- 本周要求 ---------- */
  function ruleSame(a, b) {
    return a.kw === b.kw && (a.meal || "all") === (b.meal || "all");
  }

  function addWeekRule(fromQuick, quickObj) {
    // 事件绑定直接作为 onclick 时，第一参是 event 对象——必须区分：
    // 快捷项调用规范是 addWeekRule(关键词字符串, 规则对象)
    const isQuick = (typeof fromQuick === "string" && quickObj && quickObj.meal !== undefined);
    let kw, meal, max;
    if (isQuick) {
      kw = fromQuick; meal = quickObj.meal; max = quickObj.max;
    } else {
      kw = (el("wrKw").value || "").trim();
      meal = el("wrMeal").value;
      max = Number(el("wrMax").value) || 0;
    }
    if (!kw) { alert("请先填写食物关键词（如 豆浆、粥）"); return; }

    const one = { id: "wr_" + Date.now() + "_" + Math.floor(Math.random() * 1000), kw: kw, meal: meal, max: max };

    if (weekRules.some(function (r) { return ruleSame(r, one); })) {
      alert("已有一条「" + kw + "" + (meal === "all" ? "不限餐次" : ""+meal) + "」的规则了\n如需调整请先删旧条再添加");
      return;
    }
    weekRules.push(one);
    saveWeekRules(weekRules);
    if (!isQuick) el("wrKw").value = "";
    renderWeekRules();
    renderWrQuick();
  }

  function renderWeekRules() {
    const box = el("wrList");
    if (!weekRules.length) {
      box.innerHTML = "";
      return;
    }
    const mealTxt = { all: "不限餐次", breakfast: "仅早餐", lunch: "仅午餐", dinner: "仅晚餐" };
    box.innerHTML = weekRules.map(function (r) {
      return '<div class="wr-item" data-wid="' + r.id + '">' +
        '<span class="wr-kw">' + esc(r.kw) + '</span>' +
        '<span class="wr-desc">' + mealTxt[r.meal || "all"] + " · 每周" +
          (Number(r.max) === 0 ? "不出现" : "最多 " + r.max + " 次") + '</span>' +
        '<button type="button" class="wr-del" data-wdel="' + r.id + '">删除</button>' +
      '</div>';
    }).join("");
  }

  function renderWrQuick() {
    // 快捷项：已添加的置灰为「已设置」状态，点击可删除
    const mealTxt = { all: "不限", breakfast: "早", lunch: "午", dinner: "晚" };
    el("wrQuick").innerHTML = WR_QUICK.map(function (q) {
      const added = weekRules.some(function (r) { return ruleSame(r, q); });
      return '<label class="chip wr-q' + (added ? " on" : "") + '" data-qkw="' + esc(q.kw) + '">' +
        '<input type="checkbox"' + (added ? " checked" : "") + '><span>' +
        esc(q.kw) + " 限" + (Number(q.max) === 0 ? "不吃" : q.max) + "次/周（" + mealTxt[q.meal || "all"] + "）</span></label>";
    }).join("");

    el("wrQuick").querySelectorAll(".wr-q").forEach(function (c) {
      c.addEventListener("change", function () {
        const qk = c.dataset.qkw;
        const q = WR_QUICK.find(function (x) { return x.kw === qk; });
        if (!q) return;
        if (c.querySelector("input").checked) {
          addWeekRule(q.kw, q);
        } else {
          weekRules = weekRules.filter(function (r) { return !ruleSame(r, q); });
          saveWeekRules(weekRules);
          renderWeekRules();
        }
        renderWrQuick();
      });
    });
  }

  // 规则列表的删除按钮（事件委托）
  document.addEventListener("click", function (e) {
    const del = e.target.closest("[data-wdel]");
    if (!del) return;
    const wid = del.dataset.wdel;
    weekRules = weekRules.filter(function (r) { return r.id !== wid; });
    saveWeekRules(weekRules);
    renderWeekRules();
    renderWrQuick();
  });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
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
    weekRules = [];
    saveWeekRules(weekRules);
    renderWeekRules();
    renderWrQuick();
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

    const seed = "menu|" + (prof.region || "漳州") + "|" + seedRound + "|" + likes.join(",") +
      "|" + weekRules.map(function (r) { return r.kw + ":" + (r.meal || "all") + ":" + r.max; }).join(";");

    week = window.ENGINE.buildWeek(useMembers, startDate, {
      seed: seed, region: prof.region,
      prefs: { likes: likes }, weekRules: weekRules,
    });

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
    let reqTxt = "";
    if (week.weekRules && week.weekRules.length) {
      const mealTxt = { all: "不限", breakfast: "早", lunch: "午", dinner: "晚" };
      reqTxt = '<div class="hc-row"><span class="k">要求</span><span class="v">' +
        week.weekRules.map(function (r) {
          return esc(r.kw) + "限" + (Number(r.max) === 0 ? "不吃" : r.max + "次") +
            "（" + mealTxt[r.meal || "all"] + "）";
        }).join("；") + '</span></div>';
    }

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
      reqTxt +
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

  /* ---------- 单菜替换：候选面板 ----------
     展示同餐次同角色的全部可选菜（含自定义菜），
     按适配分排序取前 12 个（不少于 5 个），用户点头像/菜名挑；
     面板里也标出每道菜对本家庭的适配级别，帮助选择 */
  let swapPanel = null;   // {dayIdx, meal, oldId, list}

  function swapDish(dayIdx, meal, oldId) {
    const day = week.days[dayIdx];
    const list = day.menu[meal];
    const idx = list.findIndex(function (d) { return d.id === oldId; });
    if (idx < 0) return;
    const old = list[idx];

    // 候选：同餐次同角色、当前周未被使用的、已通过过滤（含自定义菜）
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
    const wr = week.weekRules || [];

    const allDishes = window.ENGINE.allDishes();
    let cands = allDishes.filter(function (d) {
      if (d.id === oldId) return false;
      if (usedIds[d.id] && !d.custom) return false;   // 自定义菜可少量复用
      if (d.role !== old.role) return false;
      if ((d.meal || []).indexOf(meal) < 0) return false;
      return window.ENGINE.dishAllowed(d, ctx);
    });

    // 本周未用过的排前面；自定义菜其次；已用过的最后兜底
    const fresh = cands.filter(function (d) { return !usedIds[d.id]; });
    const usedOnes = cands.filter(function (d) { return usedIds[d.id]; });

    // 替换也同样遵守本周要求：不算上被换掉的那道，不能让配额超标
    function applyWeekRules(arr) {
      if (!wr.length || !arr.length) return arr;
      const st = {};
      const oldHit = {};
      wr.forEach(function (r, ri) {
        const mealOk = !r.meal || r.meal === "all" || r.meal === meal;
        if (mealOk && window.ENGINE.weekMatchKeyword(old, r.kw)) oldHit[ri] = true;
      });
      wr.forEach(function (r, ri) {
        if (oldHit[ri]) return;
        week.days.forEach(function (dd) {
          dd.menu.all.forEach(function (d) {
            const mealOk = !r.meal || r.meal === "all" || r.meal === meal;
            if (mealOk && window.ENGINE.weekMatchKeyword(d, r.kw)) st[ri] = (st[ri] || 0) + 1;
          });
        });
      });
      const ok = arr.filter(function (d) {
        return !window.ENGINE.weekRuleBlocked(d, meal, wr, st);
      });
      return ok.length ? ok : arr;   // 全挡光时降级放行
    }

    const pool = applyWeekRules(fresh).concat(
      applyWeekRules(usedOnes).map(function (d) {
        const c = Object.assign({}, d); c._used = true; return c;
      })
    );

    // 兜底：全空时放宽为「同餐次同角色任意菜（排除自身）」
    let finalCands = pool;
    if (!finalCands.length) {
      finalCands = allDishes.filter(function (d) {
        return d.id !== oldId && d.role === old.role && (d.meal || []).indexOf(meal) >= 0;
      }).map(function (d) { const c = Object.assign({}, d); c._used = true; return c; });
    }

    if (!finalCands.length) { alert("没有可替换的同类型菜品"); return; }

    // 评分排序：取前 12 个进面板（用户要的"至少 5 套"远超此数则展示 12 个更多选择）
    const scored = finalCands.map(function (d) {
      return { d: d, s: window.ENGINE.dishScore(d, ctx) + (d.custom ? 2 : 0) - (d._used ? 40 : 0) };
    }).sort(function (a, b) { return b.s - a.s; });
    const panelList = scored.slice(0, 12).map(function (x) { return x.d; });

    // 记录面板状态并渲染
    swapPanel = { dayIdx: dayIdx, meal: meal, oldId: oldId, list: panelList, idx: idx };
    renderSwapPanel(old, meal, dayIdx);
  }

  /* 适配级别（复用食物库的分析逻辑思路，按体质慢病粗评） */
  function swapLevel(dish) {
    const tzAll = week.tizhiAll, disAll = week.diseases;
    let bad = 0;
    (dish.badTz || []).forEach(function (t) { if (tzAll.indexOf(t) >= 0) bad++; });
    const disHit = (dish.badDis || []).some(function (b) { return disAll.indexOf(b) >= 0; });
    let good = 0;
    (dish.tz || []).forEach(function (t) { if (tzAll.indexOf(t) >= 0) good++; });
    if (disHit) return { txt: "慢病注意", cls: "sl-bad" };
    if (bad >= 2) return { txt: "多人不宜", cls: "sl-bad" };
    if (bad === 1) return { txt: "个别体质少食", cls: "sl-caution" };
    if (good >= 2) return { txt: "全家适宜", cls: "sl-good" };
    return { txt: "可以", cls: "sl-ok" };
  }

  function renderSwapPanel(old, meal, dayIdx) {
    // 移除旧面板
    const prev = document.getElementById("swapPanelBox");
    if (prev) prev.remove();

    const mealTxt = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐" }[meal] || meal;
    const dstr = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][dayIdx];

    const items = swapPanel.list.map(function (d) {
      const lv = swapLevel(d);
      const ing = (d.ing || []).slice(0, 4).map(function (i) { return i.n; }).join("、");
      return '<button type="button" class="sw-item" data-pick="' + d.id + '">' +
        '<div class="sw-head">' +
          '<span class="sw-name">' + esc(d.name) + '</span>' +
          '<span class="sw-lv ' + lv.cls + '">' + lv.txt + '</span>' +
          (d.custom ? '<span class="sw-cust">自定</span>' : '') +
          (d._used ? '<span class="sw-used">本周已用过</span>' : '') +
        '</div>' +
        '<div class="sw-ing">' + (ing ? "主料：" + ing : "家常做法") + '</div>' +
        '<div class="sw-meta">约 ' + (d.time || 20) + ' 分钟' + (d.why ? ' · ' + d.why.slice(0, 26) + "…" : '') + '</div>' +
      '</button>';
    }).join("");

    const box = document.createElement("div");
    box.id = "swapPanelBox";
    box.innerHTML = '<div class="sw-mask" data-swp-close="1"></div>' +
      '<div class="sw-panel">' +
        '<div class="sw-title">换掉「' + esc(old.name) + '」<span class="sw-sub">' + dstr + " " + mealTxt + ' · 共 ' + swapPanel.list.length + ' 个可选</span></div>' +
        '<div class="sw-list">' + items + '</div>' +
        '<button type="button" class="sw-close" data-swp-close="1">不换了，关闭</button>' +
      '</div>';
    document.body.appendChild(box);

    box.addEventListener("click", function (e) {
      if (e.target.closest("[data-swp-close]")) {
        box.remove();
        swapPanel = null;
        return;
      }
      const pick = e.target.closest("[data-pick]");
      if (!pick) return;
      applySwap(pick.dataset.pick);
    });
  }

  function applySwap(newId) {
    if (!swapPanel) return;
    const day = week.days[swapPanel.dayIdx];
    const list = day.menu[swapPanel.meal];
    const pick = swapPanel.list.find(function (d) { return d.id === newId; });
    if (!pick) return;

    // 自定义菜换入后补 _score（渲染和采购都用到）
    if (pick._score === undefined) pick._score = 0;

    list[swapPanel.idx] = pick;
    day.menu.all = day.menu.breakfast.concat(day.menu.lunch, day.menu.dinner);

    const scrollY = window.scrollY;
    document.getElementById("swapPanelBox").remove();
    swapPanel = null;
    render();
    window.scrollTo(0, scrollY);
  }

  /* ---------- 月度总览 ---------- */
  function renderMonth() {
    const elm = el("tab-month");
    const weeks = [];
    const prof = loadProfile();
    const likes = (loadPrefs().likes || []);
    const seedBase = "menu|" + (prof.region || "漳州") + "|" + seedRound + "|" + likes.join(",") +
      "|" + weekRules.map(function (r) { return r.kw + ":" + (r.meal || "all") + ":" + r.max; }).join(";");

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
        useM, ws, {
          seed: seedBase + "|m" + w, region: prof.region,
          prefs: { likes: likes }, weekRules: weekRules,
        }
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