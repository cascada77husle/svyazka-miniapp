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
  hint.textContent = TRANSLATIONS[currentLang].hint_opening;
  if (tg && tg.openTelegramLink) {
    // Внутри Mini App — открывает чат с ботом и сразу шлёт "/start buy".
    tg.openTelegramLink(START_PAYMENT_URL);
  } else {
    // Открыто не внутри Telegram (например, для отладки в обычном браузере) —
    // обычная навигация на t.me тоже откроет Telegram и запустит бота.
    window.location.href = START_PAYMENT_URL;
  }
});

/* ============================== ЯЗЫК (RU/EN) ==============================
   Переключатель языка (2026-09-29) — чисто клиентский, как и тема оформления
   в трекере (luxmax-tracker): язык не влияет на оплату/бота напрямую, это
   просто витрина сайта, поэтому per-device localStorage-флаг более чем
   достаточен, без завязки на бэкенд.

   Дефолт при первом визите — язык устройства из Telegram (tg.initDataUnsafe.
   user.language_code), если это "ru*" — русский, иначе английский (сайт
   всё равно рассчитан в первую очередь на русскоязычный трафик TikTok/
   Reels, поэтому дефолт "не ru" — именно en, а не гадать по остальным
   кодам языков). Вне Telegram (обычный браузер) — просто "ru".

   Кнопка #lang-toggle переключает язык и полностью перерисовывает текст
   всех элементов с data-i18n / data-i18n-attr через applyLang(). Разметка
   страницы в HTML изначально на русском — это и есть словарь "ru" ниже,
   продублированный, чтобы явно видеть оба варианта рядом при правках. */

const LANG_KEY = "luxmax_site_lang_v1"; const LANG_FEATURE_ENABLED = false; // switcher temporarily disabled — flip to true (and remove the .lang-toggle{display:none} rule in style.css) to re-enable

