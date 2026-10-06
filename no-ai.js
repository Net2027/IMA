/* سرویس‌های وابسته به بک‌اند و قابلیت‌های هوش مصنوعی فعلاً غیرفعال هستند.
   هر تلاش برای استفاده از آن‌ها، پیام «این سرویس بنا به دلایلی موقتا غیرفعال شده است.» نشان می‌دهد. */
(function () {
  var MSG = "این سرویس بنا به دلایلی موقتا غیرفعال شده است.";
  var BLOCKED = /(localhost|127\.0\.0\.1):8000|gapgpt\.app|openrouter\.ai|api\.openai\.com|api\.anthropic\.com|ai-platform\.html/i;

  // ---------- پیام ----------
  var lastShown = 0;
  function showServiceDisabled() {
    var now = Date.now();
    if (now - lastShown < 1500) return;
    lastShown = now;
    var box = document.createElement("div");
    box.setAttribute("dir", "rtl");
    box.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;" +
      "background:#1f2937;color:#fff;padding:14px 22px;border-radius:12px;font-size:15px;font-weight:600;" +
      "font-family:Vazirmatn,Tahoma,sans-serif;box-shadow:0 10px 25px rgba(0,0,0,.3);max-width:90vw;text-align:center;";
    box.textContent = "⚠️ " + MSG;
    (document.body || document.documentElement).appendChild(box);
    setTimeout(function () { box.remove(); }, 3000);
  }
  window.showServiceDisabled = showServiceDisabled;

  // ---------- درخواست‌های شبکه ----------
  var realFetch = window.fetch;
  window.fetch = function (input) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (BLOCKED.test(url)) {
      showServiceDisabled();
      return Promise.resolve(new Response(JSON.stringify({ detail: MSG, error: MSG }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      }));
    }
    return realFetch.apply(this, arguments);
  };

  var realOpen = window.open;
  window.open = function (url) {
    if (BLOCKED.test(String(url || ""))) { showServiceDisabled(); return null; }
    return realOpen.apply(this, arguments);
  };

  // ---------- بنر بالای بخش‌های غیرفعال ----------
  var DISABLED_TABS = ["tab-ai", "tab-avatar", "tab-equation", "tab-algebra",
                       "tab-chat", "tab-lesson-plan", "tab-ai-generator", "tab-bank", "tab-export"];

  document.addEventListener("DOMContentLoaded", function () {
    DISABLED_TABS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var banner = document.createElement("div");
      banner.setAttribute("dir", "rtl");
      banner.style.cssText = "background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:10px;" +
        "padding:12px 16px;margin:0 0 16px;font-weight:700;text-align:center;font-family:inherit;";
      banner.textContent = "⚠️ " + MSG;
      el.insertBefore(banner, el.firstChild);
    });

    // لانچرهای صفحه‌ی هوش مصنوعی / آواتار
    window.openDedicatedAIPage = showServiceDisabled;
    window.openAvatarPage = showServiceDisabled;
  });

  // کارت مسابقه با موضوع دلخواه (هوش مصنوعی)
  document.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest('[onclick*="openAITopicModal"]');
    if (card) { e.stopPropagation(); e.preventDefault(); showServiceDisabled(); }
  }, true);
})();
