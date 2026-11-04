/*
 * 垃圾分類小達人｜p5.js 拖曳題測驗系統
 * ------------------------------------------------------------------
 * 使用方式：將本檔案內容放入既有 p5.js 專案的 sketch.js 即可執行。
 * 本程式只使用 p5.js 畫布繪圖與滑鼠／觸控事件，不建立任何 HTML DOM 按鈕。
 */

// ------------------------------
// 【全域遊戲資料】
// ------------------------------

// 宣告六個垃圾桶的資料陣列，所有畫面與答案都從這裡讀取。
let bins = [];

// 宣告六個可拖曳垃圾選項的資料陣列。
let trashItems = [];

// 每一輪固定顯示六個不同的垃圾項目。
const ROUND_ITEM_COUNT = 6;

// 台灣常見垃圾分類題庫；targetBin 對應 bins 陣列中的分類索引。
// 實際回收規定可能因地方政府、清潔隊與回收標誌而略有不同。
const TRASH_QUESTION_BANK = [
  { name: '用過衛生紙', bopomofo: 'ㄩㄥˋ ㄍㄨㄛˋ ㄨㄟˋ ㄕㄥ ㄓˇ', icon: '🧻', targetBin: 0 },
  { name: '口罩', bopomofo: 'ㄎㄡˇ ㄓㄠˋ', icon: '😷', targetBin: 0 },
  { name: '牙籤', bopomofo: 'ㄧㄚˊ ㄑㄧㄢ', icon: '🪥', targetBin: 0 },
  { name: '髒污塑膠袋', bopomofo: 'ㄗㄤ ㄨ ㄙㄨˋ ㄐㄧㄠ ㄉㄞˋ', icon: '🛍️', targetBin: 0 },
  { name: '乾淨寶特瓶', bopomofo: 'ㄍㄢ ㄐㄧㄥˋ ㄅㄠˇ ㄊㄜˋ ㄆㄧㄥˊ', icon: '🧴', targetBin: 1 },
  { name: '紙箱', bopomofo: 'ㄓˇ ㄒㄧㄤ', icon: '📦', targetBin: 1 },
  { name: '鋁罐', bopomofo: 'ㄌㄩˇ ㄍㄨㄢˋ', icon: '🥫', targetBin: 1 },
  { name: '鐵罐', bopomofo: 'ㄊㄧㄝˇ ㄍㄨㄢˋ', icon: '🥫', targetBin: 1 },
  { name: '燈泡', bopomofo: 'ㄉㄥ ㄆㄠˋ', icon: '💡', targetBin: 1 },
  { name: '果皮', bopomofo: 'ㄍㄨㄛˇ ㄆㄧˊ', icon: '🍌', targetBin: 2 },
  { name: '剩菜', bopomofo: 'ㄕㄥˋ ㄘㄞˋ', icon: '🍱', targetBin: 2 },
  { name: '茶葉渣', bopomofo: 'ㄔㄚˊ ㄧㄝˋ ㄓㄚ', icon: '🍵', targetBin: 2 },
  { name: '玻璃瓶', bopomofo: 'ㄅㄛ ㄌㄧˊ ㄆㄧㄥˊ', icon: '🍾', targetBin: 3 },
  { name: '玻璃罐', bopomofo: 'ㄅㄛ ㄌㄧˊ ㄍㄨㄢˋ', icon: '🫙', targetBin: 3 },
  { name: '用過乾電池', bopomofo: 'ㄩㄥˋ ㄍㄨㄛˋ ㄍㄢ ㄉㄧㄢˋ ㄔˊ', icon: '🔋', targetBin: 4 },
  { name: '充電電池', bopomofo: 'ㄔㄨㄥ ㄉㄧㄢˋ ㄉㄧㄢˋ ㄔˊ', icon: '🔋', targetBin: 4 },
  { name: '舊手機', bopomofo: 'ㄐㄧㄡˋ ㄕㄡˇ ㄐㄧ', icon: '📱', targetBin: 5 },
  { name: '耳機', bopomofo: 'ㄦˇ ㄐㄧ', icon: '🎧', targetBin: 5 },
  { name: '電腦滑鼠', bopomofo: 'ㄉㄧㄢˋ ㄋㄠˇ ㄏㄨㄚˊ ㄕㄨˇ', icon: '🖱️', targetBin: 5 },
  { name: '鍵盤', bopomofo: 'ㄐㄧㄢˋ ㄆㄢˊ', icon: '⌨️', targetBin: 5 },
  { name: '數位相機', bopomofo: 'ㄕㄨˋ ㄨㄟˋ ㄒㄧㄤˋ ㄐㄧ', icon: '📷', targetBin: 5 },
  { name: '小型電風扇', bopomofo: 'ㄒㄧㄠˇ ㄒㄧㄥˊ ㄉㄧㄢˋ ㄈㄥ ㄕㄢˋ', icon: '🌀', targetBin: 5 }
];

// 宣告可供未來放入真實圖片的圖片資產物件，預設全部使用 null。
const imageAssets = {
  general: null,
  recycle: null,
  food: null,
  glass: null,
  battery: null,
  electronic: null
};

// 記錄目前是否正在拖曳某一個垃圾選項。
let draggingItem = null;

