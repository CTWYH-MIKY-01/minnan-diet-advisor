/* ======================================================
   storage.js —— 成员逐个保存 + 历史方案
   所有数据只存本机浏览器 localStorage，不上传服务器
   ====================================================== */

const K_MEMBERS = "mnd_members_v2";   // 家庭成员（每人独立记录）
const K_HISTORY = "mnd_history_v2";   // 生成过的周食谱（最多 20 份）
const K_PROFILE = "mnd_profile_v2";   // 家庭所在地区等全局设置
const K_CART = "mnd_cart_v1";         // 食物购物车（想吃的 / 想试的）
const K_PREFS = "mnd_prefs_v1";       // 菜品偏好（喜欢的菜系/忌口）
const K_WEEKREQ = "mnd_weekreq_v1";   // 本周要求（某食物每周最多出现几次）

/* ---------- 成员 ---------- */
function loadMembers() {
  try { return JSON.parse(localStorage.getItem(K_MEMBERS)) || []; }
  catch (e) { return []; }
}

function saveMembers(list) {
  localStorage.setItem(K_MEMBERS, JSON.stringify(list));
}

/* 单个成员保存（按 id 覆盖或新增）—— 这就是"每个都能保存" */
function saveOneMember(member) {
  const list = loadMembers();
  if (!member.id) {
    member.id = "m_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  }
  const idx = list.findIndex(function (x) { return x.id === member.id; });
  if (idx >= 0) list[idx] = member;
  else list.push(member);
  saveMembers(list);
  return member;
}

function deleteMember(id) {
  const list = loadMembers().filter(function (x) { return x.id !== id; });
  saveMembers(list);
}

function getMember(id) {
  return loadMembers().find(function (x) { return x.id === id; }) || null;
}

/* ---------- 全局设置 ---------- */
function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(K_PROFILE)) || { region: "漳州", lat: 24.51, lon: 117.65 };
  }
  catch (e) { return { region: "漳州", lat: 24.51, lon: 117.65 }; }
}
function saveProfile(p) { localStorage.setItem(K_PROFILE, JSON.stringify(p)); }

/* ---------- 食物购物车 ---------- */
/* 结构：[{ id, foodId, name, kind, cat, addTime, note }] */
function loadCart() {
  try { return JSON.parse(localStorage.getItem(K_CART)) || []; }
  catch (e) { return []; }
}

function saveCart(list) {
  localStorage.setItem(K_CART, JSON.stringify(list));
}

function addToCart(foodId, note) {
  const list = loadCart();
  if (list.some(function (x) { return x.foodId === foodId; })) return false;
  const f = (window.FOODS_DB ? window.FOODS_DB.FOODS : []).find(function (x) { return x.id === foodId; });
  if (!f) return false;
  list.push({
    id: "c_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    foodId: foodId,
    name: f.name,
    kind: f.kind,
    cat: f.cat,
    addTime: Date.now(),
    note: note || "",
  });
  saveCart(list);
  return true;
}

function removeFromCart(foodId) {
  saveCart(loadCart().filter(function (x) { return x.foodId !== foodId; }));
}

function inCart(foodId) {
  return loadCart().some(function (x) { return x.foodId === foodId; });
}

function clearCart() { localStorage.removeItem(K_CART); }

/* ---------- 菜品偏好 ---------- */
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(K_PREFS)) || { likes: [], dislikes: [] }; }
  catch (e) { return { likes: [], dislikes: [] }; }
}
function savePrefs(p) { localStorage.setItem(K_PREFS, JSON.stringify(p)); }

/* ---------- 本周要求 ----------
   结构：[{ id, kw, meal, max }]
     kw   关键词（匹配菜名或食材名，如"豆浆""粥"）
     meal 餐次限制："breakfast" | "lunch" | "dinner" | "all"（不限）
     max  每周最多次数（0 = 整周不出现）
   说明：同一条规则只计配额上限的菜量，例如「粥限 1 次/周」指粥类整个
   周只出现 1 餐粥——粥类里具体喝哪一碗由引擎按体质选最好的那一餐，
   避免每天都只换名字同一种吃法。 */
function loadWeekRules() {
  try {
    const list = JSON.parse(localStorage.getItem(K_WEEKREQ));
    if (!Array.isArray(list)) return [];
    return list.filter(function (r) { return r && r.kw; });
  } catch (e) { return []; }
}
function saveWeekRules(list) {
  list = (list || []).filter(function (r) { return r && r.kw; });
  localStorage.setItem(K_WEEKREQ, JSON.stringify(list));
}

/* ---------- 历史方案 ---------- */
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(K_HISTORY)) || []; }
  catch (e) { return []; }
}

function saveHistory(rec) {
  const list = loadHistory();
  list.unshift(rec);
  while (list.length > 20) list.pop();
  localStorage.setItem(K_HISTORY, JSON.stringify(list));
}

function deleteHistory(time) {
  const list = loadHistory().filter(function (r) { return r.time !== time; });
  localStorage.setItem(K_HISTORY, JSON.stringify(list));
}

function clearHistory() { localStorage.removeItem(K_HISTORY); }

/* ---------- URL 参数（支持中文） ---------- */
function enc(obj) { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
function dec(str) { return JSON.parse(decodeURIComponent(escape(atob(str)))); }

/* ---------- 生日/周岁 ---------- */
function calcAge(birth) {
  if (!birth) return null;
  const b = new Date(birth);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a >= 0 ? a : null;
}