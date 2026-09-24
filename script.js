// Telegram Web App SDK — кнопка "купить" ведёт на t.me/<bot>?start=buy,
// это открывает чат с ботом и сразу шлёт "/start buy" (тот же механизм,
// что уже используют реферальные ссылки ?start=ref_...). Раньше кнопка
// слала tg.sendData("start_payment") — это оказалось ненадёжно: событие
// web_app_data не всегда долетало до бота. Deep-link надёжнее — работает
// и внутри Mini App, и если страницу открыли просто в браузере.
// Реальную оплату (создание платежа Platega) делает бот-бэкенд,
// Mini App сама по себе не хранит и не видит секретных ключей.

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Страница всегда светлая бежевая (собственный бренд), а не тема
  // пользователя — подгоняем системные панели Telegram под тот же
  // цвет для бесшовного вида.
  try {
    tg.setBackgroundColor("#f4ecdf");
    tg.setHeaderColor("#f4ecdf");
  } catch (e) {
    // старые клиенты Telegram могут не поддерживать эти методы — не критично
  }
  // Запрещаем вертикальный свайп по странице, чтобы Telegram не "оттягивал"
  // Mini App вниз/вверх за пределы контента при скролле от самого верха.
  try {
    tg.disableVerticalSwipes();
  } catch (e) {
    // старые клиенты Telegram могут не поддерживать этот метод — не критично
  }
}

const buyButton = document.getElementById("buy-button");
const hint = document.getElementById("hint");

const START_PAYMENT_URL = "https://t.me/luxmaxguide_bot?start=buy";

buyButton.addEventListener("click", () => {
  hint.textContent = "Открываю оплату в чате с ботом…";
  if (tg && tg.openTelegramLink) {
    // Внутри Mini App — открывает чат с ботом и сразу шлёт "/start buy".
    tg.openTelegramLink(START_PAYMENT_URL);
  } else {
    // Открыто не внутри Telegram (например, для отладки в обычном браузере) —
    // обычная навигация на t.me тоже откроет Telegram и запустит бота.
    window.location.href = START_PAYMENT_URL;
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