// 記錄手指或滑鼠按下位置與垃圾卡片中心的偏移量，避免拖曳時突然跳動。
let dragOffsetX = 0;
let dragOffsetY = 0;

// 記錄目前是否有滑鼠或觸控指標正在操作。
let pointerIsDown = false;

// 記錄目前是否已經送出成績。
let submitted = false;

// 記錄使用者目前看到的提示文字。
let feedbackMessage = '請把下方垃圾拖到正確的垃圾桶！';

// 記錄提示文字的顏色。
let feedbackColor;

// 記錄提示文字要顯示到什麼時間，使用 millis() 判斷。
let feedbackUntil = 0;

// 記錄重新開始按鈕的矩形範圍。
let restartButton = { x: 0, y: 0, w: 0, h: 0 };

// 記錄交卷按鈕的矩形範圍。
let submitButton = { x: 0, y: 0, w: 0, h: 0 };

// 記錄成績面板內「再玩一次」按鈕的矩形範圍。
let resultRestartButton = { x: 0, y: 0, w: 0, h: 0 };

// 儲存彩帶粒子的陣列。
let confetti = [];

// 紀錄是否已經建立過彩帶，避免每一幀重複建立。
let confettiCreated = false;

// ------------------------------
// 【未來換成真實圖片的位置】
// ------------------------------

// 若要使用真實圖片，可以在此取消註解，並依照實際檔案路徑修改。
// 注意：使用真實圖片時，圖片檔案要放在 p5.js 專案可讀取的資料夾內。
//
// function preload() {
//   imageAssets.general = loadImage('images/general.png');
//   imageAssets.recycle = loadImage('images/recycle.png');
//   imageAssets.food = loadImage('images/food.png');
//   imageAssets.glass = loadImage('images/glass.png');
//   imageAssets.battery = loadImage('images/battery.png');
//   imageAssets.electronic = loadImage('images/electronic.png');
// }
//
// 完成上面的設定後，程式會優先繪製 imageAssets 中的圖片；
// 如果圖片仍然是 null，就會自動使用下方資料中的 emoji 圖示。

// ------------------------------
// 【p5.js 初始化函式】
// ------------------------------

// setup() 只會在程式開始時執行一次，負責建立畫布與初始化遊戲資料。
function setup() {
  // 建立跟瀏覽器視窗一樣大的 p5.js 畫布。
  createCanvas(windowWidth, windowHeight);

  // 設定畫布的繪圖模式，讓圖形位置使用中心點會更容易計算。
  rectMode(CENTER);
  imageMode(CENTER);

  // 設定文字使用置中對齊，讓中文標題與卡片文字排列整齊。
  textAlign(CENTER, CENTER);

  // 設定初始提示文字顏色。
  feedbackColor = color('#2563EB');

  // 建立垃圾桶與垃圾選項的資料。
  createGameData();

  // 依照目前視窗大小計算所有元件位置。
  calculateLayout();

  // 讓畫布持續重繪，以便更新動畫與彩帶效果。
  loop();
}

// ------------------------------
// 【建立遊戲資料】
// ------------------------------

// createGameData() 建立六個垃圾桶，並從完整題庫隨機抽出六個不同選項。
function createGameData() {
  // 建立六個垃圾桶，targetBin 會與垃圾題目的 targetBin 對應。
  bins = [
    {
      id: 'general',
      name: '一般垃圾',
      bopomofo: 'ㄧ ㄅㄢ ㄌㄜˋ ㄙㄜˋ',
      icon: '🗑️',
      color: '#64748B',
      lightColor: '#E2E8F0',
      image: imageAssets.general
    },
    {
      id: 'recycle',
      name: '資源回收',
      bopomofo: 'ㄗ ㄩㄢˊ ㄏㄨㄟˊ ㄕㄡ',
      icon: '♻️',
      color: '#16A34A',
      lightColor: '#DCFCE7',
      image: imageAssets.recycle
    },
    {
      id: 'food',
      name: '廚餘',
      bopomofo: 'ㄔㄨˊ ㄩˊ',
      icon: '🍎',
      color: '#EA580C',
      lightColor: '#FFEDD5',
      image: imageAssets.food
    },
    {
      id: 'glass',
      name: '玻璃容器',
      bopomofo: 'ㄅㄛ ㄌㄧˊ ㄖㄨㄥˊ ㄑㄧˋ',
      icon: '🍾',
      color: '#0891B2',
      lightColor: '#CFFAFE',
      image: imageAssets.glass
    },
    {
      id: 'battery',
      name: '廢乾電池',
      bopomofo: 'ㄈㄟˋ ㄍㄢ ㄉㄧㄢˋ ㄔˊ',
      icon: '🔋',
      color: '#7C3AED',
      lightColor: '#EDE9FE',
      image: imageAssets.battery
    },
    {
      id: 'electronic',
      name: '廢電子電器',
      bopomofo: 'ㄈㄟˋ ㄉㄧㄢˋ ㄗˇ ㄉㄧㄢˋ ㄑㄧˋ',
      icon: '📱',
      color: '#DB2777',
      lightColor: '#FCE7F3',
      image: imageAssets.electronic
    }
  ];

  // 複製完整題庫後洗牌，再取前六筆，確保每輪六題且不會重複。
  const selectedQuestions = shuffle(TRASH_QUESTION_BANK.slice()).slice(0, ROUND_ITEM_COUNT);
  trashItems = selectedQuestions.map((question) => ({
    name: question.name,
    bopomofo: question.bopomofo,
    icon: question.icon,
    targetBin: question.targetBin,
    image: null,
    answered: false,
    correct: false,
    completed: false
  }));

  // 將按鈕、拖曳狀態與彩帶狀態恢復成遊戲初始值。
  submitted = false;
  draggingItem = null;
  pointerIsDown = false;
  confetti = [];
  confettiCreated = false;
  feedbackMessage = '本輪已隨機抽出六題，請把垃圾拖到正確的垃圾桶！';
  feedbackColor = color('#2563EB');
  feedbackUntil = millis() + 2600;
}