const TRANSLATIONS = {
  ru: {
    hint_opening: "Открываю оплату в чате с ботом…",
    badge: "51 ДЕНЬ · ПРОТОКОЛ №1",
    hero_h1_line1: "Видимый апгрейд",
    hero_h1_accent: "лица и силуэта",
    subtitle_promise: "Чётче челюсть, острее скулы, меньше отёчности за 51 день по протоколу.",
    live_count: "34 человека уже приобрели курс",
    kicker: "Реальный результат",
    case_days: "51 день по протоколу",
    case_before: "До",
    case_after: "После",
    case_changes_title: "Что изменил",
    case_chip_1: "Режим",
    case_chip_2: "Уход",
    case_chip_3: "Работа с отёчностью",
    case_chip_4: "Укладка",
    case_chip_5: "Ежедневный протокол",
    progress_label_left: "Твой путь",
    progress_label_right: "День 0 / 51",
    audience_title: "Кому подходит",
    audience_1: "Смотришь в зеркало и видишь потенциал, но советы из интернета противоречат друг другу",
    audience_2: "Пробовал упражнения из тиктока, но без системы результат не держится и не виден",
    audience_3: "Хочешь чёткую челюсть, скулы и подтянутое лицо без пластики и голодовок",
    audience_4: "Готов уделять 5–20 минут в день, если знаешь, что это работает на 51-дневной системе",
    program_title: "Программа",
    program_meta: "51 день · 9 систем протокола",
    program_1_title: "Ежедневные задания и практики",
    program_1_text: "Понятный план на каждый из 51 дня: что делать сегодня, без импровизации.",
    program_2_title: "Система упражнений и физических комплексов",
    program_2_text: "Комплексы для лица, шеи, осанки и тела, собранные в систему, а не разрозненные ролики.",
    program_3_title: "Питание и готовые решения на каждый день",
    program_3_text: "Что есть и когда, без подсчёта калорий и жёстких диет.",
    program_4_title: "Трекер привычек, сна, воды и активности",
    program_4_text: "Ежедневные отметки по сну, воде, привычкам и активности в одном месте.",
    program_5_title: "Контроль внешних и физических изменений",
    program_5_text: "Регулярные фото и замеры в одном ракурсе: видишь прогресс, а не гадаешь.",
    program_6_title: "Рекомендации по уходу и восстановлению",
    program_6_text: "Уход за кожей и восстановление: что делать до и после нагрузки.",
    program_7_title: "Аналитика и отслеживание динамики",
    program_7_text: "Сводка по неделям: где растёт прогресс, а где стоит скорректировать темп.",
    program_8_title: "Библиотека материалов и практик",
    program_8_text: "Все техники и материалы протокола в одном месте, доступны в любой день.",
    program_9_title: "Система после завершения протокола",
    program_9_text: "Отдельная программа поддержания результата после 51 дня, а не пустота.",
    age_notice: "От 16 лет. Не заменяет консультацию врача: раздел «Красные флаги» подскажет, когда стоит обратиться к специалисту, а не заниматься самолечением.",
    faq_title: "Частые вопросы (FAQ)",
    faq_1_q: "Это упражнения?",
    faq_1_a: "В основном да: техники для лица, шеи и осанки без инвентаря, плюс уход за кожей и волосами, тренировки тела и питание. Не только «упражнения» в узком смысле, это целостная система на 51 день.",
    faq_2_q: "Сколько времени занимает в день?",
    faq_2_a: "От 5 минут для коротких дней до более полного набора практик, сам выбираешь темп под своё расписание.",
    faq_3_q: "На какой срок доступ?",
    faq_3_a: "Оплата разовая, доступ остаётся навсегда: платишь один раз.",
    faq_4_q: "Что я получу после оплаты?",
    faq_4_a: "Протокол на 51 день открывается прямо в Telegram: ежедневные задания, система упражнений, питание, трекер привычек, контроль изменений, уход и восстановление, аналитика динамики, библиотека материалов и отдельная система после завершения протокола.",
    faq_5_q: "Нужны ли дополнительные продукты?",
    faq_5_a: "Нет, база ничего не требует докупать. Всё, что нужно докупить опционально, отмечено отдельно и никогда не обязательная часть.",
    faq_6_q: "Можно ли проходить со смартфона?",
    faq_6_a: "Да, весь протокол открывается прямо в Telegram, ничего дополнительно устанавливать не нужно.",
    faq_7_q: "Это безопасно?",
    faq_7_a: "Техники подобраны как щадящие: без нагрузки на суставы и зубы. Отдельный раздел «Красные флаги» подскажет, когда лучше остановиться и обратиться к врачу вместо самолечения.",
    faq_8_q: "Через сколько будут заметны изменения?",
    faq_8_a: "По отёчности, осанке и коже обычно быстрее, в течение первых недель. По костной структуре лица (скулы, челюсть) эффект накопительный, для этого в протокол и входит система контроля изменений: сверяешься с собой по фото и замерам каждую неделю, а не «на глаз».",
    pay_alfa: "Альфа-Банк",
    pay_sber: "Сбербанк",
    pay_tbank: "Т-Банк",
    pay_sbp: "СБП",
    pay_crypto: "Крипта",
    buy_button: "Забрать протокол",
    hint: "Оплата в Telegram · доступ навсегда сразу после оплаты",
  },
  en: {
    hint_opening: "Opening payment in the bot chat…",
    badge: "51 DAYS · PROTOCOL #1",
    hero_h1_line1: "A visible upgrade",
    hero_h1_accent: "to your face and physique",
    subtitle_promise: "A sharper jawline, more defined cheekbones, less puffiness in 51 days on the protocol.",
    live_count: "34 people have already bought the course",
    kicker: "Real result",
    case_days: "51 days on the protocol",
    case_before: "Before",
    case_after: "After",
    case_changes_title: "What he changed",
    case_chip_1: "Routine",
    case_chip_2: "Skincare",
    case_chip_3: "Puffiness care",
    case_chip_4: "Styling",
    case_chip_5: "Daily protocol",
    progress_label_left: "Your journey",
    progress_label_right: "Day 0 / 51",
    audience_title: "Who this is for",
    audience_1: "You look in the mirror and see the potential, but advice from the internet keeps contradicting itself",
    audience_2: "You've tried exercises from TikTok, but without a system the result doesn't stick and doesn't show",
    audience_3: "You want a sharper jaw, cheekbones and a tighter-looking face without surgery or starving yourself",
    audience_4: "You're ready to spend 5–20 minutes a day, as long as you know it's working within a 51-day system",
    program_title: "Program",
    program_meta: "51 days · 9 protocol systems",
    program_1_title: "Daily tasks and practices",
    program_1_text: "A clear plan for each of the 51 days: exactly what to do today, no improvising.",
    program_2_title: "A system of exercises and physical routines",
    program_2_text: "Routines for your face, neck, posture and body, put together into a system, not random clips.",
    program_3_title: "Nutrition and ready-made solutions for every day",
    program_3_text: "What to eat and when, no calorie counting and no strict diets.",
    program_4_title: "A tracker for habits, sleep, water and activity",
    program_4_text: "Daily check-ins on sleep, water, habits and activity, all in one place.",
    program_5_title: "Tracking your visible and physical changes",
    program_5_text: "Regular photos and measurements from the same angle: you see progress instead of guessing.",
    program_6_title: "Skincare and recovery recommendations",
    program_6_text: "Skincare and recovery: what to do before and after exertion.",
    program_7_title: "Analytics and progress tracking",
    program_7_text: "A weekly summary: where you're progressing and where to adjust the pace.",
    program_8_title: "A library of materials and practices",
    program_8_text: "All the protocol's techniques and materials in one place, available any day.",
    program_9_title: "A system for after the protocol ends",
    program_9_text: "A separate program for maintaining the result after day 51, not just... nothing.",
    age_notice: "16+. Not a substitute for medical advice: the \"Red flags\" section will tell you when it's time to see a specialist instead of self-treating.",
    faq_title: "Frequently asked questions (FAQ)",
    faq_1_q: "Is this just exercises?",
    faq_1_a: "Mostly, yes: equipment-free techniques for your face, neck and posture, plus skin and hair care, body workouts and nutrition. Not just \"exercises\" in the narrow sense — it's a complete 51-day system.",
    faq_2_q: "How much time does it take per day?",
    faq_2_a: "From 5 minutes on shorter days up to a fuller set of practices — you choose the pace that fits your schedule.",
    faq_3_q: "How long do I have access for?",
    faq_3_a: "It's a one-time payment, access stays forever: you pay once.",
    faq_4_q: "What do I get after paying?",
    faq_4_a: "The 51-day protocol opens right inside Telegram: daily tasks, an exercise system, nutrition, a habit tracker, change tracking, skincare and recovery, progress analytics, a library of materials, and a separate system for after the protocol ends.",
    faq_5_q: "Do I need to buy anything extra?",
    faq_5_a: "No, the base plan doesn't require buying anything extra. Anything optional is marked separately and is never a required part.",
    faq_6_q: "Can I do this from my phone?",
    faq_6_a: "Yes, the entire protocol opens right inside Telegram, nothing extra to install.",
    faq_7_q: "Is it safe?",
    faq_7_a: "The techniques are chosen to be gentle: no strain on joints or teeth. A separate \"Red flags\" section will tell you when it's better to stop and see a doctor instead of self-treating.",
    faq_8_q: "How soon will I notice changes?",
    faq_8_a: "Puffiness, posture and skin usually improve faster, within the first few weeks. For the face's bone structure (cheekbones, jaw) the effect builds up over time — that's exactly why the protocol includes a change-tracking system: you compare yourself against your own photos and measurements every week, instead of guessing \"by eye\".",
    pay_alfa: "Alfa-Bank",
    pay_sber: "Sberbank",
    pay_tbank: "T-Bank",
    pay_sbp: "SBP (Russia fast payments)",
    pay_crypto: "Crypto",
    buy_button: "Get the protocol",
    hint: "Pay in Telegram · lifetime access right after payment",
  },
};

