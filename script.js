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

// Карточки "Что внутри" — прижал пальцем/мышкой, лента останавливается,
// отпустил — едет дальше. :hover не срабатывает на телефонах, поэтому
// ставим паузу вручную через touch/mouse события на каждой ленте отдельно.
document.querySelectorAll(".carousel-track").forEach((track) => {
  const pause = () => track.classList.add("is-paused");
  const resume = () => track.classList.remove("is-paused");

  track.addEventListener("touchstart", pause, { passive: true });
  track.addEventListener("touchend", resume);
  track.addEventListener("touchcancel", resume);

  track.addEventListener("mousedown", pause);
  track.addEventListener("mouseup", resume);
  track.addEventListener("mouseleave", resume);
});