// ------------------------------
// 【響應式版面配置】
// ------------------------------

// calculateLayout() 會根據畫布寬高重新安排垃圾桶、卡片與按鈕的位置。
function calculateLayout() {
  // 依照畫布寬度設定左右留白，手機與桌面都保留安全邊界。
  const margin = constrain(width * 0.025, 12, 30);

  // 寬螢幕一排六桶；窄螢幕採三欄兩列，避免分類名稱太擁擠。
  const binColumns = width >= 820 ? 6 : 3;

  // 依畫布大小調整垃圾桶間距。
  const binGap = width >= 820 ? 12 : 8;

  // 計算垃圾桶寬度，確保六個垃圾桶不會超出畫布。
  const binWidth = (width - margin * 2 - binGap * (binColumns - 1)) / binColumns;

  // 放大垃圾桶高度，為分類名稱與注音保留上下兩行空間。
  const binHeight = width >= 820
    ? constrain(height * 0.20, 128, 174)
    : constrain(height * 0.145, 92, 124);

  // 預留標題與提醒文字的上方區域，避免垃圾桶壓到標題。
  const binStartY = width < 560 ? 132 : 122;

  // 逐一計算六個垃圾桶的位置與碰撞尺寸。
  bins.forEach((bin, index) => {
    // 計算垃圾桶所在的列與欄。
    const row = floor(index / binColumns);
    const column = index % binColumns;

    // 計算垃圾桶中心位置。
    bin.x = margin + binWidth / 2 + column * (binWidth + binGap);
    bin.y = binStartY + binHeight / 2 + row * (binHeight + binGap);

    // 儲存垃圾桶尺寸，供繪圖與拖曳碰撞判斷使用。
    bin.w = binWidth;
    bin.h = binHeight;
  });

  // 取得最後一個垃圾桶的底部，作為題目區的起始參考。
  const lastBin = bins[bins.length - 1];
  const binBottom = lastBin.y + lastBin.h / 2;

  // 題目標題與垃圾桶之間保留更清楚的間隔。
  const itemTitleY = max(binBottom + 34, height * 0.47);

  // 窄手機使用三欄兩列以保留卡片高度；中型畫布使用兩欄三列。
  const itemColumns = width >= 760 || width < 440 ? 3 : 2;

  // 依畫布尺寸設定卡片間隔。
  const itemGap = width >= 760 ? 14 : 10;

  // 計算每張垃圾卡片的寬度。
  const itemWidth = (width - margin * 2 - itemGap * (itemColumns - 1)) / itemColumns;

  // 計算六題需要幾列卡片。
  const itemRows = ceil(ROUND_ITEM_COUNT / itemColumns);

  // 扣除標題、按鈕與列間距後，計算每張卡片可用的高度。
  const availableItemHeight = height - itemTitleY - 92 - itemGap * (itemRows - 1);
  const minimumCardHeight = width < 440 ? 88 : 96;
  const itemHeight = max(minimumCardHeight, min(availableItemHeight / itemRows, 172));

  // 將六個隨機題目排入卡片網格。
  trashItems.forEach((item, index) => {
    // 計算垃圾卡片所在列與欄。
    const row = floor(index / itemColumns);
    const column = index % itemColumns;

    // 計算垃圾卡片的原始位置。
    item.startX = margin + itemWidth / 2 + column * (itemWidth + itemGap);
    item.startY = itemTitleY + 46 + itemHeight / 2 + row * (itemHeight + itemGap);

    // 記錄卡片尺寸，供繪圖與拖曳碰撞判斷使用。
    item.w = itemWidth;
    item.h = itemHeight;

    // 已完成題目吸附在正確垃圾桶；其他題目回到卡片原位。
    if (item.completed) {
      item.x = bins[item.targetBin].x;
      item.y = bins[item.targetBin].y;
    } else if (draggingItem !== item) {
      item.x = item.startX;
      item.y = item.startY;
    }
  });
}

// ------------------------------
// 【主繪圖迴圈】
// ------------------------------

