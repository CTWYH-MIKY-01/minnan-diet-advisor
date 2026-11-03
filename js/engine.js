/* ======================================================
   食谱生成引擎 engine.js
   1. 选菜：按节气 + 慢病硬禁忌过滤，体质作为加减分
   2. 组合：早/午/晚按角色搭配，同类菜尽量轮换不重复
   3. 采购：全周食材按名称汇总

   判定原则（重要）：
     · 慢病禁忌 = 硬过滤（一票否决）。如痛风忌高嘌呤、高血压忌高盐。
     · 体质不宜 = 软扣分。中医体质是"调理方向"，不是过敏式禁忌；
       家庭共餐时若因一人口味/体质把大半菜品全部排除，反而吃不好。
       故：命中 badTz 大幅降分，仅在无更好选择时才用。
     · 生腌/刺身 + 胃寒/寒湿 = 硬过滤（生食确实伤胃）
     · 主食允许天天复用（米饭本就如此），其余角色尽量同周不重复
   ====================================================== */

/* ---------- 体质合并 ---------- */
function mergeTizhi(members) {
  const all = [];
  members.forEach(function (m) { (m.tizhi || []).forEach(function (t) { if (all.indexOf(t) < 0) all.push(t); }); });

  // 慢病中的结节，等价于「结节体质」——否则用户勾了肺结节却按普通体质选菜，
  // 会给出羊肉、鹅肉等发物，这是最容易踩的坑
  members.forEach(function (m) {
    const dis = m.disease || [];
    if ((dis.indexOf("lungNodule") >= 0 || dis.indexOf("thyroidNodule") >= 0)
        && all.indexOf("结节体质") < 0) {
      all.push("结节体质");
    }
  });

  return all;
}

function mergeDisease(members, opts) {
  const all = [];
  members.forEach(function (m) { (m.disease || []).forEach(function (d) { if (all.indexOf(d) < 0) all.push(d); }); });
  return all;
}

/* 家庭"最严"约束：慢病是硬禁忌，全桌统一 */
function familyForbidden(members) {
  return { tizhiAll: mergeTizhi(members), diseases: mergeDisease(members) };
}

/* ---------- 单菜是否可用（硬过滤） ---------- */
function dishAllowed(dish, ctx) {
  // 1. 季节：四季 / 含当前季
  const seasons = dish.season || ["四季"];
  if (seasons.indexOf("四季") < 0 && seasons.indexOf(ctx.season) < 0) return false;

  // 2. 慢病硬禁忌（一票否决）
  const badDis = dish.badDis || [];
  for (let i = 0; i < ctx.diseases.length; i++) {
    if (badDis.indexOf(ctx.diseases[i]) >= 0) return false;
  }

  // 3. 体质不宜：单人不宜只降权；同时不宜两人及以上 = 全家都不该吃，硬排除
  //    （例：当归生姜羊肉汤对湿热、结节体质均不宜，家里同时有这两类人就不该做）
  const badTz = dish.badTz || [];
  let badHit = 0;
  ctx.tizhiAll.forEach(function (t) { if (badTz.indexOf(t) >= 0) badHit++; });
  if (badHit >= 2) return false;

  // 4. 生腌/刺身：家里有胃寒、寒湿、胃病者一律不做
  if (/生腌|刺身/.test(dish.name)) {
    if (ctx.tizhiAll.indexOf("胃寒") >= 0 || ctx.tizhiAll.indexOf("寒湿") >= 0) return false;
    if (ctx.diseases.indexOf("gastritis") >= 0) return false;
  }

  return true;
}

