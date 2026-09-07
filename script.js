// Telegram Web App SDK — сообщает боту, что пользователь нажал "купить".
// Реальную оплату (создание платежа ЮKassa) делает бот-бэкенд (bot/main.py),
// Mini App сама по себе не хранит и не видит секретных ключей.

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
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