// draw() 每一幀執行一次，負責畫出整個遊戲畫面與動畫。
function draw() {
  // 先畫出柔和的背景色。
  background('#F8FAFC');

  // 畫出上方標題、說明文字與重新開始按鈕。
  drawHeader();

  // 畫出六個垃圾桶。
  bins.forEach((bin) => drawBin(bin));

  // 畫出「請拖曳垃圾」的小標題。
  drawItemsTitle();

  // 畫出本輪隨機抽出的六個垃圾選項卡片。
  trashItems.forEach((item) => {
    // 已吸附的卡片畫在垃圾桶內，未完成卡片畫在下方選項區。
    if (item.completed) {
      drawTrashCard(item, item.x, item.y, true);
    } else {
      drawTrashCard(item, item.x, item.y, false);
    }
  });

  // 如果所有選項至少都操作過一次，才顯示交卷按鈕。
  if (!submitted && allItemsAnswered()) {
    drawSubmitButton();
  }

  // 顯示目前的提示訊息。
  drawFeedback();

  // 如果已經交卷，顯示成績面板。
  if (submitted) {
    drawResultPanel();
  }

  // 成績達到 80% 以上時更新並畫出彩帶效果。
  if (submitted && getScorePercentage() >= 80) {
    updateConfetti();
    drawConfetti();
  }
}

// ------------------------------
// 【標題與一般介面】
// ------------------------------

// drawHeader() 繪製主標題、操作說明與右上角重新開始按鈕。
function drawHeader() {
  // 先依畫布寬度設定重新開始按鈕大小，避免按鈕與標題重疊。
  restartButton.w = width < 560 ? 104 : 128;
  restartButton.h = width < 560 ? 40 : 44;
  restartButton.x = width - restartButton.w / 2 - 14;
  restartButton.y = width < 560 ? 26 : 29;

  // 畫出右上角重新開始按鈕。
  drawCanvasButton(restartButton, '重新開始', '#E0F2FE', '#0369A1');

  // 手機將標題置於按鈕左側可用區域，桌面則維持畫布正中央。
  const headerCenterX = width < 560
    ? (width - restartButton.w - 18) / 2
    : width / 2;

  // 使用較大的響應式標題字體，並限制最大值避免窄畫布溢出。
  fill('#0F172A');
  textSize(constrain(width * 0.075, 26, 40));
  text('垃圾分類小達人', headerCenterX, 31);

  // 使用較大的響應式副標題，讓操作方式更容易閱讀。
  fill('#475569');
  textSize(constrain(width * 0.038, 14, 19));
  text('把每一件垃圾拖到正確的垃圾桶吧！', headerCenterX, 66);

  // 顯示台灣垃圾分類的提醒文字，窄畫布使用換行避免超出畫面。
  fill('#92400E');
  textSize(constrain(width * 0.029, 11, 14));
  textLeading(constrain(width * 0.034, 14, 17));
  const sortingReminder = width < 560
    ? `提醒：分類方式可能依地方政府與回收標誌不同。
玻璃容器請小心；電池與電子產品不可丟一般垃圾。`
    : '提醒：實際回收方式可能依地方政府、清潔隊與回收標誌而不同；玻璃容器請小心處理，電池與電子產品不可丟一般垃圾。';
  text(sortingReminder, width / 2, width < 560 ? 98 : 94);
  textLeading(16);
}

// drawItemsTitle() 繪製下方垃圾選項區的標題。
function drawItemsTitle() {
  // 取得垃圾桶底部位置，避免不同螢幕尺寸互相重疊。
  const lastBin = bins[bins.length - 1];
  const titleY = max(lastBin.y + lastBin.h / 2 + 23, height * 0.46 - 11);

  // 設定小標題樣式。
  fill('#1E293B');
  textSize(constrain(width * 0.052, 20, 27));

  // 繪製選項區標題。
  text('待分類垃圾', width / 2, titleY);
}

// drawCanvasButton() 畫出完全位於 p5.js 畫布內的按鈕。
function drawCanvasButton(button, label, backgroundColor, textColor) {
  // 移除按鈕外框線，改用陰影和圓角呈現立體感。
  noStroke();

  // 先畫出按鈕陰影。
  fill(0, 0, 0, 25);
  rect(button.x, button.y + 3, button.w, button.h, 12);

  // 畫出按鈕本體。
  fill(backgroundColor);
  rect(button.x, button.y, button.w, button.h, 12);

  // 畫出按鈕文字。
  fill(textColor);
  textSize(constrain(button.h * 0.39, 15, 21));
  text(label, button.x, button.y);
}

// ------------------------------
// 【垃圾桶與垃圾卡片繪圖】
// ------------------------------