/* ---------- 评分：命中家庭体质加分，体质不宜扣分 ---------- */
function dishScore(dish, ctx) {
  let s = 0;
  const tz = dish.tz || [];
  const badTz = dish.badTz || [];

  // 一人受益加 10，多人受益叠加（家庭共餐，照顾到的人越多越好）
  ctx.tizhiAll.forEach(function (t) {
    if (tz.indexOf(t) >= 0) s += 10;
  });

  // 体质不宜：大幅降分但不是禁用
  ctx.tizhiAll.forEach(function (t) {
    if (badTz.indexOf(t) >= 0) s -= 26;
  });

  if (tz.indexOf("平和") >= 0) s += 1;

  // 结节体质家庭优先散结疏肝
  if (ctx.tizhiAll.indexOf("结节体质") >= 0 && tz.indexOf("结节体质") >= 0) s += 6;

  // 节气当季本地食材加分（按所选地区取当季清单，未选地区回落到闽南）
  const localList = window.RULE.localSeason(ctx.region || "漳州", ctx.season);
  (dish.ing || []).forEach(function (i) {
    if (localList.some(function (l) { return i.n.indexOf(l) >= 0 || l.indexOf(i.n) >= 0; })) s += 3;
  });

  // 口味偏好：喜欢的标签命中菜品/食材名脉加 5 分，不吃的扣 60 分（近乎排除）
  const likes = (ctx.prefs && ctx.prefs.likes) || [];
  const dislike = (ctx.prefs && ctx.prefs.dislikes) || [];
  const hitName = function (kw) {
    if (dish.name.indexOf(kw) >= 0) return true;
    return (dish.ing || []).some(function (i) { return i.n.indexOf(kw) >= 0; });
  };
  likes.forEach(function (kw) {
    if (kw === "爱吃鱼" && /鱼|虾|蟹|贝|蚵|海蛎/.test(dish.name)) s += 8;
    else if (kw === "爱吃鸡" && /鸡/.test(dish.name)) s += 8;
    else if (kw === "不吃辣" && /辣|椒麻/.test(dish.name)) s -= 30;
    else if (kw === "不吃牛羊" && /牛|羊/.test(dish.name)) s -= 60;
    else if (kw === "不吃内脏" && /肝|肚|肠|腰/.test(dish.name)) s -= 60;
    else if (kw === "不吃香菜" && hitName("香菜")) s -= 40;
    else if (kw === "清淡" && /红烧|卤|沙茶|酱爆/.test(dish.name)) s -= 12;
    else if (kw === "少油" && /炸|煎|爆炒|红烧/.test(dish.name)) s -= 12;
    else if (kw === "少盐" && /腌|咸|酱|卤/.test(dish.name)) s -= 12;
  });
  dislike.forEach(function (kw) {
    if (hitName(kw)) s -= 60;
  });

  return s;
}