function detectDefaultLang() {
  try {
    const tgLangCode = tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.language_code;
    if (tgLangCode) return tgLangCode.toLowerCase().startsWith("ru") ? "ru" : "en";
  } catch (e) {
    // initDataUnsafe недоступен (например, открыто не в Telegram) — не критично
  }
  return "ru";
}

let currentLang = "ru"; if (LANG_FEATURE_ENABLED) {
try {
  currentLang = localStorage.getItem(LANG_KEY) || detectDefaultLang();
} catch (e) {
  currentLang = detectDefaultLang();
}
if (currentLang !== "ru" && currentLang !== "en") currentLang = "ru"; }

function applyLang(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.ru;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    // формат: "alt:key|title:key2" — несколько атрибутов через "|"
    el.getAttribute("data-i18n-attr").split("|").forEach((pair) => {
      const [attr, key] = pair.split(":");
      if (attr && key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
    });
  });

  hint.textContent = dict.hint;
  document.getElementById("html-root").setAttribute("lang", lang);
  document.getElementById("lang-toggle-label").textContent = lang === "ru" ? "EN" : "RU";
  currentLang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    // приватный режим / заблокировано хранилище — просто не запоминаем выбор
  }
}

document.getElementById("lang-toggle").addEventListener("click", () => {
  if (LANG_FEATURE_ENABLED) applyLang(currentLang === "ru" ? "en" : "ru");
});

applyLang(currentLang);

/* ============================== /ЯЗЫК ============================== */

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