// drawBin() 畫出單一垃圾桶，包含圖示、名稱與已完成勾勾。
function drawBin(bin) {
  // 判斷這個垃圾桶是否已經接到至少一個正確答案。
  const hasCorrectItem = trashItems.some((item) => item.completed && item.targetBin === bins.indexOf(bin));

  // 畫出垃圾桶陰影與淡色背景。
  noStroke();
  fill(15, 23, 42, 24);
  rect(bin.x, bin.y + 5, bin.w - 4, bin.h, 16);
  fill(bin.lightColor);
  rect(bin.x, bin.y, bin.w - 4, bin.h, 16);

  // 畫出垃圾桶上蓋與桶身，保留原本的分類視覺辨識。
  fill(bin.color);
  rect(bin.x, bin.y - bin.h * 0.31, bin.w * 0.62, 8, 5);
  rect(bin.x, bin.y + bin.h * 0.06, bin.w * 0.40, bin.h * 0.43, 8);

  // 有真實圖片時優先使用圖片，否則使用 emoji 圖示。
  if (bin.image) {
    // 【真實圖片替換區】圖片載入後會在此繪製分類桶圖片。
    image(bin.image, bin.x, bin.y - bin.h * 0.04, bin.w * 0.24, bin.w * 0.24);
  } else {
    // 沒有圖片時以 emoji 表示垃圾桶類型。
    textSize(constrain(bin.w * 0.22, 26, 46));
    text(bin.icon, bin.x, bin.y - bin.h * 0.05);
  }

  // 分類名稱使用較大的響應式字體，並保留注音的顯示空間。
  fill('#0F172A');
  textSize(constrain(bin.w * 0.13, 13, 20));
  text(bin.name, bin.x, bin.y + bin.h * 0.34);

  // 在分類名稱下方顯示繁體中文注音。
  fill('#334155');
  textSize(constrain(bin.w * 0.072, 9, 13));
  text(bin.bopomofo, bin.x, bin.y + bin.h * 0.46);

  // 正確接到垃圾後顯示綠色勾勾。
  if (hasCorrectItem) {
    // 畫出勾勾圓形背景。
    fill('#16A34A');
    circle(bin.x + bin.w * 0.36, bin.y - bin.h * 0.31, constrain(bin.w * 0.16, 22, 29));

    // 畫出白色勾勾。
    fill('#FFFFFF');
    textSize(constrain(bin.w * 0.11, 15, 20));
    text('✓', bin.x + bin.w * 0.36, bin.y - bin.h * 0.31 - 1);
  }
}

// drawTrashCard() 畫出下方垃圾選項或吸附在垃圾桶內的已完成卡片。
function drawTrashCard(item, x, y, compact) {
  // 吸附到垃圾桶時縮小卡片，但仍保留垃圾名稱與注音。
  const cardWidth = compact ? bins[item.targetBin].w * 0.76 : item.w;
  const cardHeight = compact ? max(bins[item.targetBin].h * 0.42, 48) : item.h;

  // 拖曳中的卡片使用藍色外框提供清楚的操作回饋。
  const isDragging = draggingItem === item;

  // 畫出卡片陰影與本體。
  noStroke();
  fill(15, 23, 42, isDragging ? 42 : 22);
  rect(x, y + 5, cardWidth - 2, cardHeight, 15);
  fill(isDragging ? '#DBEAFE' : '#FFFFFF');
  rect(x, y, cardWidth - 2, cardHeight, 15);

  // 拖曳時加上藍色外框，讓目前選取的題目更明顯。
  if (isDragging) {
    noFill();
    stroke('#2563EB');
    strokeWeight(3);
    rect(x, y, cardWidth - 2, cardHeight, 15);
    noStroke();
  }

  // 根據卡片高度設定圖示大小，避免放大文字後互相重疊。
  const iconSize = compact
    ? constrain(cardHeight * 0.40, 20, 34)
    : constrain(cardHeight * 0.30, 28, 52);

  // 有真實圖片時使用圖片，沒有圖片時使用 emoji。
  if (item.image) {
    // 【真實圖片替換區】將 item.image 指定為 loadImage() 結果即可使用。
    image(item.image, x, y - cardHeight * 0.27, iconSize * 1.25, iconSize * 1.25);
  } else {
    // 使用 emoji 顯示垃圾項目，避免缺少外部圖片資產。
    textSize(iconSize);
    text(item.icon, x, y - cardHeight * 0.27);
  }

  // 垃圾名稱放在圖示下方，使用能容納卡片寬度的較大字體。
  fill('#1E293B');
  const nameSize = compact
    ? constrain(cardWidth * 0.095, 10, 14)
    : constrain(min(cardWidth * 0.115, cardHeight * 0.14), 13, 21);
  textSize(nameSize);
  text(item.name, x, y + cardHeight * 0.04);

  // 在垃圾名稱下方顯示每一題的繁體中文注音。
  fill('#475569');
  const bopomofoSize = compact
    ? constrain(cardWidth * 0.065, 8, 10)
    : constrain(min(cardWidth * 0.078, cardHeight * 0.095), 9, 15);
  textSize(bopomofoSize);
  text(item.bopomofo, x, y + cardHeight * 0.23);

  // 正常卡片底部顯示拖曳提示；吸附卡片省略提示以保持簡潔。
  if (!compact) {
    fill('#64748B');
    textSize(constrain(cardHeight * 0.095, 11, 15));
    text('拖曳我', x, y + cardHeight * 0.41);
  }
}

// ------------------------------
// 【提示、按鈕與成績】
// ------------------------------

// drawFeedback() 顯示正確、錯誤或一般操作提示。
function drawFeedback() {
  // 只有在提示尚未過期時才繪製提示框。
  if (millis() > feedbackUntil && !submitted) {
    return;
  }

  // 設定提示框尺寸與位置。
  const feedbackWidth = min(width - 30, 440);
  const feedbackHeight = width < 560 ? 44 : 48;
  const feedbackY = height - 116;

  // 畫出提示框的半透明背景。
  noStroke();
  fill(255, 255, 255, 235);
  rect(width / 2, feedbackY, feedbackWidth, feedbackHeight, 12);

  // 畫出提示文字。
  fill(feedbackColor);
  textSize(constrain(width * 0.040, 14, 18));
  text(feedbackMessage, width / 2, feedbackY);
}

