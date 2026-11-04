/* ======================================================
   page-family.js —— 第三页：家人与食物
   1. 家庭成员：逐个录入 / 编辑 / 删除（独立保存，互不覆盖）
   2. 食物库：按分类浏览、搜索、加入购物车
   3. 甄选分析：按家人体质与慢病判定「可取 / 慎吃 / 不宜」
   ====================================================== */

(function () {
  const R = window.RULE;
  const DB = window.FOODS_DB;
  const FOODS = DB.FOODS;

  const el = function (id) { return document.getElementById(id); };
  const esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  /* ======================================================
     一、Tab 切换（含「我的菜谱」）
     ====================================================== */
  function switchFtab(name) {
    document.querySelectorAll("#foodTabs .tab").forEach(function (t) {
      t.classList.toggle("active", t.dataset.ftab === name);
    });
    document.querySelectorAll("#ftab-lib, #ftab-cart, #ftab-analyze, #ftab-custom").forEach(function (p) {
      p.classList.remove("active");
    });
    const box = el("ftab-" + name);
    if (box) box.classList.add("active");
  }
  document.querySelectorAll("#foodTabs .tab").forEach(function (t) {
    t.onclick = function () {
      switchFtab(t.dataset.ftab);
      if (t.dataset.ftab === "analyze") renderAnalyze();
      if (t.dataset.ftab === "custom") renderCustomDishes();
    };
  });

  /* ======================================================
     二、家庭成员
     ====================================================== */
  let editingId = null;

  function renderMembers() {
    const list = loadMembers();
    const box = el("memberList");

    if (!list.length) {
      box.innerHTML = '<div class="empty">还没有家人信息<br>' +
        '<span class="small">点下方按钮添加，食谱就会按体质与体检情况定制</span></div>';
      return;
    }

    box.innerHTML = list.map(function (m) {
      const tz = (m.tizhi && m.tizhi.length) ? m.tizhi : [];
      const dis = m.disease || [];
      const bmi = R.bmiOf(m.height, m.weight);

      return '<div class="member-row">' +
        '<div class="mr-left">' +
          '<div class="mr-name">' + esc(m.name || "未命名") + '</div>' +
          '<div class="mr-tags">' +
            (tz.length
              ? tz.map(function (t) { return '<span class="tag tz">' + esc(t) + '</span>'; }).join("")
              : '<span class="tag">平和</span>') +
            dis.map(function (d) {
              return '<span class="tag warn">' + esc(R.DISEASE[d] ? R.DISEASE[d].label : d) + '</span>';
            }).join("") +
          '</div>' +
          (bmi ? '<div class="mr-note">BMI ' + bmi.toFixed(1) + '　' + esc(R.bmiAdvice(bmi)) + '</div>' : '') +
          (m.note ? '<div class="mr-note">忌口：' + esc(m.note) + '</div>' : '') +
        '</div>' +
        '<button type="button" class="mr-edit" data-edit="' + m.id + '">编辑</button>' +
      '</div>';
    }).join("");
  }

  el("memberList").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-edit]");
    if (btn) openModal(btn.dataset.edit);
  });

  /* ---------- 弹层：体质 / 慢病 chip ---------- */
  (function buildChips() {
    el("fTizhi").innerHTML = Object.keys(R.TIZHI).map(function (t) {
      return '<label class="chip"><input type="checkbox" value="' + t + '"><span>' + t + '</span></label>';
    }).join("");

    el("fDisease").innerHTML = Object.keys(R.DISEASE).map(function (k) {
      return '<label class="chip"><input type="checkbox" value="' + k + '"><span>' +
        R.DISEASE[k].label + '</span></label>';
    }).join("");
  })();

  ["fTizhi", "fDisease"].forEach(function (boxId) {
    el(boxId).addEventListener("change", function (e) {
      if (e.target.tagName !== "INPUT") return;
      e.target.closest(".chip").classList.toggle("on", e.target.checked);
    });
  });

  function openModal(id) {
    editingId = id || null;
    const m = id ? getMember(id) : null;

    el("modalTitle").textContent = m ? "编辑成员" : "添加成员";
    el("fName").value = m ? (m.name || "") : "";
    el("fHeight").value = m && m.height ? m.height : "";
    el("fWeight").value = m && m.weight ? m.weight : "";
    el("fNote").value = m ? (m.note || "") : "";

    const tzSel = m ? (m.tizhi || []) : [];
    el("fTizhi").querySelectorAll("input").forEach(function (cb) {
      cb.checked = tzSel.indexOf(cb.value) >= 0;
      cb.closest(".chip").classList.toggle("on", cb.checked);
    });

    const disSel = m ? (m.disease || []) : [];
    el("fDisease").querySelectorAll("input").forEach(function (cb) {
      cb.checked = disSel.indexOf(cb.value) >= 0;
      cb.closest(".chip").classList.toggle("on", cb.checked);
    });

    el("modalDel").classList.toggle("hidden", !m);
    el("memberModal").classList.remove("hidden");
  }

  function closeModal() {
    el("memberModal").classList.add("hidden");
    editingId = null;
  }

  el("addMemberBtn").onclick = function () { openModal(null); };
  el("modalClose").onclick = closeModal;
  el("memberModal").addEventListener("click", function (e) {
    if (e.target === el("memberModal")) closeModal();
  });

  el("modalSave").onclick = function () {
    const name = el("fName").value.trim();
    if (!name) { alert("请填写称呼，如「我」「妈妈」"); return; }

    const tizhi = [];
    el("fTizhi").querySelectorAll("input:checked").forEach(function (cb) { tizhi.push(cb.value); });

    const disease = [];
    el("fDisease").querySelectorAll("input:checked").forEach(function (cb) { disease.push(cb.value); });

    const data = {
      id: editingId || "",
      name: name,
      tizhi: tizhi,
      disease: disease,
      height: Number(el("fHeight").value) || null,
      weight: Number(el("fWeight").value) || null,
      note: el("fNote").value.trim(),
    };

    saveOneMember(data);
    closeModal();
    renderMembers();
    refreshAll();
  };

  el("modalDel").onclick = function () {
    if (!editingId) return;
    if (!confirm("删除这位家人的信息？删除后该成员的体质与体检记录将不再参与食谱计算。")) return;
    deleteMember(editingId);
    closeModal();
    renderMembers();
    refreshAll();
  };

  /* ======================================================
     三、食物库
     ====================================================== */
  const KIND_TXT = { raw: "食材", dish: "成品菜", snack: "零食", drink: "饮品" };

  /* ---------- 食物图标 ----------
     逐项映射；未命中时按分类回落，保证永远有图标 */
  const FOOD_ICON = {
    // 主食
    "小米": "🌾", "山药": "🍠", "糙米": "🌾", "白粥": "🥣", "糯米": "🍙",
    "燕麦": "🌾", "蔘麦": "🌾", "红薯": "🍠", "芋头": "🥔", "玉米": "🌽",
    "吐司": "🍞", "煎饼": "🥞", "馒头": "🍽️", "烧麦": "🥟", "水饺": "🥟", "小笼包": "🥟",
    "馄饨": "🥟",
    // 蔬菜
    "白萝卜": "🥕", "山药（菜用）": "🍠", "冬瓜": "🥒", "丝瓜": "🥒", "苦瓜": "🥒",
    "芥蓝": "🥬", "菠菜": "🥬", "茼蒿": "🥬", "莲藕": "🪷", "韭菜": "🌿",
    "空心菜": "🥬", "佛手瓜": "🥒", "南瓜": "🎃", "番茄": "🍅", "白萝卜（生）": "🥕",
    // 菌菇干货
    "木耳（黑）": "🍄", "香菇": "🍄",
    // 肉禽
    "鸡肉": "🍗", "鸭肉": "🦆", "羊肉": "🍖", "牛肉": "🥩", "瘦猪肉": "🥩", "猪肝": "🥩",
    // 蛋
    "鸡蛋": "🥚",
    // 水产
    "鲈鱼": "🐟", "黄翅鱼": "🐟", "虾": "🦐", "蟹蟹": "🦀",
    "海蛎（生蚝）": "🦪", "海带": "🌿", "紫菜": "🍃",
    // 豆制品
    "豆腐": "🧊", "豆浆": "🥛",
    // 水果
    "梨": "🍐", "柚子": "🍊", "番石榴": "🍈", "苹果": "🍎", "荔枝": "🍒", "西瓜": "🍉",
    // 药食同源
    "生姜": "🫚", "红枣": "🫘", "枸杞": "🍒", "陈皮": "🍊", "薏米": "🌾", "玫瑰花": "🌹",
    // 成品菜
    "清蒸鲈鱼": "🐟", "白切鸡": "🍗", "沙茶面": "🍜", "卤面": "🍜", "四果汤": "🍧",
    "手抓面": "🍜", "锅边糊": "🥣", "炒米粉": "🍝", "海蛎煎": "🍳", "白灼虾": "🦐",
    "排骨汤": "🍲", "番茄炒蛋": "🍳", "清炒时蔬": "🥬", "山药排骨汤": "🍲", "姜母鸭": "🦆",
    "寿司": "🍣", "青椒牛肉丝": "🥩", "水煮牛肉": "🌶️", "萝卜炖牛腩": "🍲",
    "鸡蛋灌饼": "🥞", "蛋煎馒头片": "🍞", "紫菜馄饨": "🥣", "韭菜盒子": "🥟",
    // 饮品
    "碳酸饮料": "🥤", "奶茶": "🧋", "啤酒": "🍺",
    // 零食
    "油炸食品": "🍟", "烧烤": "🍢", "腌制品（菜脯/咸鱼）": "🧂",
    "坚果（原味）": "🥜", "黑巧克力（70%+）": "🍫",
  };

  /* 分类兜底图标 */
  const CAT_ICON = {
    "主食": "🌾", "蔬菜": "🥬", "菌菇干货": "🍄", "肉禽": "🍖", "蛋": "🥚",
    "水产": "🐟", "豆制品": "🧊", "水果": "🍎", "药食同源": "🌿",
    "成品菜": "🍲", "饮品": "🥤", "零食": "🍪",
  };

  function foodIcon(f) {
    return FOOD_ICON[f.name] || CAT_ICON[f.cat] || "🍽";
  }

  function initCats() {
    const cats = [];
    DB.allFoods().forEach(function (f) { if (cats.indexOf(f.cat) < 0) cats.push(f.cat); });
    el("catSel").innerHTML = '<option value="">全部分类</option>' +
      cats.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join("");
  }

  function renderFoods() {
    const cat = el("catSel").value;
    const kw = el("foodSearch").value.trim();
    const box = el("foodList");

    const list = DB.allFoods().filter(function (f) {
      if (cat && f.cat !== cat) return false;
      if (kw && f.name.indexOf(kw) < 0 && (f.note || "").indexOf(kw) < 0) return false;
      return true;
    });

    // 搜索有关键词时，自定义菜优先排在前面（自己加的更容易找到）
    const sorted = kw ? list.slice().sort(function (a, b) {
      return (b.custom ? 1 : 0) - (a.custom ? 1 : 0);
    }) : list;

    if (!sorted.length) {
      box.innerHTML = '<div class="empty">没有符合条件的食物</div>';
      return;
    }

    box.innerHTML = sorted.map(function (f) {
      const has = inCart(f.id);
      return '<div class="food-card' + (has ? " picked" : "") + '">' +
        '<div class="fc-head">' +
          '<span class="fc-icon">' + foodIcon(f) + '</span>' +
          '<span class="fc-name">' + esc(f.name) + '</span>' +
          (f.custom ? '<span class="fc-custom">自定</span>' : '') +
          '<span class="fc-kind">' + (KIND_TXT[f.kind] || "") + '</span>' +
          '<button type="button" class="fc-btn' + (has ? " on" : "") + '" data-food="' + f.id + '">' +
            (has ? "已加入" : "+ 加入") + '</button>' +
        '</div>' +
        '<div class="fc-meta">' + esc(f.nature) + '　｜　归经：' + esc(f.meridian) + '</div>' +
        '<div class="fc-note">' + esc(f.note) + '</div>' +
      '</div>';
    }).join("");
  }

  el("catSel").onchange = renderFoods;
  el("foodSearch").oninput = renderFoods;

  el("foodList").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-food]");
    if (!btn) return;
    const id = btn.dataset.food;
    if (inCart(id)) removeFromCart(id);
    else if (!addToCart(id)) { alert("加入失败，请刷新页面重试"); return; }
    renderFoods();
    renderCart();
    updateCartNum();
  });

  /* ======================================================
     四、购物车
     ====================================================== */
  function updateCartNum() {
    el("cartNum").textContent = loadCart().length;
  }

  function renderCart() {
    const cart = loadCart();
    const box = el("cartList");

    if (!cart.length) {
      box.innerHTML = '<div class="empty">购物车还是空的<br>' +
        '<span class="small">去「食物库」把想吃的加进来</span></div>';
      return;
    }

    box.innerHTML = cart.map(function (c) {
      const f = DB.allFoods().find(function (x) { return x.id === c.foodId; });
      const icon = f ? foodIcon(f) : (CAT_ICON[c.cat] || "🍽");
      return '<div class="cart-row">' +
        '<div class="cr-left">' +
          '<div class="cr-name"><span class="cr-icon">' + icon + '</span>' + esc(c.name) + '</div>' +
          '<div class="cr-cat">' + esc(c.cat) + (c.kind === "cd" ? " · 自定" : "") + '</div>' +
        '</div>' +
        '<button type="button" class="cr-del" data-del="' + c.foodId + '">移出</button>' +
      '</div>';
    }).join("");
  }

  el("cartList").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-del]");
    if (!btn) return;
    removeFromCart(btn.dataset.del);
    renderCart();
    renderFoods();
    updateCartNum();
  });

  el("clearCartBtn").onclick = function () {
    if (!loadCart().length) return;
    if (!confirm("清空购物车里的全部食物？")) return;
    clearCart();
    renderCart();
    renderFoods();
    updateCartNum();
  };

  el("goAnalyzeBtn").onclick = function () {
    switchFtab("analyze");
    renderAnalyze();
    el("analyzeBox").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ======================================================
     四点五、我的菜谱（自定义菜品管理）
     ====================================================== */
  let editingDishId = null;
  const ROLE_TXT = { protein: "主菜", veg: "素菜", staple: "主食", soup: "汤羹" };
  const MEAL_TXT = { breakfast: "早", lunch: "午", dinner: "晚" };

  function updateDishNum() {
    el("dishNum").textContent = loadCustomDishes().length;
  }

  function renderCustomDishes() {
    updateDishNum();
    const list = loadCustomDishes();
    const box = el("customList");

    if (!list.length) {
      box.innerHTML = '<div class="empty">还没有添加自定义菜<br>' +
        '<span class="small">家里常吃的招牌菜、市场现买的熟食都可以加进来</span></div>' +
        '<div class="empty" style="margin:8px 0 14px"><span class="small">热门速填：</span><div id="quickAddBox" class="chip-group" style="margin-top:8px"></div></div>';
      renderQuickAdd();
      return;
    }

    box.innerHTML = list.map(function (d) {
      const mealTxt = (d.meal || []).map(function (m) { return MEAL_TXT[m] || m; }).join("·");
      return '<div class="dish-row">' +
        '<div class="dr-left">' +
          '<div class="dr-name">🍽 ' + esc(d.name) + '</div>' +
          '<div class="dr-tags">' +
            '<span class="tag">' + (ROLE_TXT[d.role] || d.role) + '</span>' +
            '<span class="tag">' + mealTxt + '餐</span>' +
            (d.time ? '<span class="tag">约' + d.time + '分钟</span>' : '') +
          '</div>' +
          (d.ing && d.ing.length
            ? '<div class="dr-note">食材：' + esc(d.ing.map(function (i) { return i.n + (i.a ? " " + i.a + i.u : ""); }).join("、")) + '</div>'
            : '') +
          (d.steps && d.steps.length
            ? '<div class="dr-note">做法：' + esc(d.steps[0]) + (d.steps.length > 1 ? ' 等 ' + d.steps.length + ' 步' : '') + '</div>'
            : '') +
          (d.note ? '<div class="dr-note">备注：' + esc(d.note) + '</div>' : '') +
        '</div>' +
        '<button type="button" class="mr-edit" data-editdish="' + d.id + '">编辑</button>' +
      '</div>';
    }).join("") + '<div class="empty" style="margin:10px 0 4px;color:#a8b0ad;font-size:12px">共 ' + list.length + ' 道自定义菜 · 添加后可在下方「+ 添加一道菜」继续补充</div>';
  }

  /* 空列表时的热门速填（一键预填常见家常菜） */
  const QUICK_DISHES = [
    { name: "青椒炒肉丝", role: "protein", ing: "猪肉 200g、青椒 200g" },
    { name: "清炒土豆丝", role: "veg", ing: "土豆 300g、干辣椒 2 个" },
    { name: "葱油拌面", role: "staple", ing: "面条 300g、小葱 20g" },
    { name: "冬瓜花蛤汤", role: "soup", ing: "冬瓜 300g、花蛤 300g" },
  ];
  function renderQuickAdd() {
    const box = el("quickAddBox");
    if (!box) return;
    box.innerHTML = QUICK_DISHES.map(function (q, i) {
      return '<label class="chip"><input type="button" data-quickdish="' + i + '" value="' + esc(q.name) + '">' +
        '<span>' + esc(q.name) + '</span></label>';
    }).join("");
    box.querySelectorAll("[data-quickdish]").forEach(function (b) {
      b.onclick = function () {
        const q = QUICK_DISHES[Number(b.dataset.quickdish)];
        openDishModal(null, q);
      };
    });
  }

  el("customList").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-editdish]");
    if (btn) openDishModal(btn.dataset.editdish);
  });

  el("addDishBtn").onclick = function () { openDishModal(null); };

  /* 手动输入的食材解析：“牛肉 250g、洋葱1个” → [{n,a,u,c}] */
  function parseIngText(txt) {
    if (!txt) return [];
    return txt.split(/[、，,；;\n]/).map(function (s) {
      s = s.trim();
      if (!s) return null;
      const m = s.match(/^(.+?)\s*([\d.]+)\s*(g|克|ml|毫升|个|只|根|片|朵|把|勺|瓣|块|条|包|罐)?$/);
      if (m && m[2]) {
        return { n: m[1].trim(), a: Number(m[2]), u: m[3] || "", c: guessCat(m[1]) };
      }
      return { n: s, a: 0, u: "", c: guessCat(s) };
    }).filter(Boolean);
  }

  function guessCat(name) {
    if (/牛|猪|鸡|鸭|羊|排骨|肉/.test(name)) return "肉禽";
    if (/蛋/.test(name)) return "蛋";
    if (/鱼|虾|蟹|贝|蚵|蛎|花蛤|鱿鱼/.test(name)) return "水产";
    if (/豆腐|豆干|豆浆/.test(name)) return "豆制品";
    if (/面|米|粉|馒头|饼|饺子|馄饨|燕麦/.test(name)) return "主食";
    if (/菌|菇|木耳|海带|紫菜/.test(name)) return "菌菇干货";
    if (/枣|枸杞|参|陈皮|茯苓|薏米|姜/.test(name)) return "药食同源";
    return "蔬菜";
  }

  function openDishModal(id, prefill) {
    editingDishId = id || null;
    const d = id ? loadCustomDishes().find(function (x) { return x.id === id; }) : null;
    const p = prefill || {};

    el("dishModalTitle").textContent = d ? "编辑菜品" : "添加菜品";
    el("dName").value = d ? d.name : (p.name || "");
    el("dRole").value = d ? d.role : (p.role || "protein");
    el("dTime").value = d && d.time ? d.time : "";
    el("dNote").value = d ? (d.note || "") : "";

    el("dMeal").querySelectorAll("input").forEach(function (cb) {
      cb.checked = d ? (d.meal || []).indexOf(cb.value) >= 0 : (cb.value !== "breakfast");
      cb.closest(".chip").classList.toggle("on", cb.checked);
    });

    el("dIng").value = d && d.ing && d.ing.length
      ? d.ing.map(function (i) { return i.n + (i.a ? " " + i.a + i.u : ""); }).join("、")
      : (p.ing || "");
    el("dSteps").value = d && d.steps ? d.steps.join("\n") : "";

    el("dishModalDel").classList.toggle("hidden", !d);
    el("dishModal").classList.remove("hidden");
  }

  function closeDishModal() {
    el("dishModal").classList.add("hidden");
    editingDishId = null;
  }

  el("dishModalClose").onclick = closeDishModal;
  el("dishModal").addEventListener("click", function (e) {
    if (e.target === el("dishModal")) closeDishModal();
  });

  el("dMeal").addEventListener("change", function (e) {
    if (e.target.tagName !== "INPUT") return;
    e.target.closest(".chip").classList.toggle("on", e.target.checked);
  });

  el("dishModalSave").onclick = function () {
    const name = el("dName").value.trim();
    if (!name) { alert("请填写菜名"); return; }

    const meal = [];
    el("dMeal").querySelectorAll("input:checked").forEach(function (cb) { meal.push(cb.value); });
    if (!meal.length) { alert("至少勾选一个餐次（早/午/晚）"); return; }

    const dish = {
      id: editingDishId || "",
      name: name,
      meal: meal,
      role: el("dRole").value,
      time: Number(el("dTime").value) || 20,
      ing: parseIngText(el("dIng").value),
      steps: el("dSteps").value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean),
      note: el("dNote").value.trim(),
      natureTxt: "自定",
    };

    if (editingDishId) {
      updateCustomDish(dish);
    } else {
      const r = addCustomDish(dish);
      if (!r.ok) { alert(r.msg); return; }
    }

    // 同步登记到食物库候选（kind 标记 cd，购物车甄选时好识别）
    closeDishModal();
    renderCustomDishes();
    initCats();
    renderFoods();
  };

  el("dishModalDel").onclick = function () {
    if (!editingDishId) return;
    const d = loadCustomDishes().find(function (x) { return x.id === editingDishId; });
    if (!confirm("删除「" + (d ? d.name : "这道菜") + "」？删除后不再出现在食物库与周食谱候选里。")) return;
    deleteCustomDish(editingDishId);
    // 购物车里若也加过它，一并移出（不然甄选会找不到）
    removeFromCart(editingDishId);
    closeDishModal();
    renderCustomDishes();
    initCats();
    renderFoods();
    renderCart();
    updateCartNum();
  };

  /* ======================================================
     五、甄选分析
     ====================================================== */
  const LEVEL = {
    good:    { txt: "推荐常吃", cls: "lv-good" },
    ok:      { txt: "可以吃",   cls: "lv-ok" },
    caution: { txt: "少量慎吃", cls: "lv-caution" },
    bad:     { txt: "不建议",   cls: "lv-bad" },
  };

  function currentMembers() {
    const members = loadMembers();
    if (members.length) return members;
    return [{ id: "tmp", name: "通用", tizhi: ["平和"], disease: [] }];
  }

  function renderAnalyze() {
    const cart = loadCart();
    const box = el("analyzeBox");

    if (!cart.length) {
      box.innerHTML = '<div class="empty">购物车是空的，先去「食物库」挑几样吧</div>';
      return;
    }

    const members = currentMembers();

    const items = cart.map(function (c) {
      const f = DB.allFoods().find(function (x) { return x.id === c.foodId; });
      if (!f) return null;
      const all = DB.analyzeFood(f, members);
      const per = members.map(function (m) {
        return { name: m.name || "未命名", level: DB.analyzeFood(f, [m]).level };
      });
      return { f: f, a: all, per: per };
    }).filter(Boolean);

    const cnt = { good: 0, ok: 0, caution: 0, bad: 0 };
    items.forEach(function (it) { cnt[it.a.level]++; });

    const ml = members.map(function (m) {
      return (m.name || "未命名") + (m.tizhi && m.tizhi.length ? "（" + m.tizhi.join("/") + "）" : "（平和）");
    }).join("、");

    let html = '<div class="an-summary">' +
      '<div class="as-title">甄选结论</div>' +
      '<div class="as-nums">' +
        '<span class="as-num lv-good">推荐 ' + cnt.good + '</span>' +
        '<span class="as-num lv-ok">可吃 ' + cnt.ok + '</span>' +
        '<span class="as-num lv-caution">慎吃 ' + cnt.caution + '</span>' +
        '<span class="as-num lv-bad">不宜 ' + cnt.bad + '</span>' +
      '</div>' +
      '<div class="as-base">判定依据：' + esc(ml) + '</div>' +
      '<div class="as-note">规则：家里有人患某慢病且该食物属禁忌 = 直接不建议；命中 2 项以上体质不宜 = 不建议；命中 1 项 = 少量慎吃；只命中适宜体质 = 推荐。</div>' +
    '</div>';

    const order = ["bad", "caution", "ok", "good"];
    order.forEach(function (lv) {
      const group = items.filter(function (it) { return it.a.level === lv; });
      if (!group.length) return;

      html += '<div class="an-group ' + LEVEL[lv].cls + '">' +
        '<div class="ag-title">' + LEVEL[lv].txt + '（' + group.length + '）</div>' +
        group.map(function (it) {
          const f = it.f;
          const perTxt = it.per.map(function (p) {
            const mark = (p.level === "bad") ? "✕" : (p.level === "caution" ? "△" : "✓");
            return '<span class="per ' + LEVEL[p.level].cls + '">' + esc(p.name) + ' ' + mark + '</span>';
          }).join("");

          return '<div class="an-card">' +
            '<div class="ac-head">' +
              '<span class="ac-icon">' + foodIcon(f) + '</span>' +
              '<span class="ac-name">' + esc(f.name) + '</span>' +
              '<span class="ac-meta">' + esc(f.nature) + '　' + esc(f.meridian) + '</span>' +
              '<button type="button" class="ac-del" data-del2="' + f.id + '">移出</button>' +
            '</div>' +
            (it.a.reasons.length
              ? '<ul class="ac-reasons">' + it.a.reasons.map(function (r) {
                  return '<li>' + esc(r) + '</li>';
                }).join("") + '</ul>'
              : '<p class="ac-reasons plain">无特殊宜忌，正常食用即可</p>') +
            '<div class="ac-per">' + perTxt + '</div>' +
            (it.a.alt && (lv === "caution" || lv === "bad")
              ? '<div class="ac-alt">想吃可换成：' + esc(it.a.alt) + '</div>' : '') +
            '<div class="ac-note">' + esc(f.note) + '</div>' +
          '</div>';
        }).join("") +
      '</div>';
    });

    html += '<p class="hint" style="margin-top:14px">以上按中医食性 + 家人体质/慢病规则给出，属养生参考，不作诊断依据。</p>';

    box.innerHTML = html;

    box.querySelectorAll("[data-del2]").forEach(function (btn) {
      btn.onclick = function () {
        removeFromCart(btn.dataset.del2);
        renderAnalyze();
        renderCart();
        renderFoods();
        updateCartNum();
      };
    });
  }

  /* ======================================================
     六、初始化
     ====================================================== */
  function refreshAll() {
    updateCartNum();
    renderCart();
    renderFoods();
    // 成员或购物车变化后，若已有购物车则同步刷新甄选结果
    if (loadCart().length) renderAnalyze();
  }

  initCats();
  renderMembers();
  updateDishNum();
  refreshAll();

  // 若已有购物车，直接可分析
  if (loadCart().length) renderAnalyze();
})();
