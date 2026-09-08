// Telegram Web App SDK — сообщает боту, что пользователь нажал "купить".
// Реальную оплату (создание платежа ЮKassa) делает бот-бэкенд (bot/main.py),
// Mini App сама по себе не хранит и не видит секретных ключей.

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Страница всегда тёмная (собственный бренд), а не тема пользователя —
  // подгоняем системные панели Telegram под тот же цвет для бесшовного вида.
  try {
    tg.setBackgroundColor("#0a0a12");
    tg.setHeaderColor("#0a0a12");
  } catch (e) {
    // старые клиенты Telegram могут не поддерживать эти методы — не критично
  }
}

const buyButton = document.getElementById("buy-button");
const hint = document.getElementById("hint");

buyButton.addEventListener("click", () => {
  if (tg && tg.sendData) {
    tg.sendData("start_payment");
    hint.textContent = "Открываю оплату в чате с ботом…";
    setTimeout(() => tg.close(), 600);
  } else {
    // Открыто не внутри Telegram (например, для отладки в обычном браузере)
    hint.textContent = "Открой это через кнопку в боте в Telegram, чтобы оплата сработала.";
  }
});

// Плавное открытие/закрытие <details> ("Программа", вопросы FAQ) —
// нативно details/summary переключаются мгновенно (display: none ⇄ block),
// анимировать это transition'ом нельзя. Вместо этого анимируем саму высоту
// элемента через Web Animations API (element.animate) — поддерживается
// везде, где может открыться Mini App (iOS/Android/десктоп Telegram).
function setupSmoothDetails(details) {
  const summary = details.querySelector("summary");
  const content = summary && summary.nextElementSibling;
  if (!summary || !content) return;

  const DURATION = 380;
  const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
  let animation = null;

  summary.addEventListener("click", (e) => {
    e.preventDefault();
    if (animation) animation.cancel();

    if (details.open) {
      collapse();
    } else {
      expand();
    }
  });

  function expand() {
    details.classList.add("is-open");
    const startHeight = details.offsetHeight;
    details.open = true;
    const endHeight = summary.offsetHeight + content.offsetHeight;
    details.style.overflow = "hidden";
    animation = details.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: DURATION, easing: EASING }
    );
    content.animate({ opacity: [0, 1] }, { duration: DURATION * 0.8, easing: "ease" });
    animation.onfinish = () => {
      details.style.height = "";
      details.style.overflow = "";
      animation = null;
    };
  }

  function collapse() {
    details.classList.remove("is-open");
    const startHeight = details.offsetHeight;
    const endHeight = summary.offsetHeight;
    details.style.overflow = "hidden";
    animation = details.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: DURATION, easing: EASING }
    );
    content.animate({ opacity: [1, 0] }, { duration: DURATION * 0.6, easing: "ease" });
    animation.onfinish = () => {
      details.open = false;
      details.style.height = "";
      details.style.overflow = "";
      animation = null;
    };
  }
}

document.querySelectorAll(".program-list, .faq-item").forEach(setupSmoothDetails);