// drawSubmitButton() 顯示畫布內的交卷按鈕。
function drawSubmitButton() {
  // 設定交卷按鈕尺寸與位置。
  submitButton.w = min(260, width - 40);
  submitButton.h = width < 560 ? 54 : 58;
  submitButton.x = width / 2;
  submitButton.y = height - submitButton.h / 2 - 12;

  // 畫出明顯的紫色交卷按鈕。
  drawCanvasButton(submitButton, '交卷看成績', '#7C3AED', '#FFFFFF');
}

// drawResultPanel() 顯示百分比、答對數與鼓勵文字。
function drawResultPanel() {
  // 畫出半透明遮罩，讓成績面板成為視覺焦點。
  noStroke();
  fill(15, 23, 42, 110);
  rect(width / 2, height / 2, width, height);

  // 設定成績面板尺寸。
  const panelWidth = min(width - 34, 520);
  const panelHeight = min(height - 80, 330);
  const panelY = height / 2;

  // 畫出成績面板陰影。
  fill(15, 23, 42, 35);
  rect(width / 2, panelY + 7, panelWidth, panelHeight, 24);

  // 畫出成績面板本體。
  fill('#FFFFFF');
  rect(width / 2, panelY, panelWidth, panelHeight, 24);

  // 取得百分比和答對題數。
  const percentage = getScorePercentage();
  const correctCount = getCorrectCount();

  // 繪製成績標題。
  fill('#0F172A');
  textSize(constrain(width * 0.078, 27, 36));
  text('測驗結果', width / 2, panelY - panelHeight * 0.34);

  // 繪製百分比成績。
  fill(percentage >= 80 ? '#16A34A' : '#EA580C');
  textSize(constrain(width * 0.145, 48, 68));
  text(`${percentage}%`, width / 2, panelY - panelHeight * 0.10);

  // 繪製答對題數。
  fill('#334155');
  textSize(constrain(width * 0.050, 17, 23));
  text(`答對 ${correctCount} / ${ROUND_ITEM_COUNT} 題`, width / 2, panelY + panelHeight * 0.12);

  // 依照成績顯示不同鼓勵文字。
  fill('#475569');
  textSize(constrain(width * 0.045, 16, 22));
  text(getEncouragement(percentage), width / 2, panelY + panelHeight * 0.25);

  // 計算成績面板內重新開始按鈕的位置，並同步記錄給觸控判斷使用。
  resultRestartButton = {
    x: width / 2,
    y: panelY + panelHeight * 0.39,
    w: min(190, panelWidth - 40),
    h: 44
  };

  // 在成績面板內畫出重新開始按鈕。
  drawCanvasButton(resultRestartButton, '再玩一次', '#E0F2FE', '#0369A1');
}

// getEncouragement() 根據百分比回傳鼓勵文字。
function getEncouragement(percentage) {
  // 成績達到 80% 以上時回傳最積極的鼓勵。
  if (percentage >= 80) {
    return '太厲害了！你是垃圾分類高手！';
  }

  // 成績達到 60% 時鼓勵繼續練習。
  if (percentage >= 60) {
    return '表現不錯，再多練習就會更棒！';
  }

  // 其他成績也給予正向且可行動的回饋。
  return '別灰心，認識垃圾桶後再挑戰一次吧！';
}

// ------------------------------
// 【拖曳與碰撞判斷】
// ------------------------------

// mousePressed() 處理滑鼠按下事件。
function mousePressed() {
  // 交由共用函式處理滑鼠座標，並阻止瀏覽器預設行為。
  beginPointer(mouseX, mouseY);
  return false;
}

// mouseDragged() 處理滑鼠拖曳事件。
function mouseDragged() {
  // 只有確實抓到垃圾卡片時才更新卡片位置。
  if (pointerIsDown) {
    movePointer(mouseX, mouseY);
  }
  return false;
}

// mouseReleased() 處理滑鼠放開事件。
function mouseReleased() {
  // 交由共用函式判斷垃圾卡片是否放到正確垃圾桶。
  endPointer(mouseX, mouseY);
  return false;
}

// touchStarted() 處理觸控開始事件，支援手機和平板。
function touchStarted() {
  // 取得第一根手指的位置。
  const pointer = getTouchPosition();

  // 若目前有有效觸控點，就開始拖曳流程。
  if (pointer) {
    beginPointer(pointer.x, pointer.y);
  }
  return false;
}

// touchMoved() 處理手指移動事件。
function touchMoved() {
  // 取得第一根手指目前的位置。
  const pointer = getTouchPosition();

  // 若目前有有效觸控點，就移動垃圾卡片。
  if (pointer && pointerIsDown) {
    movePointer(pointer.x, pointer.y);
  }
  return false;
}

// touchEnded() 處理手指離開畫布事件。
function touchEnded() {
  // 取得最後一個可用的觸控位置，若無法取得則使用滑鼠座標。
  const pointer = getTouchPosition() || { x: mouseX, y: mouseY };

  // 結束拖曳並判斷答案。
  endPointer(pointer.x, pointer.y);
  return false;
}