/* ---------- 稳定伪随机（同一天同样结果，不同天有变化） ---------- */
function seededRandom(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/* 从候选里挑一个
   规则：
     · 优先挑没用过的，按分数取前 N 随机
     · 用完了才复用：
         - 主食：挑"上次出现最早"的一批（保证一周内尽量换着吃）
         - 非主食：同样优先挑隔得最久的，并强制排除昨天刚吃过的那批
   这样每餐不缺菜，同时避免"连着两天同一个汤" */
function pickDish(candidates, used, rand, topN, allowReuse, dayIdx) {
  if (!candidates.length) return null;

  const fresh = candidates.filter(function (d) { return !used[d.id]; });
  let pool;

  if (fresh.length) {
    pool = fresh;
  } else {
    // 按"上次出现的天序号"升序，取最久没出现的那一批
    const sorted = candidates.slice().sort(function (a, b) {
      return (used[a.id] || 0) - (used[b.id] || 0);
    });
    const oldest = used[sorted[0].id] || 0;
    pool = sorted.filter(function (d) { return (used[d.id] || 0) === oldest; });

    // 非主食再排除昨天刚吃过的（若排除后还有候选）
    if (!allowReuse) {
      const notYesterday = pool.filter(function (d) { return (used[d.id] || 0) < dayIdx; });
      if (notYesterday.length) pool = notYesterday;
    }
  }

  pool = pool.slice().sort(function (a, b) { return b._score - a._score; });
  const top = pool.slice(0, Math.min(topN || 3, pool.length));
  return top[Math.floor(rand() * top.length)];
}

/* ---------- 生成一天 ---------- */
function buildDay(ctx, dayIdx, used, rand) {
  const byMeal = function (meal, role) {
    return ctx.pool.filter(function (d) {
      return (d.meal || []).indexOf(meal) >= 0 && d.role === role;
    });
  };

  function take(meal, role, topN) {
    // 主食天天吃，允许复用；其他角色尽量轮换
    const allowReuse = (role === "staple");
    let d = pickDish(byMeal(meal, role), used, rand, topN, allowReuse, dayIdx + 1);
    if (d) used[d.id] = dayIdx + 1;   // 记录最后出现的天序号（1 起）
    return d;
  }

  const breakfast = [
    take("breakfast", "staple", 4),
    take("breakfast", "protein", 3),
    take("breakfast", "veg", 3),
  ].filter(Boolean);

  const lunch = [
    take("lunch", "staple", 3),
    take("lunch", "protein", 4),
    take("lunch", "veg", 4),
    take("lunch", "soup", 4),
  ].filter(Boolean);

  const dinner = [
    take("dinner", "staple", 3),
    take("dinner", "protein", 4),
    take("dinner", "veg", 4),
    take("dinner", "soup", 3),
  ].filter(Boolean);

  return {
    breakfast: breakfast,
    lunch: lunch,
    dinner: dinner,
    all: breakfast.concat(lunch, dinner),
  };
}

/* ---------- 生成一周 ---------- */
function buildWeek(members, startDate, opts) {
  opts = opts || {};
  const JQ = window.JQ;
  const tizhiAll = mergeTizhi(members);
  const diseases = mergeDisease(members);
  const region = opts.region || "漳州";
  const prefs = opts.prefs || { likes: [], dislikes: [] };

  const days = [];
  const used = {};      // 菜品 id -> 最后出现的天序号（1起）
  const weekLabel = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate.getTime() + i * 86400000);
    const jq = JQ.currentJieqi(d);
    const season = jq.season;

    const ctx = {
      season: season, tizhiAll: tizhiAll, diseases: diseases,
      region: region, prefs: prefs, pool: [],
    };

    ctx.pool = window.DISHES.filter(function (dish) {
      return dishAllowed(dish, ctx);
    }).map(function (dish) {
      const copy = Object.assign({}, dish);
      copy._score = dishScore(dish, ctx);
      return copy;
    });

    const rand = seededRandom((opts.seed || "seed") + "|" +
      startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate() + "|" + i);

    // 某个档位挑不出菜时，放宽季节限制兜底（避免整餐空缺）
    if (!ctx.pool.some(function (x) { return x.role === "protein"; })) {
      ctx.pool = ctx.pool.concat(
        window.DISHES.filter(function (dish) {
          return dish.role === "protein" &&
            (dish.badDis || []).every(function (b) { return diseases.indexOf(b) < 0; });
        }).map(function (dish) {
          const copy = Object.assign({}, dish);
          copy._score = dishScore(dish, ctx) - 50;  // 季节不符的降权
          return copy;
        })
      );
    }

    const dayMenu = buildDay(ctx, i, used, rand);

    days.push({ date: d, jq: jq, season: season, menu: dayMenu });
    weekLabel.push({ jq: jq.name, season: season });
  }

  return {
    startDate: startDate,
    days: days,
    tizhiAll: tizhiAll,
    diseases: diseases,
    region: region,
    weekLabel: weekLabel,
  };
}

/* ---------- 采购汇总（按名称合并同类项） ---------- */
function aggregateShopping(days, persons) {
  const ppl = Number(persons) || 3;
  const map = {};

  days.forEach(function (day) {
    day.menu.all.forEach(function (dish) {
      const scale = ppl / (dish.servings || 3);   // 按实际人数缩放
      (dish.ing || []).forEach(function (it) {
        const key = it.n + "|" + it.u;
        if (!map[key]) {
          map[key] = { n: it.n, u: it.u, c: it.c, a: 0, dishes: [] };
        }
        map[key].a += Number(it.a) * scale;
        if (map[key].dishes.indexOf(dish.name) < 0) map[key].dishes.push(dish.name);
      });
    });
  });

  const order = ["主食", "蔬菜", "肉禽", "水产", "蛋", "豆制品", "菌菇干货", "药食同源", "水果", "调味"];
  return Object.keys(map).map(function (k) {
    const v = map[k];
    v.a = Math.round(v.a * 10) / 10;
    return v;
  }).sort(function (a, b) {
    const ia = order.indexOf(a.c), ib = order.indexOf(b.c);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

window.ENGINE = {
  buildWeek: buildWeek,
  aggregateShopping: aggregateShopping,
  mergeTizhi: mergeTizhi,
  mergeDisease: mergeDisease,
  dishAllowed: dishAllowed,
  dishScore: dishScore,
};