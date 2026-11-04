/* ======================================================
   version.js —— 版本自动检测与刷新（v24 新增）
   原理：
     1. 页面里写死当前版本 APP_VERSION（每次发版同步改）
     2. 联网时用「时间戳参数」请求 version.txt（绕开 HTTP 缓存）
     3. 服务器上的版本号 > 本页版本号 → 说明网页已更新
        但手机浏览器还在用旧缓存，自动 location.reload 强刷一次
        并打上 ?fresh=1 标记，防止刷新后旧缓存又判一遍死循环
     4. 页脚「检查更新」按钮：手动触发同样的对比
   特点：
     · 纯前端，无后端依赖，只要 version.txt 能被访问
     · 家人/购物车数据全存 localStorage，刷新不丢
     · 单机打开（file://）或 version.txt 拿不到时静默跳过，绝不报错
   ====================================================== */

var APP_VERSION = "v24";

(function () {
  "use strict";

  var CHECK_KEY = "mnd_ver_checked";      // 上次自动检查到的版本
  var CHECKED_AT = "mnd_ver_time";       // 上次检查时间
  var COOLDOWN_MS = 30 * 60 * 1000;      // 自动检查间隔：30 分钟

  /* 读 version.txt 首行（形如 v24），失败返回空 */
  function fetchServerVersion(cb) {
    try {
      var xhr = new XMLHttpRequest();
      // 时间戳参数绕开 HTTP 缓存，保证每次拿到的是服务器最新内容
      xhr.open("GET", "version.txt?t=" + Date.now(), true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200 && xhr.status !== 0) return cb("");
        var first = (xhr.responseText || "").split("\n")[0].trim();
        cb(/^v\d+$/i.test(first) ? first.toLowerCase() : "");
      };
      xhr.send();
    } catch (e) { cb(""); }
  }

  /* 比较 v23 < v24 这样的版本号 */
  function isNewer(remote, local) {
    if (!remote || !local) return false;
    var r = parseInt(remote.replace(/^v/i, ""), 10);
    var l = parseInt(local.replace(/^v/i, ""), 10);
    if (isNaN(r) || isNaN(l)) return false;
    return r > l;
  }

  /* 判断当前页是不是刚被强刷出来的（防死循环标记：
     URL 只要有 fresh 参数即算，值是时间戳不是固定 1） */
  function justFreshened() {
    try {
      return new URLSearchParams(location.search).get("fresh") !== null;
    } catch (e) { return false; }
  }

  /* 构造带新 fresh 参数的干净 URL：先去掉旧 fresh 和 # 锚点，避免参数越刷越长 */
  function buildFreshUrl() {
    var base = location.href.split("#")[0];
    var q = location.search.replace(/[?&]fresh=\d+/g, "");
    return base.replace(location.search, "") + (q ? q + "&" : "?") + "fresh=" + Date.now();
  }

  /* 服务器版本比本页新 → 强制刷新换新文件
     第二遍（fresh=1）后服务器仍比本页新，说明 CDN/缓存还在拖，
     就不再刷了，只把按钮留出来让用户手动试 */
  function applyUpdate(remoteVer) {
    if (justFreshened()) return false;
    try { localStorage.setItem(CHECK_KEY, remoteVer); } catch (e) {}
    location.replace(buildFreshUrl());
    return true;
  }

  /* 供页脚按钮调用：手动检查并给出明确提示 */
  function manualCheck() {
    fetchServerVersion(function (remote) {
      var btn = document.getElementById("checkUpdateBtn");
      if (!remote) {
        alert("连不上版本信息（可能是离线打开，或网络未通）。\n" +
              "若刚上传新版，请稍等几分钟再试，\n" +
              "或在手机浏览器设置里清除该站点缓存后重开。");
        return;
      }
      if (isNewer(remote, APP_VERSION)) {
        alert("发现新版（" + remote + "），正在为您刷新到最新版…");
        location.replace(buildFreshUrl());
      } else {
        if (btn) btn.textContent = "已是最新版 " + APP_VERSION;
        alert("当前已是最新版（" + APP_VERSION + "）。");
      }
    });
  }

  /* 开页自动检查（带冷却时间，避免频繁请求） */
  function autoCheck() {
    if (justFreshened()) return;          // 刚强刷过，不再自动触发
    if (location.protocol === "file:") return;  // 本地单机打开不检查
    var last = 0;
    try {
      last = parseInt(localStorage.getItem(CHECKED_AT) || "0", 10) || 0;
    } catch (e) {}
    if (Date.now() - last < COOLDOWN_MS) return;
    try { localStorage.setItem(CHECKED_AT, String(Date.now())); } catch (e) {}
    fetchServerVersion(function (remote) {
      if (remote && isNewer(remote, APP_VERSION)) applyUpdate(remote);
    });
  }

  /* 绑定页脚按钮 */
  function bind() {
    var btn = document.getElementById("checkUpdateBtn");
    if (btn) btn.onclick = manualCheck;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { bind(); autoCheck(); });
  } else {
    bind();
    autoCheck();
  }

  window.VERSION_CHECK = { manualCheck: manualCheck };
})();