// getTouchPosition() 取得 p5.js touches 陣列中的第一根手指座標。
function getTouchPosition() {
  // 若沒有觸控點，回傳 null。
  if (!touches || touches.length === 0) {
    return null;
  }

  // 回傳第一根手指的畫布座標。
  return { x: touches[0].x, y: touches[0].y };
}

// beginPointer() 統一處理滑鼠按下或手指按下的邏輯。
function beginPointer(pointerX, pointerY) {
  // 避免同一個觸控被滑鼠事件和觸控事件重複啟動。
  if (pointerIsDown) {
    return;
  }

  // 先判斷是否點擊右上角重新開始按鈕。
  if (isPointInRect(pointerX, pointerY, restartButton)) {
    resetGame();
    return;
  }

  // 如果成績面板中的再玩一次按鈕被點擊，就重新開始測驗。
  if (submitted && isPointInRect(pointerX, pointerY, resultRestartButton)) {
    resetGame();
    return;
  }

  // 交卷後不再允許拖曳垃圾，避免成績被改動。
  if (submitted) {
    return;
  }

  // 如果交卷按鈕已經出現，判斷是否點擊交卷按鈕。
  if (allItemsAnswered() && isPointInRect(pointerX, pointerY, submitButton)) {
    submitGame();
    return;
  }

  // 從後往前尋找卡片，讓畫面上較上層的卡片優先被抓取。
  for (let index = trashItems.length - 1; index >= 0; index -= 1) {
    // 取得目前檢查的垃圾卡片。
    const item = trashItems[index];

    // 已經吸附到垃圾桶的正確卡片不再允許拖曳。
    if (item.completed) {
      continue;
    }

    // 判斷按下位置是否在垃圾卡片範圍內。
    if (isPointInRect(pointerX, pointerY, getItemRect(item))) {
      // 記錄目前抓到的卡片。
      draggingItem = item;

      // 記錄抓取點相對於卡片中心的偏移量。
      dragOffsetX = pointerX - item.x;
      dragOffsetY = pointerY - item.y;

      // 開始拖曳狀態。
      pointerIsDown = true;

      // 將目前卡片移到陣列最後，繪製時會位於其他卡片上方。
      trashItems.splice(index, 1);
      trashItems.push(item);
      break;
    }
  }
}

// movePointer() 統一處理滑鼠移動或手指移動。
function movePointer(pointerX, pointerY) {
  // 沒有正在拖曳卡片時不做任何事。
  if (!pointerIsDown || !draggingItem) {
    return;
  }

  // 讓卡片中心跟隨指標，但保留使用者原本按下的位置。
  draggingItem.x = pointerX - dragOffsetX;
  draggingItem.y = pointerY - dragOffsetY;
}

// endPointer() 統一處理滑鼠放開或手指離開。
function endPointer(pointerX, pointerY) {
  // 沒有拖曳卡片時只清除指標狀態。
  if (!pointerIsDown || !draggingItem) {
    pointerIsDown = false;
    draggingItem = null;
    return;
  }

  // 取得目前拖曳卡片中心所在的垃圾桶。
  const targetBinIndex = findBinAtPoint(draggingItem.x, draggingItem.y);

  // 記錄目前放下的卡片，之後清除拖曳狀態。
  const releasedItem = draggingItem;
  pointerIsDown = false;
  draggingItem = null;

  // 只要卡片中心在正確垃圾桶內，就判定為答對。
  if (targetBinIndex === releasedItem.targetBin) {
    // 標示此題已作答且答對。
    releasedItem.answered = true;
    releasedItem.correct = true;
    releasedItem.completed = true;

    // 將卡片吸附到正確垃圾桶的中心位置。
    releasedItem.x = bins[releasedItem.targetBin].x;
    releasedItem.y = bins[releasedItem.targetBin].y;

    // 顯示正確提示。
    feedbackMessage = `答對了！${releasedItem.name}應該放到「${bins[releasedItem.targetBin].name}」。`;
    feedbackColor = color('#16A34A');
    feedbackUntil = millis() + 2200;
  } else {
    // 錯誤答案仍算一次已操作，讓使用者可以看到成績並繼續修正。
    releasedItem.answered = true;
    releasedItem.correct = false;
    releasedItem.completed = false;

    // 將錯誤卡片送回原本位置。
    releasedItem.x = releasedItem.startX;
    releasedItem.y = releasedItem.startY;

    // 顯示錯誤提示；若完全沒有放在垃圾桶上，使用一般提醒文字。
    if (targetBinIndex === -1) {
      feedbackMessage = '還沒放進垃圾桶，請再試一次！';
    } else {
      feedbackMessage = `再想一下！${releasedItem.name}不屬於「${bins[targetBinIndex].name}」。`;
    }
    feedbackColor = color('#DC2626');
    feedbackUntil = millis() + 2500;
  }
}

// getItemRect() 回傳垃圾卡片的矩形範圍。
function getItemRect(item) {
  // 回傳中心座標、寬度與高度，供點擊判斷使用。
  return { x: item.x, y: item.y, w: item.w, h: item.h };
}

// findBinAtPoint() 判斷某個中心點是否位於垃圾桶內。
function findBinAtPoint(pointX, pointY) {
  // 逐一檢查每個垃圾桶。
  for (let index = 0; index < bins.length; index += 1) {
    // 如果指標在垃圾桶範圍內，就回傳該垃圾桶索引。
    if (isPointInRect(pointX, pointY, bins[index])) {
      return index;
    }
  }

  // 沒有放在任何垃圾桶內時回傳 -1。
  return -1;
}

