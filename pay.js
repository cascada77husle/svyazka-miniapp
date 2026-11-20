/* ARQON: оплата без остановки в боте.
   Нажатие на кнопку тарифа: экран загрузки, сервер создаёт платёж Platega,
   как только ссылка получена, человека сразу переводит на страницу оплаты (во внешнем браузере).
   Если что-то пошло не так (нет данных Telegram, сервер не ответил), откроется бот с тем же тарифом. */
(function () {
  var API = "https://luxmax-bot-production-26691cbd.up.railway.app/api/tracker/pay";
  var BOT = "ARQONx_bot";
  var LIMIT = 20000;
  var tg = window.Telegram && window.Telegram.WebApp;
  var ov = null, busy = false, hideT = null;

  function css() {
    if (document.getElementById("arq-pay-css")) return;
    var s = document.createElement("style");
    s.id = "arq-pay-css";
    s.textContent =
      ".arqp{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;" +
      "background:var(--bg,#070808);color:var(--ink,#f4f5f7);opacity:0;transition:opacity .28s ease;" +
      "font-family:Inter,-apple-system,system-ui,sans-serif;-webkit-user-select:none;user-select:none}" +
      ".arqp.on{opacity:1}" +
      ".arqp:before{content:'';position:absolute;inset:0;pointer-events:none;" +
      "background:radial-gradient(60% 45% at 50% 38%,rgba(201,204,209,.16),transparent 70%)}" +
      ".arqp .bx{position:relative;text-align:center;max-width:300px;transform:translateY(8px);transition:transform .4s ease}" +
      ".arqp.on .bx{transform:none}" +
      ".arqp .rg{position:relative;width:84px;height:84px;margin:0 auto 26px}" +
      ".arqp .rg i{position:absolute;inset:0;border-radius:50%;" +
      "background:conic-gradient(from 0deg,rgba(201,204,209,0),#fff 60%,#c9ccd1 100%);" +
      "-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));" +
      "mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));" +
      "animation:arqpS 1s linear infinite}" +
      ".arqp .rg u{position:absolute;inset:14px;border-radius:50%;border:1px solid rgba(201,204,209,.28);" +
      "animation:arqpP 1.8s ease-in-out infinite}" +
      ".arqp .rg b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;" +
      "letter-spacing:.02em;background:linear-gradient(135deg,#fff,#8a8e96);-webkit-background-clip:text;background-clip:text;" +
      "-webkit-text-fill-color:transparent;color:transparent}" +
      ".arqp h3{margin:0 0 8px;font-size:20px;font-weight:700;letter-spacing:-.01em}" +
      ".arqp p{margin:0;font-size:14px;line-height:1.45;color:var(--muted,rgba(244,245,247,.58))}" +
      ".arqp .br{height:3px;border-radius:3px;margin:22px auto 0;width:180px;overflow:hidden;background:rgba(201,204,209,.16)}" +
      ".arqp .br span{display:block;height:100%;width:40%;border-radius:3px;" +
      "background:linear-gradient(90deg,transparent,#fff,transparent);animation:arqpB 1.3s ease-in-out infinite}" +
      "@keyframes arqpS{to{transform:rotate(360deg)}}" +
      "@keyframes arqpP{0%,100%{transform:scale(.92);opacity:.5}50%{transform:scale(1.06);opacity:1}}" +
      "@keyframes arqpB{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}" +
      "@media (prefers-reduced-motion:reduce){.arqp .rg i,.arqp .rg u,.arqp .br span{animation-duration:3s}}";
    document.head.appendChild(s);
  }

  function show() {
    css();
    if (hideT) { clearTimeout(hideT); hideT = null; }
    if (!ov) {
      ov = document.createElement("div");
      ov.className = "arqp";
      ov.setAttribute("role", "status");
      ov.setAttribute("aria-live", "polite");
      ov.innerHTML =
        '<div class="bx"><div class="rg"><i></i><u></u><b>A</b></div>' +
        '<h3 id="arqpT">Обрабатываем платёж</h3>' +
        '<p id="arqpS">Готовим защищённую страницу оплаты. Это займёт пару секунд.</p>' +
        '<div class="br"><span></span></div></div>';
      document.body.appendChild(ov);
    }
    document.getElementById("arqpT").textContent = "Обрабатываем платёж";
    document.getElementById("arqpS").textContent = "Готовим защищённую страницу оплаты. Это займёт пару секунд.";
    ov.style.display = "flex";
    void ov.offsetWidth;
    ov.classList.add("on");
  }

  function hide() {
    if (!ov) return;
    ov.classList.remove("on");
    var o = ov;
    hideT = setTimeout(function () { o.style.display = "none"; }, 300);
  }

  function toBot(tariff) {
    var u = "https://t.me/" + BOT + "?start=buy_" + encodeURIComponent(tariff);
    if (tg && tg.openTelegramLink) { tg.openTelegramLink(u); try { tg.close(); } catch (e) {} }
    else { location.href = u; }
  }

  function go(url) {
    var t = document.getElementById("arqpT"), s = document.getElementById("arqpS");
    if (t) t.textContent = "Переходим к оплате";
    if (s) s.textContent = "Открываем страницу оплаты в браузере.";
    try {
      if (tg && tg.openLink) { tg.openLink(url); }
      else { location.href = url; }
    } catch (e) { location.href = url; }
    setTimeout(hide, 1800);
  }

  window.arqPay = function (tariff) {
    if (busy) return;
    var init = tg && tg.initData ? tg.initData : "";
    if (!init) { toBot(tariff); return; }
    busy = true;
    show();
    var done = false;
    function fail() {
      if (done) return;
      done = true; busy = false;
      hide();
      setTimeout(function () { toBot(tariff); }, 250);
    }
    var timer = setTimeout(fail, LIMIT);
    var ctl = window.AbortController ? new AbortController() : null;
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: init, tariff: tariff }),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (done) return;
      if (d && d.ok && typeof d.url === "string" && /^https:\/\//.test(d.url)) {
        done = true; clearTimeout(timer);
        go(d.url);
        setTimeout(function () { busy = false; }, 2500);
      } else { clearTimeout(timer); fail(); }
    }).catch(function () { clearTimeout(timer); fail(); });
  };
})();