// isPointInRect() 判斷一個點是否位於中心座標矩形內。
function isPointInRect(pointX, pointY, rectangle) {
  // 計算矩形的左右邊界。
  const left = rectangle.x - rectangle.w / 2;
  const right = rectangle.x + rectangle.w / 2;

  // 計算矩形的上下邊界。
  const top = rectangle.y - rectangle.h / 2;
  const bottom = rectangle.y + rectangle.h / 2;

  // 只有同時符合水平與垂直範圍才算位於矩形內。
  return pointX >= left && pointX <= right && pointY >= top && pointY <= bottom;
}

// ------------------------------
// 【測驗流程與成績計算】
// ------------------------------

// allItemsAnswered() 判斷本輪六個垃圾選項是否都至少拖曳作答過一次。
function allItemsAnswered() {
  // every() 會在每一個選項 answered 都是 true 時回傳 true。
  return trashItems.length === ROUND_ITEM_COUNT && trashItems.every((item) => item.answered);
}

// getCorrectCount() 計算目前答對的垃圾數量。
function getCorrectCount() {
  // filter() 篩選正確選項，再讀取篩選後的數量。
  return trashItems.filter((item) => item.correct).length;
}

// getScorePercentage() 將答對題數換算為百分比。
function getScorePercentage() {
  // 避免沒有題目時發生除以零錯誤。
  if (trashItems.length !== ROUND_ITEM_COUNT) {
    return 0;
  }

  // 四捨五入成整數百分比，方便成績面板顯示。
  return round((getCorrectCount() / ROUND_ITEM_COUNT) * 100);
}

// submitGame() 執行交卷，鎖定答案並在高分時建立彩帶。
function submitGame() {
  // 只有本輪六題都完成後才能交卷，避免動態題數造成計分錯誤。
  if (submitted || !allItemsAnswered()) {
    return;
  }

  // 設定已交卷狀態，draw() 會改為顯示成績面板。
  submitted = true;

  // 更新交卷後的提示文字。
  feedbackMessage = '測驗完成，這是你的學習成果！';
  feedbackColor = color('#7C3AED');
  feedbackUntil = millis() + 3000;

  // 成績達到 80% 以上時建立彩帶粒子。
  if (getScorePercentage() >= 80 && !confettiCreated) {
    createConfetti();
    confettiCreated = true;
  }
}

// resetGame() 重新建立資料並重新計算版面。
function resetGame() {
  // 重新建立所有題目資料，會一併清除答案與成績。
  createGameData();

  // 依照目前畫布大小重新安排所有元件。
  calculateLayout();
}

// ------------------------------
// 【彩帶效果】
// ------------------------------

// createConfetti() 建立多個具有不同顏色和速度的彩帶粒子。
function createConfetti() {
  // 清空舊彩帶，避免重新測驗時沿用上一局的粒子。
  confetti = [];

  // 使用迴圈建立 150 個彩帶粒子。
  for (let index = 0; index < 150; index += 1) {
    // 將每個粒子的資料放入陣列。
    confetti.push({
      x: random(width),
      y: random(-height, 0),
      size: random(5, 11),
      speedY: random(1.5, 4.5),
      speedX: random(-1.5, 1.5),
      angle: random(TWO_PI),
      spin: random(-0.12, 0.12),
      color: random(['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'])
    });
  }
}

// updateConfetti() 更新彩帶的移動與旋轉。
function updateConfetti() {
  // 逐一更新所有彩帶粒子。
  confetti.forEach((piece) => {
    // 讓彩帶往下掉落。
    piece.y += piece.speedY;

    // 讓彩帶左右輕微飄動。
    piece.x += piece.speedX;

    // 更新彩帶的旋轉角度。
    piece.angle += piece.spin;

    // 彩帶掉出畫布底部後，從上方重新出現。
    if (piece.y > height + 20) {
      piece.y = random(-60, -10);
      piece.x = random(width);
    }
  });
}

// drawConfetti() 將彩帶粒子畫在成績面板上方。
function drawConfetti() {
  // 設定不使用外框線，避免彩帶看起來太厚重。
  noStroke();

  // 逐一繪製旋轉中的彩帶。
  confetti.forEach((piece) => {
    // 儲存目前畫布狀態，避免旋轉影響其他圖形。
    push();

    // 移動到彩帶中心。
    translate(piece.x, piece.y);

    // 套用彩帶旋轉角度。
    rotate(piece.angle);

    // 使用粒子自己的顏色。
    fill(piece.color);

    // 畫出小矩形彩帶。
    rect(0, 0, piece.size, piece.size * 1.8, 2);

    // 還原畫布狀態。
    pop();
  });
}

// ------------------------------
// 【響應式視窗處理】
// ------------------------------

// windowResized() 在瀏覽器視窗大小改變時重新調整畫布。
function windowResized() {
  // 將畫布調整成最新的瀏覽器視窗寬高。
  resizeCanvas(windowWidth, windowHeight);

  // 重新計算垃圾桶、卡片與按鈕位置。
  calculateLayout();
}
