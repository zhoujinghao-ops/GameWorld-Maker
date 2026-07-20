const demoAccounts = {
  Alex: { password: "play123", points: 250 },
  Mia: { password: "obby", points: 410 },
};

const STORAGE_KEYS = {
  accounts: "gameworld.accounts",
  currentName: "gameworld.currentName",
  publishedGames: "gameworld.publishedGames",
};

Object.assign(demoAccounts, loadStoredAccounts());

const authScreen = document.querySelector("#authScreen");
const mainScreen = document.querySelector("#mainScreen");
const authForm = document.querySelector("#authForm");
const nameInput = document.querySelector("#nameInput");
const passwordInput = document.querySelector("#passwordInput");
const continueBtn = document.querySelector("#continueBtn");
const authMessage = document.querySelector("#authMessage");
const welcomeName = document.querySelector("#welcomeName");
const userAvatar = document.querySelector(".user-avatar");
const pointsEl = document.querySelector("#points");
const logoutButton = document.querySelector("#logoutButton");
const topSearch = document.querySelector("#topSearch");
const choiceButtons = document.querySelectorAll("[data-auth-mode]");
const navButtons = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");
const assetTabButtons = document.querySelectorAll("[data-asset-tab]");
const assetPanels = document.querySelectorAll("[data-asset-panel]");
const characterButtons = document.querySelectorAll("[data-character]");
const backgroundButtons = document.querySelectorAll("[data-background-style]");
const effectButtons = document.querySelectorAll("[data-effect-style]");
const uiButtons = document.querySelectorAll("[data-ui-style]");
const modeButtons = document.querySelectorAll("[data-create-mode]");
const modePanels = document.querySelectorAll("[data-mode-panel]");
const handToolButtons = document.querySelectorAll("[data-hand-tool]");
const startBlankMap = document.querySelector("#startBlankMap");
const worldNameInput = document.querySelector("#worldNameInput");
const renameWorld = document.querySelector("#renameWorld");
const handMessage = document.querySelector("#handMessage");
const codeEditor = document.querySelector("#codeEditor");
const applyCode = document.querySelector("#applyCode");
const codeMessage = document.querySelector("#codeMessage");
const answerGrid = document.querySelector("#answerGrid");
const aiQuestion = document.querySelector("#aiQuestion");
const customAnswer = document.querySelector("#customAnswer");
const customInput = document.querySelector("#customInput");
const nextQuestion = document.querySelector("#nextQuestion");
const friendSearch = document.querySelector("#friendSearch");
const friendInvite = document.querySelector("#friendInvite");
const friendMessage = document.querySelector("#friendMessage");
const friendPlayerList = document.querySelector("#friendPlayerList");
const friendsList = document.querySelector("#friendsList");
const friendsEmpty = document.querySelector("#friendsEmpty");
const giftAmount = document.querySelector("#giftAmount");
const sendPoints = document.querySelector("#sendPoints");
const giftMessage = document.querySelector("#giftMessage");
const sendReport = document.querySelector("#sendReport");
const lockedNotice = document.querySelector("#lockedNotice");
const reportPlayerSearch = document.querySelector("#reportPlayerSearch");
const reportPlayerList = document.querySelector("#reportPlayerList");
const reportMessage = document.querySelector("#reportMessage");
const generatedGame = document.querySelector("#generatedGame");
const generatedTitle = document.querySelector("#generatedTitle");
const gameCanvas = document.querySelector("#gameCanvas");
const gameScore = document.querySelector("#gameScore");
const gameGoal = document.querySelector("#gameGoal");
const generatedMessage = document.querySelector("#generatedMessage");
const playGenerated = document.querySelector("#playGenerated");
const resetGenerated = document.querySelector("#resetGenerated");
const publishGenerated = document.querySelector("#publishGenerated");
const playGameTitle = document.querySelector("#playGameTitle");
const playGameCanvas = document.querySelector("#playGameCanvas");
const playGameScore = document.querySelector("#playGameScore");
const playGameCoins = document.querySelector("#playGameCoins");
const playGameMessage = document.querySelector("#playGameMessage");
const playGameStart = document.querySelector("#playGameStart");
const playGameReset = document.querySelector("#playGameReset");
const studioPublish = document.querySelector("#studioPublish");
const studioPlay = document.querySelector("#studioPlay");
const myGamesGrid = document.querySelector("#myGamesGrid");
const myGamesEmpty = document.querySelector("#myGamesEmpty");
const publicGamesGrid = document.querySelector("#publicGamesGrid");
const publicGamesEmpty = document.querySelector("#publicGamesEmpty");
const shopPageGrid = document.querySelector("#shopPageGrid");
const inventoryGrid = document.querySelector("#inventoryGrid");
const inventoryEmpty = document.querySelector("#inventoryEmpty");
const leaderboardList = document.querySelector("#leaderboardList");
const settingsProfile = document.querySelector("#settingsProfile");

let authMode = "first";
let currentUser = null;
let currentUserName = "";
let currentQuestion = 0;
let reportCount = 0;
let selectedAnswer = "";
let aiAnswers = [];
let generatedSpec = null;
let publishedGames = loadStoredPublishedGames();
let gameLoop = 0;
let handTool = "coin";
let blankMapActive = false;
let selectedCharacter = "adventurer";
let activeCanvas = gameCanvas;
let activeScoreEl = gameScore;
let activeCoinsEl = gameGoal;
let activeMessageEl = generatedMessage;
let activePlayButton = playGenerated;
let currentPlayGame = null;
let gamePaused = false;
let selectedReportReason = "";
let selectedFriendName = "";
let selectedBackgroundStyle = "grid";
let selectedUiStyle = "round";
let longPressTimer = 0;
let selectedEditableItem = null;
let dragEditableItem = null;
let suppressNextCanvasClick = false;

const defaultPhysics = { gravity: 0.55, jump: -12.5 };

const shopItems = [
  { id: "space-portal", name: "Space Portal", price: 40, type: "Portal", art: "portal" },
  { id: "ice-blocks", name: "Ice Blocks", price: 25, type: "Block Skin", art: "ice" },
  { id: "flying-car", name: "Flying Car", price: 90, type: "Vehicle", art: "car" },
  { id: "floating-island", name: "Floating Island", price: 50, type: "World", art: "island" },
  { id: "castle-kit", name: "Castle Kit", price: 120, type: "Building", art: "castle" },
  { id: "magic-crystal", name: "Magic Crystal", price: 80, type: "Effect", art: "crystal" },
  { id: "robot-drone", name: "Robot Drone", price: 150, type: "Companion", art: "drone" },
];

const gameState = {
  running: false,
  score: 0,
  goal: 6,
  physics: { ...defaultPhysics },
  worldStyle: "grid",
  blockColor: null,
  uiStyle: "round",
  startPoint: { x: 92, y: 230 },
  player: { x: 70, y: 260, size: 22, speed: 4 },
  items: [],
  hazards: [],
  blocks: [],
  portals: [],
  flags: [],
  effects: [],
  keys: new Set(),
  won: false,
};

const aiQuestions = [
  {
    text: "What kind of 2D game do you want to make?",
    answers: ["Racing", "Adventure", "Obby", "Battle", "Simulator", "Other"],
  },
  {
    text: "What should the world look like?",
    answers: ["City", "Forest", "Space", "School", "Island", "Other"],
  },
  {
    text: "What should players do?",
    answers: ["Race", "Collect", "Fight", "Survive", "Explore", "Other"],
  },
  {
    text: "Anything else you want to add?",
    answers: ["Yes", "No"],
  },
];

const builtInGames = {
  turbo: makeBuiltInGame("turbo", "Turbo Circuit X", "SpeedMaster", "Racing", "City", "Race", "racing", {
    startPoint: { x: 52, y: 236 },
    worldStyle: "race",
    blockColor: "#ef4444",
    speed: 6.4,
    physics: { gravity: 0.62, jump: -11.4 },
    blocks: [
      { x: 20, y: 286, width: 170, height: 50 },
      { x: 235, y: 250, width: 105, height: 42 },
      { x: 395, y: 216, width: 120, height: 44 },
      { x: 610, y: 178, width: 125, height: 48 },
    ],
    items: [{ x: 260, y: 218 }, { x: 420, y: 184 }, { x: 650, y: 146 }],
    flags: [{ x: 688, y: 96, width: 56, height: 82 }],
  }),
  skyward: makeBuiltInGame("skyward", "Skyward Parkour", "JumpKing", "Obby", "Island", "Explore", "obby", {
    startPoint: { x: 56, y: 244 },
    worldStyle: "sky",
    blockColor: "#60a5fa",
    speed: 4,
    physics: { gravity: 0.48, jump: -13.8 },
    blocks: [
      { x: 25, y: 298, width: 105, height: 34 },
      { x: 170, y: 260, width: 85, height: 30 },
      { x: 310, y: 218, width: 90, height: 30 },
      { x: 470, y: 178, width: 95, height: 30 },
      { x: 640, y: 136, width: 95, height: 30 },
    ],
    items: [{ x: 190, y: 232 }, { x: 330, y: 190 }, { x: 490, y: 150 }],
    flags: [{ x: 690, y: 54, width: 56, height: 82 }],
  }),
  zombie: makeBuiltInGame("zombie", "Zombie City", "DarkZone", "Battle", "City", "Survive", "battle", {
    startPoint: { x: 58, y: 236 },
    worldStyle: "city",
    blockColor: "#64748b",
    speed: 4.1,
    physics: { gravity: 0.6, jump: -12 },
    blocks: [
      { x: 15, y: 288, width: 180, height: 48 },
      { x: 245, y: 260, width: 118, height: 40 },
      { x: 438, y: 230, width: 118, height: 40 },
      { x: 630, y: 194, width: 118, height: 44 },
    ],
    hazards: [{ x: 215, y: 314, width: 42, height: 24 }, { x: 385, y: 314, width: 42, height: 24 }, { x: 580, y: 314, width: 42, height: 24 }],
    items: [{ x: 280, y: 228 }, { x: 475, y: 198 }],
    flags: [{ x: 692, y: 112, width: 56, height: 82 }],
  }),
  island: makeBuiltInGame("island", "Island Tycoon", "BuildBoss", "Simulator", "Island", "Collect", "sim", {
    startPoint: { x: 80, y: 236 },
    worldStyle: "island",
    blockColor: "#22c55e",
    speed: 4.2,
    physics: { gravity: 0.54, jump: -12.5 },
    blocks: [
      { x: 40, y: 288, width: 150, height: 48 },
      { x: 260, y: 288, width: 125, height: 48 },
      { x: 455, y: 244, width: 125, height: 44 },
      { x: 645, y: 198, width: 95, height: 42 },
    ],
    items: [{ x: 280, y: 256 }, { x: 330, y: 256 }, { x: 490, y: 212 }, { x: 676, y: 166 }],
    flags: [{ x: 692, y: 116, width: 56, height: 82 }],
  }),
  mega: makeBuiltInGame("mega", "Mega Obby Fun", "ObbyStar", "Obby", "Cloud", "Explore", "obby", {
    startPoint: { x: 48, y: 246 },
    worldStyle: "cloud",
    blockColor: "#ec4899",
    speed: 4.3,
    physics: { gravity: 0.5, jump: -13.2 },
    blocks: [
      { x: 20, y: 300, width: 82, height: 30 },
      { x: 150, y: 254, width: 78, height: 30 },
      { x: 285, y: 292, width: 78, height: 30 },
      { x: 425, y: 224, width: 78, height: 30 },
      { x: 575, y: 170, width: 78, height: 30 },
      { x: 682, y: 126, width: 70, height: 30 },
    ],
    items: [{ x: 168, y: 226 }, { x: 445, y: 196 }, { x: 594, y: 142 }],
    flags: [{ x: 710, y: 44, width: 56, height: 82 }],
  }),
  space: makeBuiltInGame("space", "Space Racing AI", "AI_Creator", "Racing", "Space", "Race", "racing", {
    startPoint: { x: 64, y: 234 },
    worldStyle: "space",
    blockColor: "#22d3ee",
    speed: 5.8,
    physics: { gravity: 0.34, jump: -10.8 },
    blocks: [
      { x: 25, y: 286, width: 130, height: 44 },
      { x: 220, y: 248, width: 118, height: 40 },
      { x: 390, y: 210, width: 118, height: 40 },
      { x: 585, y: 170, width: 140, height: 44 },
    ],
    hazards: [{ x: 345, y: 316, width: 45, height: 24 }],
    items: [{ x: 245, y: 216 }, { x: 420, y: 178 }, { x: 620, y: 138 }],
    flags: [{ x: 700, y: 88, width: 56, height: 82 }],
  }),
  monster: makeBuiltInGame("monster", "Monster Arena", "AI_Creator", "Battle", "Arena", "Fight", "battle", {
    startPoint: { x: 70, y: 236 },
    worldStyle: "arena",
    blockColor: "#dc2626",
    speed: 4,
    physics: { gravity: 0.64, jump: -12.2 },
    blocks: [
      { x: 30, y: 288, width: 170, height: 48 },
      { x: 290, y: 250, width: 120, height: 40 },
      { x: 540, y: 214, width: 180, height: 44 },
    ],
    hazards: [{ x: 230, y: 314, width: 42, height: 24 }, { x: 455, y: 314, width: 42, height: 24 }, { x: 605, y: 190, width: 42, height: 24 }],
    items: [{ x: 320, y: 218 }, { x: 580, y: 182 }],
    flags: [{ x: 690, y: 132, width: 56, height: 82 }],
  }),
  dream: makeBuiltInGame("dream", "Dream World AI", "AI_Creator", "Simulator", "Dream", "Collect", "sim", {
    startPoint: { x: 76, y: 236 },
    worldStyle: "dream",
    blockColor: "#a78bfa",
    speed: 4.4,
    physics: { gravity: 0.46, jump: -13 },
    blocks: [
      { x: 35, y: 288, width: 145, height: 48 },
      { x: 255, y: 250, width: 105, height: 40 },
      { x: 430, y: 250, width: 105, height: 40 },
      { x: 620, y: 200, width: 120, height: 42 },
    ],
    items: [{ x: 285, y: 218 }, { x: 460, y: 218 }, { x: 650, y: 168 }],
    flags: [{ x: 698, y: 118, width: 56, height: 82 }],
  }),
  cloud: makeBuiltInGame("cloud", "Cloud Tower", "AI_Creator", "Obby", "Cloud", "Explore", "obby", {
    startPoint: { x: 54, y: 246 },
    worldStyle: "cloud",
    blockColor: "#38bdf8",
    speed: 3.9,
    physics: { gravity: 0.42, jump: -14 },
    blocks: [
      { x: 24, y: 300, width: 90, height: 30 },
      { x: 160, y: 264, width: 85, height: 30 },
      { x: 300, y: 228, width: 85, height: 30 },
      { x: 440, y: 190, width: 85, height: 30 },
      { x: 590, y: 150, width: 85, height: 30 },
    ],
    items: [{ x: 180, y: 236 }, { x: 320, y: 200 }, { x: 610, y: 122 }],
    flags: [{ x: 622, y: 68, width: 56, height: 82 }],
  }),
};

restoreRememberedSession();

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.authMode);
  });
});

authForm.addEventListener("click", (event) => {
  const modeButton = event.target.closest("[data-auth-mode]");
  if (!modeButton) return;
  setAuthMode(modeButton.dataset.authMode);
});

[nameInput, passwordInput].forEach((input) => input.addEventListener("input", validateAuth));

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = cleanName(nameInput.value);
  const password = passwordInput.value;
  const existing = demoAccounts[name] ? normalizeAccount(demoAccounts[name]) : null;

  if (authMode === "first" && existing) {
    authMessage.textContent = "This name is already taken.";
    return;
  }

  if (authMode === "returning" && (!existing || existing.password !== password)) {
    authMessage.textContent = "Name or password is not correct.";
    return;
  }

  if (existing?.locked) {
    authMessage.textContent = "This account is locked because of reports.";
    return;
  }

  currentUser = existing || normalizeAccount({ password, points: 0 });
  demoAccounts[name] = currentUser;
  saveAccounts();
  signIn(name, currentUser);
});

function validateAuth() {
  continueBtn.disabled = cleanName(nameInput.value).length < 2 || passwordInput.value.length < 3;
}

function loadStoredAccounts() {
  return readStoredJson(STORAGE_KEYS.accounts, {});
}

function loadStoredPublishedGames() {
  return readStoredJson(STORAGE_KEYS.publishedGames, []);
}

function normalizeAccount(account) {
  account.points = Number.isFinite(Number(account.points)) ? Number(account.points) : 0;
  account.reportCount = Number.isFinite(Number(account.reportCount)) ? Number(account.reportCount) : 0;
  account.locked = Boolean(account.locked);
  if (!Array.isArray(account.friends)) account.friends = [];
  if (!Array.isArray(account.inventory)) account.inventory = [];
  return account;
}

function makeBuiltInGame(id, title, creator, type, world, action, themeWord, layout) {
  const startPoint = layout.startPoint || getDefaultStartPoint(false);
  const physics = layout.physics || defaultPhysics;
  const items = (layout.items || []).map((item) => ({
    x: item.x,
    y: item.y,
    size: item.size || 15,
    collected: false,
  }));
  return {
    id: `built-in-${id}`,
    type,
    world,
    action,
    extra: "",
    title,
    creator,
    plays: 0,
    theme: makeTheme(type, themeWord, action, ""),
    character: layout.character || "adventurer",
    savedWorld: {
      blankMap: true,
      worldStyle: layout.worldStyle || "grid",
      blockColor: layout.blockColor || null,
      uiStyle: layout.uiStyle || "round",
      physics: { ...defaultPhysics, ...physics },
      score: 0,
      goal: items.length,
      won: false,
      character: layout.character || "adventurer",
      startPoint,
      player: {
        x: startPoint.x,
        y: startPoint.y,
        size: 24,
        speed: layout.speed || (type.toLowerCase() === "racing" ? 5.4 : 4.2),
        velocityY: 0,
        onGround: false,
      },
      items,
      hazards: (layout.hazards || []).map((hazard) => ({ ...hazard, vx: hazard.vx || 0 })),
      blocks: (layout.blocks || []).map((block) => ({ ...block })),
      portals: [],
      flags: (layout.flags || []).map((flag) => ({ ...flag })),
      effects: (layout.effects || []).map((effect) => ({ ...effect })),
    },
  };
}

function readStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveAccounts() {
  localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(demoAccounts));
}

function savePublishedGames() {
  localStorage.setItem(STORAGE_KEYS.publishedGames, JSON.stringify(publishedGames));
}

function knownPlayerNames() {
  return [...new Set([
    ...Object.keys(demoAccounts),
    ...publishedGames.map((game) => game.creator).filter(Boolean),
  ])].sort((a, b) => a.localeCompare(b));
}

function syncReportPlayerList() {
  if (!reportPlayerList) return;
  reportPlayerList.innerHTML = knownPlayerNames()
    .filter((name) => name !== currentUserName)
    .map((name) => `<option value="${escapeText(name)}"></option>`)
    .join("");
}

function syncFriendPlayerList() {
  if (!friendPlayerList) return;
  friendPlayerList.innerHTML = knownPlayerNames()
    .filter((name) => name !== currentUserName && !currentUser?.friends?.includes(name))
    .map((name) => `<option value="${escapeText(name)}"></option>`)
    .join("");
}

function findKnownPlayerName(name) {
  const cleaned = cleanName(name);
  return knownPlayerNames().find((playerName) => playerName.toLowerCase() === cleaned.toLowerCase()) || "";
}

function ownerKey(name) {
  return cleanName(String(name || "")).toLowerCase();
}

function isOwnGame(game) {
  return ownerKey(game.creator) === ownerKey(currentUserName);
}

function renderFriends() {
  if (!friendsList || !friendsEmpty || !currentUser) return;
  const friends = currentUser.friends || [];
  friendsEmpty.classList.toggle("hidden", friends.length > 0);
  friendsList.innerHTML = friends.map((name) => `
    <div class="friend-row ${name === selectedFriendName ? "active" : ""}">
      <span>${escapeText(name)}</span>
      <button type="button" data-select-friend="${escapeText(name)}">Select</button>
    </div>
  `).join("");

  friendsList.querySelectorAll("[data-select-friend]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedFriendName = button.dataset.selectFriend;
      friendMessage.textContent = `${selectedFriendName} selected.`;
      giftMessage.textContent = `You can send points to ${selectedFriendName}.`;
      renderFriends();
    });
  });

  const chatTitle = document.querySelector(".chat-head h3");
  const chatText = document.querySelector(".chat-head p");
  const emptyChat = document.querySelector(".empty-chat");
  const sendPointsText = sendPoints.closest(".panel")?.querySelector("p");
  if (friends.length > 0) {
    selectedFriendName ||= friends[0];
    if (chatTitle) chatTitle.textContent = `Chat with ${selectedFriendName}`;
    if (chatText) chatText.textContent = "You can send messages and photos.";
    emptyChat?.classList.add("hidden");
    if (sendPointsText) sendPointsText.textContent = `Friends only. Selected friend: ${selectedFriendName}.`;
  } else {
    selectedFriendName = "";
    if (chatTitle) chatTitle.textContent = "Chat";
    if (chatText) chatText.textContent = "Add a friend to start chatting";
    emptyChat?.classList.remove("hidden");
    if (sendPointsText) sendPointsText.textContent = "Friends only. You do not have friends yet.";
  }
}

function renderShop() {
  if (!shopPageGrid || !currentUser) return;
  shopPageGrid.innerHTML = shopItems.map((item) => {
    const owned = currentUser.inventory.includes(item.id);
    return `
      <article class="shop-store-card">
        <div class="shop-art ${shopArtClass(item.art)}"></div>
        <h3>${escapeText(item.name)}</h3>
        <p>${escapeText(item.type)}</p>
        <button type="button" data-buy-item="${item.id}" ${owned ? "disabled" : ""}>${owned ? "Owned" : `${item.price} pts`}</button>
      </article>
    `;
  }).join("");
}

function renderInventory() {
  if (!inventoryGrid || !inventoryEmpty || !currentUser) return;
  const ownedItems = shopItems.filter((item) => currentUser.inventory.includes(item.id));
  inventoryEmpty.classList.toggle("hidden", ownedItems.length > 0);
  inventoryGrid.innerHTML = ownedItems.map((item) => `
    <article class="inventory-card">
      <div class="shop-art ${shopArtClass(item.art)}"></div>
      <h3>${escapeText(item.name)}</h3>
      <p>${escapeText(item.type)}</p>
      <button type="button" data-use-inventory="${item.id}">Use</button>
    </article>
  `).join("");

  inventoryGrid.querySelectorAll("[data-use-inventory]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = shopItems.find((entry) => entry.id === button.dataset.useInventory);
      if (!item) return;
      applyInventoryItem(item);
    });
  });
}

function renderLeaderboard() {
  if (!leaderboardList) return;
  const players = knownPlayerNames()
    .map((name) => ({ name, ...normalizeAccount(demoAccounts[name] || { points: 0 }) }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);
  leaderboardList.innerHTML = players.map((player, index) => `
    <div class="leaderboard-row ${player.name === currentUserName ? "active" : ""}">
      <strong>#${index + 1}</strong>
      <span>${escapeText(player.name)}</span>
      <em>${player.locked ? "Locked" : `${player.points} pts`}</em>
    </div>
  `).join("");
}

function renderSettings() {
  if (!settingsProfile || !currentUser) return;
  settingsProfile.textContent = `${currentUserName} · ${currentUser.points} points · ${currentUser.inventory.length} materials`;
}

function shopArtClass(art) {
  const classes = {
    island: "island-art",
    castle: "castle-art",
    crystal: "crystal-art",
    drone: "drone-art",
    portal: "portal-art",
    ice: "ice-art",
    car: "car-art",
  };
  return classes[art] || "island-art";
}

function buyShopItem(itemId) {
  if (!currentUser) return;
  const item = shopItems.find((entry) => entry.id === itemId);
  if (!item) return;
  if (currentUser.inventory.includes(item.id)) {
    showNotice(`${item.name} is already in Inventory.`);
    return;
  }
  if (currentUser.points < item.price) {
    showNotice(`Need ${item.price - currentUser.points} more points for ${item.name}.`);
    return;
  }
  currentUser.points -= item.price;
  currentUser.inventory.push(item.id);
  pointsEl.textContent = currentUser.points;
  saveAccounts();
  renderShop();
  renderInventory();
  showNotice(`${item.name} added to Inventory.`);
}

function applyInventoryItem(item) {
  showView("create");
  ensurePlayableWorld("hand");
  if (item.id === "space-portal") {
    handTool = "portal";
    handMessage.textContent = "Space Portal ready. Click inside the game to place it.";
  } else if (item.id === "ice-blocks") {
    gameState.blockColor = "#67e8f9";
    generatedSpec.blockColor = "#67e8f9";
    handMessage.textContent = "Ice block style applied.";
    drawGame();
  } else if (item.id === "magic-crystal") {
    handTool = "effect:sparkle";
    handMessage.textContent = "Magic Crystal effect ready. Click inside the game to place it.";
  } else if (item.id === "floating-island") {
    selectedBackgroundStyle = "island";
    gameState.worldStyle = "island";
    generatedSpec.blankMap = true;
    generatedSpec.worldStyle = "island";
    handMessage.textContent = "Floating Island background applied.";
    drawGame();
  } else {
    handMessage.textContent = `${item.name} selected for this game.`;
  }
  showNotice(`${item.name} selected.`);
}

function rememberSession(name) {
  localStorage.setItem(STORAGE_KEYS.currentName, name);
}

function clearRememberedSession() {
  localStorage.removeItem(STORAGE_KEYS.currentName);
}

function signIn(name, user) {
  currentUser = normalizeAccount(user);
  currentUserName = name;
  welcomeName.textContent = name;
  userAvatar.textContent = name.charAt(0).toUpperCase();
  pointsEl.textContent = currentUser.points;
  rememberSession(name);
  syncReportPlayerList();
  syncFriendPlayerList();
  renderFriends();
  authScreen.classList.remove("active");
  mainScreen.classList.add("active");
}

function restoreRememberedSession() {
  const savedName = localStorage.getItem(STORAGE_KEYS.currentName);
  if (savedName && demoAccounts[savedName]) {
    const savedAccount = normalizeAccount(demoAccounts[savedName]);
    if (savedAccount.locked) {
      clearRememberedSession();
      nameInput.value = savedName;
      setAuthMode("returning");
      authMessage.textContent = "This account is locked because of reports.";
      return;
    }
    signIn(savedName, savedAccount);
    return;
  }

  if (savedName) {
    nameInput.value = savedName;
    setAuthMode("returning");
  } else {
    validateAuth();
  }
}

function setAuthMode(mode) {
  authMode = mode;
  choiceButtons.forEach((item) => item.classList.toggle("active", item.dataset.authMode === mode));
  authMessage.textContent = authMode === "first"
    ? "No two accounts can use the same name."
    : "Returning players must use the saved password.";
  validateAuth();
}

function cleanName(value) {
  return value.trim().replace(/\s+/g, " ");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

viewLinks.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.viewLink));
});

topSearch?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const query = cleanName(topSearch.value).toLowerCase();
  if (!query) return;
  const builtInMatch = Object.values(builtInGames).find((game) =>
    `${game.title} ${game.type} ${game.world} ${game.creator}`.toLowerCase().includes(query)
  );
  const publishedMatch = publishedGames.find((game) =>
    `${game.title} ${game.type} ${game.world} ${game.creator}`.toLowerCase().includes(query)
  );
  if (publishedMatch) openPublishedGame(publishedMatch);
  else if (builtInMatch) openPublishedGame(builtInMatch);
  else if (query.includes("shop")) showView("shop");
  else if (query.includes("friend")) showView("friends");
  else if (query.includes("create")) showView("create");
  else {
    showView("recommended");
    filterRecommendedGames(query);
  }
});

document.addEventListener("click", (event) => {
  const buyButton = event.target.closest("[data-buy-item]");
  if (buyButton) {
    buyShopItem(buyButton.dataset.buyItem);
  }
});

document.querySelectorAll("[data-built-in-game]").forEach((button) => {
  button.addEventListener("click", () => {
    const game = builtInGames[button.dataset.builtInGame];
    if (!game) return;
    openPublishedGame(game);
  });
});

document.querySelectorAll(".recommend-menu button").forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.textContent.trim().replace(/\s+\d+$/, "");
    document.querySelectorAll(".recommend-menu button").forEach((item) => item.classList.toggle("active", item === button));
    if (label === "Home") showView("home");
    else if (label === "Play Games" || label === "Recommended") showView("recommended");
    else if (label === "Create Game") showView("create");
    else if (label === "Friends" || label === "Messages") showView("friends");
    else if (label === "Shop") showView("shop");
    else if (label === "Inventory") showView("inventory");
    else if (label === "Leaderboard") showView("leaderboard");
    else if (label === "Settings") showView("settings");
    else showNotice(`${label} opened.`);
  });
});

document.querySelectorAll(".filters-panel button").forEach((button) => {
  button.addEventListener("click", () => {
    const groupStart = button.previousElementSibling?.tagName === "P" ? button.previousElementSibling.textContent : "";
    const label = button.textContent.trim();
    const siblings = [...button.parentElement.querySelectorAll("button")];
    const startIndex = siblings.findIndex((item) => item === button);
    const previousHeading = [...button.parentElement.children]
      .slice(0, [...button.parentElement.children].indexOf(button))
      .reverse()
      .find((item) => item.tagName === "P");
    const sectionButtons = siblings.filter((item) => {
      const heading = [...button.parentElement.children]
        .slice(0, [...button.parentElement.children].indexOf(item))
        .reverse()
        .find((child) => child.tagName === "P");
      return heading === previousHeading;
    });
    sectionButtons.forEach((item) => item.classList.toggle("active", item === button));
    if (previousHeading?.textContent === "Game Type") filterRecommendedGames(label);
    if (previousHeading?.textContent === "Sort By") showNotice(`Sorted by ${label}.`);
  });
});

document.querySelectorAll(".studio-tool-row button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".studio-tool-row button").forEach((item) => item.classList.toggle("active", item === button));
    const tool = button.textContent.trim();
    if (tool === "Erase") handTool = "erase";
    handMessage.textContent = `${tool} tool selected. ${tool === "Erase" ? "Click an item in the game to remove it." : "Choose a material and click inside the game."}`;
  });
});

document.querySelectorAll(".platform-toolbar button").forEach((button, index) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".platform-toolbar button").forEach((item) => item.classList.toggle("active", item === button));
    showNotice(["Select", "Move", "Resize", "Night preview"][index] + " selected.");
  });
});

document.querySelector(".scene-play")?.addEventListener("click", () => {
  useCreateGameSurface();
  ensurePlayableWorld("hand");
  generatedGame.classList.remove("hidden");
  studioPlay.click();
});

document.querySelector(".level-strip button")?.addEventListener("click", () => {
  worldNameInput.value = cleanName(worldNameInput.value) || "New Level";
  startBlankMap.click();
  showNotice("New blank level added.");
});

document.querySelectorAll(".viewport3d > .creator-tools button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".viewport3d > .creator-tools button").forEach((item) => item.classList.toggle("active", item === button));
    showNotice(`${button.textContent.trim()} view selected.`);
  });
});

document.querySelectorAll("#safety .answer-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedReportReason = button.textContent.trim();
    document.querySelectorAll("#safety .answer-grid button").forEach((item) => item.classList.toggle("active", item === button));
  });
});

document.querySelectorAll(".chat-actions button").forEach((button) => {
  button.addEventListener("click", () => {
    if (currentUser?.friends?.length) {
      friendMessage.textContent = `${button.textContent.trim()} sent to ${selectedFriendName || currentUser.friends[0]}.`;
      return;
    }
    friendMessage.textContent = "Add a friend before using chat actions.";
    showView("friends");
  });
});

document.querySelectorAll(".section-head button:not([data-view-link])").forEach((button) => {
  button.addEventListener("click", () => {
    const heading = button.closest(".section-head")?.querySelector("h3")?.textContent || "Section";
    if (heading === "Shop") showView("shop");
    else if (heading.includes("Top") || heading.includes("AI")) showView("recommended");
    else showNotice(`${heading} list is already showing.`);
  });
});

document.querySelectorAll("[data-settings-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.settingsAction;
    if (action === "reset-notices") showNotice("Notices cleared.");
    else {
      button.classList.toggle("active");
      button.textContent = button.classList.contains("active")
        ? button.textContent.replace("on", "off")
        : button.textContent.replace("off", "on");
    }
  });
});

assetTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.assetTab;
    assetTabButtons.forEach((item) => item.classList.toggle("active", item === button));
    assetPanels.forEach((panel) => panel.classList.toggle("hidden", panel.dataset.assetPanel !== tab));
  });
});

characterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCharacter = button.dataset.character;
    characterButtons.forEach((item) => item.classList.toggle("active", item === button));
    ensurePlayableWorld("hand");
    generatedSpec.character = selectedCharacter;
    setGameMessage(`${button.textContent.trim()} selected for your player.`);
    drawGame();
  });
});

backgroundButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedBackgroundStyle = button.dataset.backgroundStyle || "grid";
    backgroundButtons.forEach((item) => item.classList.toggle("active", item === button));
    if (!generatedSpec || generatedGame.classList.contains("hidden")) {
      startBlankWorld();
      return;
    }
    ensurePlayableWorld("hand");
    blankMapActive = true;
    gameState.worldStyle = selectedBackgroundStyle;
    generatedSpec.blankMap = true;
    generatedSpec.worldStyle = selectedBackgroundStyle;
    handMessage.textContent = `${backgroundLabel(selectedBackgroundStyle)} background selected.`;
    setGameMessage(`${backgroundLabel(selectedBackgroundStyle)} background selected for this game.`);
    drawGame();
  });
});

effectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const effect = button.dataset.effectStyle || "sparkle";
    handTool = `effect:${effect}`;
    effectButtons.forEach((item) => item.classList.toggle("active", item === button));
    handToolButtons.forEach((item) => item.classList.remove("active-tool"));
    ensurePlayableWorld("hand");
    handMessage.textContent = `Selected ${effectLabel(effect)} effect. Click inside the game to place it.`;
  });
});

uiButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedUiStyle = button.dataset.uiStyle || "round";
    uiButtons.forEach((item) => item.classList.toggle("active", item === button));
    ensurePlayableWorld("hand");
    gameState.uiStyle = selectedUiStyle;
    generatedSpec.uiStyle = selectedUiStyle;
    applyUiStyle();
    handMessage.textContent = `${uiLabel(selectedUiStyle)} UI selected.`;
    setGameMessage(`${uiLabel(selectedUiStyle)} UI selected for this game.`);
  });
});

logoutButton.addEventListener("click", () => {
  const returningName = currentUserName;
  cancelAnimationFrame(gameLoop);
  gameState.running = false;
  activePlayButton.textContent = "Play";
  clearRememberedSession();
  currentUser = null;
  currentUserName = "";
  nameInput.value = returningName;
  passwordInput.value = "";
  setAuthMode("returning");
  mainScreen.classList.remove("active");
  authScreen.classList.add("active");
  showView("home");
  passwordInput.focus();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.createMode;
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    modePanels.forEach((panel) => panel.classList.toggle("hidden", panel.dataset.modePanel !== mode));
    if (mode !== "ai") ensurePlayableWorld(mode);
  });
});

handToolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handTool = button.dataset.handTool;
    handToolButtons.forEach((item) => item.classList.toggle("active-tool", item === button));
    effectButtons.forEach((item) => item.classList.remove("active"));
    handMessage.textContent = `Selected ${handToolLabel(handTool)}. Click inside the game to place it.`;
    ensurePlayableWorld("hand");
  });
});

startBlankMap.addEventListener("click", () => {
  startBlankWorld();
});

function startBlankWorld() {
  const worldName = cleanName(worldNameInput.value) || `${backgroundLabel(selectedBackgroundStyle)} Map`;
  generatedSpec = {
    type: "Hand",
    world: worldName,
    action: "Create",
    extra: "",
    title: worldName,
    theme: makeTheme("blank", selectedBackgroundStyle, "create", ""),
    blankMap: true,
    worldStyle: selectedBackgroundStyle,
    character: selectedCharacter,
    uiStyle: selectedUiStyle,
  };
  generatedTitle.textContent = generatedSpec.title;
  generatedGame.classList.remove("hidden");
  createPlayableWorld(generatedSpec);
  handMessage.textContent = `${backgroundLabel(selectedBackgroundStyle)} map started. Pick a material, then click inside the game.`;
}

renameWorld.addEventListener("click", () => {
  const worldName = cleanName(worldNameInput.value);
  if (!worldName) {
    handMessage.textContent = "Write a world name first.";
    return;
  }
  ensurePlayableWorld("hand");
  generatedSpec.world = worldName;
  generatedSpec.title = worldName;
  generatedTitle.textContent = worldName;
  worldNameInput.value = worldName;
  handMessage.textContent = `World name changed to ${worldName}.`;
  setGameMessage(`${worldName} is ready to edit or publish.`);
});

gameCanvas.addEventListener("click", (event) => {
  if (suppressNextCanvasClick) {
    suppressNextCanvasClick = false;
    return;
  }
  const handModeActive = !document.querySelector('[data-mode-panel="hand"]').classList.contains("hidden");
  if (!handModeActive) return;
  ensurePlayableWorld("hand");
  const rect = gameCanvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * gameCanvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * gameCanvas.height;
  placeHandMaterial(handTool, x, y);
});

gameCanvas.addEventListener("pointerdown", (event) => {
  const handModeActive = !document.querySelector('[data-mode-panel="hand"]').classList.contains("hidden");
  if (!handModeActive || !generatedSpec) return;

  const point = getCanvasPoint(event);
  const hit = findEditableItem(point.x, point.y);
  if (!hit) {
    selectedEditableItem = null;
    drawGame();
    return;
  }

  clearTimeout(longPressTimer);
  longPressTimer = setTimeout(() => {
    selectedEditableItem = hit;
    dragEditableItem = {
      ...hit,
      offsetX: point.x - getEditableAnchor(hit).x,
      offsetY: point.y - getEditableAnchor(hit).y,
    };
    suppressNextCanvasClick = true;
    gameCanvas.setPointerCapture(event.pointerId);
    setGameMessage(`${editableLabel(hit.type)} selected. Drag to move it, or press Delete to remove it.`);
    drawGame();
  }, 450);
});

gameCanvas.addEventListener("pointermove", (event) => {
  if (!dragEditableItem) return;
  const point = getCanvasPoint(event);
  moveEditableItem(dragEditableItem, point.x - dragEditableItem.offsetX, point.y - dragEditableItem.offsetY);
  suppressNextCanvasClick = true;
  drawGame();
});

["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
  gameCanvas.addEventListener(eventName, (event) => {
    clearTimeout(longPressTimer);
    if (dragEditableItem && event.type !== "pointerleave") {
      suppressNextCanvasClick = true;
      setGameMessage(`${editableLabel(dragEditableItem.type)} moved.`);
    }
    dragEditableItem = null;
    if (gameCanvas.hasPointerCapture?.(event.pointerId)) {
      gameCanvas.releasePointerCapture(event.pointerId);
    }
  });
});

applyCode.addEventListener("click", () => {
  ensurePlayableWorld("code");
  applyCodeRules(codeEditor.value);
});

function showView(viewId) {
  if (viewId === "create") {
    useCreateGameSurface();
    if (generatedSpec) drawGame();
  }
  if (viewId === "playGame") {
    usePlayGameSurface();
    if (generatedSpec) drawGame();
  }
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });
  if (viewId === "myGames") renderMyGames();
  if (viewId === "recommended") renderPublicGames();
  if (viewId === "shop") renderShop();
  if (viewId === "inventory") renderInventory();
  if (viewId === "leaderboard") renderLeaderboard();
  if (viewId === "settings") renderSettings();
}

function showNotice(message) {
  let notice = document.querySelector("#appNotice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "appNotice";
    notice.className = "app-notice";
    document.body.append(notice);
  }
  notice.textContent = message;
  notice.classList.add("visible");
  clearTimeout(showNotice.timer);
  showNotice.timer = setTimeout(() => notice.classList.remove("visible"), 1800);
}

function filterRecommendedGames(type) {
  const wanted = type.toLowerCase();
  const cards = document.querySelectorAll("#recommended .game-card");
  cards.forEach((card) => {
    if (wanted === "all types") {
      card.classList.remove("filtered-out");
      return;
    }
    const thumb = card.querySelector(".thumb");
    const classes = thumb ? [...thumb.classList] : [];
    const text = card.textContent.toLowerCase();
    const matches = classes.includes(wanted) || text.includes(wanted);
    card.classList.toggle("filtered-out", !matches);
  });
  showNotice(`${type} games shown.`);
}

function useCreateGameSurface() {
  activeCanvas = gameCanvas;
  activeScoreEl = gameScore;
  activeCoinsEl = gameGoal;
  activeMessageEl = generatedMessage;
  activePlayButton = playGenerated;
}

function usePlayGameSurface() {
  activeCanvas = playGameCanvas;
  activeScoreEl = playGameScore;
  activeCoinsEl = playGameCoins;
  activeMessageEl = playGameMessage;
  activePlayButton = playGameStart;
}

function setGameMessage(message) {
  activeMessageEl.textContent = message;
}

function syncGameStats() {
  activeScoreEl.textContent = gameState.score;
  activeCoinsEl.textContent = gameState.goal;
}

function applyUiStyle() {
  const style = gameState.uiStyle || selectedUiStyle || "round";
  document.querySelectorAll(".game-stats").forEach((stats) => {
    stats.dataset.uiStyle = style;
  });
}

function renderQuestion() {
  const question = aiQuestions[currentQuestion];
  aiQuestion.textContent = question.text;
  answerGrid.innerHTML = "";
  customAnswer.classList.add("hidden");
  customInput.value = "";
  selectedAnswer = "";
  nextQuestion.textContent = currentQuestion === aiQuestions.length - 1 ? "Build Game" : "Next";

  question.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.type = "button";
    button.addEventListener("click", () => {
      answerGrid.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      selectedAnswer = answer;
      if (answer === "Other" || answer === "Yes") {
        customAnswer.classList.remove("hidden");
        customInput.focus();
      } else {
        customAnswer.classList.add("hidden");
      }
    });
    answerGrid.append(button);
  });
}

nextQuestion.addEventListener("click", () => {
  if (currentQuestion === -1) {
    currentQuestion = 0;
    aiAnswers = [];
    generatedGame.classList.add("hidden");
    renderQuestion();
    return;
  }

  const customText = cleanName(customInput.value);
  const answer = customText || selectedAnswer || "Other";
  aiAnswers[currentQuestion] = answer;

  if (currentQuestion === aiQuestions.length - 1) {
    buildGeneratedGame();
    currentQuestion = -1;
    nextQuestion.textContent = "Start Over";
    return;
  }

  currentQuestion += 1;
  renderQuestion();
});

friendInvite.addEventListener("click", () => {
  const name = findKnownPlayerName(friendSearch.value);
  if (!cleanName(friendSearch.value)) {
    friendMessage.textContent = "Write a player's name before sending an invitation.";
    return;
  }
  if (!name) {
    friendMessage.textContent = "No player found with that name.";
    return;
  }
  if (name === currentUserName) {
    friendMessage.textContent = "You cannot send a friend invitation to yourself.";
    return;
  }
  if (currentUser.friends.includes(name)) {
    friendMessage.textContent = `${name} is already your friend.`;
    selectedFriendName = name;
    renderFriends();
    return;
  }
  currentUser.friends.push(name);
  if (demoAccounts[name]) {
    if (!Array.isArray(demoAccounts[name].friends)) demoAccounts[name].friends = [];
    if (!demoAccounts[name].friends.includes(currentUserName)) demoAccounts[name].friends.push(currentUserName);
  }
  selectedFriendName = name;
  friendSearch.value = "";
  friendMessage.textContent = `${name} added as a friend.`;
  saveAccounts();
  syncFriendPlayerList();
  renderFriends();
});

sendPoints.addEventListener("click", () => {
  const friends = currentUser?.friends || [];
  const targetName = selectedFriendName || friends[0];
  const amount = Math.max(0, Math.floor(Number(giftAmount.value)));
  if (!targetName) {
    giftMessage.textContent = "Add a friend before sending points.";
    return;
  }
  if (!amount) {
    giftMessage.textContent = "Write how many points to send.";
    return;
  }
  if (amount > currentUser.points) {
    giftMessage.textContent = "You do not have enough points.";
    return;
  }
  currentUser.points -= amount;
  if (demoAccounts[targetName]) {
    demoAccounts[targetName].points = (demoAccounts[targetName].points || 0) + amount;
  }
  pointsEl.textContent = currentUser.points;
  giftAmount.value = "";
  saveAccounts();
  giftMessage.textContent = `${amount} points sent to ${targetName}.`;
});

reportPlayerSearch?.addEventListener("input", () => {
  const foundName = findKnownPlayerName(reportPlayerSearch.value);
  if (!reportPlayerSearch.value.trim()) {
    reportMessage.textContent = "Search the player's name before reporting.";
  } else if (foundName && foundName !== currentUserName) {
    reportMessage.textContent = `${foundName} selected for report.`;
  } else if (findKnownPlayerName(reportPlayerSearch.value) === currentUserName) {
    reportMessage.textContent = "You cannot report yourself.";
  } else {
    reportMessage.textContent = "No player found with that name.";
  }
});

sendReport.addEventListener("click", () => {
  const reportedName = findKnownPlayerName(reportPlayerSearch?.value || "");
  if (!reportedName) {
    reportMessage.textContent = "Search and choose a player name first.";
    showNotice("Search the player's name first.");
    return;
  }
  if (reportedName === currentUserName) {
    reportMessage.textContent = "You cannot report yourself.";
    showNotice("You cannot report yourself.");
    return;
  }
  if (!selectedReportReason) {
    reportMessage.textContent = "Choose a report reason first.";
    showNotice("Choose a report reason first.");
    return;
  }
  const reportedAccount = normalizeAccount(demoAccounts[reportedName]);
  if (reportedAccount.locked) {
    lockedNotice.classList.remove("hidden");
    reportMessage.textContent = `${reportedName}'s account is already locked.`;
    showNotice(`${reportedName} is already locked.`);
    return;
  }
  reportedAccount.reportCount += 1;
  reportCount = reportedAccount.reportCount;
  if (reportCount === 1) {
    reportedAccount.points = Math.max(0, reportedAccount.points - 20);
    reportMessage.textContent = `${reportedName} got a warning and lost 20 points.`;
  } else if (reportCount === 2) {
    reportedAccount.points = Math.max(0, reportedAccount.points - 50);
    reportMessage.textContent = `${reportedName} got a final warning and lost 50 points.`;
  } else {
    reportedAccount.locked = true;
    lockedNotice.classList.remove("hidden");
    reportMessage.textContent = `${reportedName}'s account is locked.`;
    if (reportedName === localStorage.getItem(STORAGE_KEYS.currentName)) clearRememberedSession();
  }
  demoAccounts[reportedName] = reportedAccount;
  if (reportedName === currentUserName) {
    currentUser = reportedAccount;
    pointsEl.textContent = currentUser.points;
  }
  saveAccounts();
  showNotice(`Report sent about ${reportedName}: ${selectedReportReason}.`);
});

playGenerated.addEventListener("click", () => {
  useCreateGameSurface();
  toggleGameRun();
});

resetGenerated.addEventListener("click", () => {
  useCreateGameSurface();
  if (generatedSpec) createPlayableWorld(generatedSpec);
});

playGameStart.addEventListener("click", () => {
  usePlayGameSurface();
  toggleGameRun();
});

playGameReset.addEventListener("click", () => {
  if (!currentPlayGame) return;
  openPublishedGame(currentPlayGame);
});

publishGenerated.addEventListener("click", () => {
  if (!generatedSpec) return;
  publishCurrentGame();
});

studioPublish.addEventListener("click", () => {
  ensurePlayableWorld("hand");
  publishCurrentGame();
});

studioPlay.addEventListener("click", () => {
  useCreateGameSurface();
  ensurePlayableWorld("hand");
  playGenerated.click();
});

function publishCurrentGame() {
  syncGameNameBeforePublish();
  const savedGame = {
    ...generatedSpec,
    id: Date.now(),
    creator: currentUserName || "Creator",
    plays: 0,
    savedWorld: serializeGameWorld(),
  };

  publishedGames = [
    savedGame,
    ...publishedGames,
  ];

  savePublishedGames();
  renderMyGames();
  renderPublicGames();
  setGameMessage(`${savedGame.title} was published. Open My Games to see and play it.`);
}

function syncGameNameBeforePublish() {
  const worldName = cleanName(worldNameInput.value);
  if (!generatedSpec || !worldName) return;
  generatedSpec.world = worldName;
  generatedSpec.title = worldName;
  generatedTitle.textContent = worldName;
  worldNameInput.value = worldName;
}

function makePublishedGameCard(game, options = {}) {
  const deleteButton = options.showDelete
    ? `<button class="delete-game-button" type="button" data-delete-game="${game.id}">Delete</button>`
    : "";
  const actionsClass = options.showDelete ? "my-game-actions" : "public-game-actions";
  return `
    <article class="game-card my-game-card" data-game-id="${game.id}">
      <div class="thumb ${thumbClassFor(game.type)}"></div>
      <h3>${escapeText(game.title)}</h3>
      <p>Creator: ${escapeText(game.creator)}</p>
      <p>${escapeText(game.type)} · ${escapeText(game.world)} · ${escapeText(game.action)} · ${escapeText(characterLabel(game.character))}</p>
      <div class="${actionsClass}">
        <button type="button" data-play-game="${game.id}">Play</button>
        ${deleteButton}
      </div>
    </article>
  `;
}

function renderMyGames() {
  if (!myGamesGrid || !myGamesEmpty) return;

  const ownGames = publishedGames.filter(isOwnGame);
  myGamesEmpty.classList.toggle("hidden", ownGames.length > 0);
  myGamesGrid.innerHTML = ownGames.map((game) => makePublishedGameCard(game, { showDelete: true })).join("");

  myGamesGrid.querySelectorAll("[data-play-game]").forEach((button) => {
    button.addEventListener("click", () => {
      const game = publishedGames.find((item) => String(item.id) === button.dataset.playGame);
      if (!game) return;
      openPublishedGame(game);
    });
  });

  myGamesGrid.querySelectorAll("[data-delete-game]").forEach((button) => {
    button.addEventListener("click", () => {
      const game = publishedGames.find((item) => String(item.id) === button.dataset.deleteGame);
      if (!game) return;
      deletePublishedGame(game);
    });
  });
}

function deletePublishedGame(game) {
  if (!isOwnGame(game)) {
    showNotice("You can only delete your own game.");
    return;
  }
  publishedGames = publishedGames.filter((item) => String(item.id) !== String(game.id));
  savePublishedGames();
  renderMyGames();
  renderPublicGames();
  showNotice(`${game.title} deleted.`);
}

function renderPublicGames() {
  if (!publicGamesGrid || !publicGamesEmpty) return;

  publicGamesEmpty.classList.toggle("hidden", publishedGames.length > 0);
  publicGamesGrid.innerHTML = publishedGames.map((game) => makePublishedGameCard(game)).join("");

  publicGamesGrid.querySelectorAll("[data-play-game]").forEach((button) => {
    button.addEventListener("click", () => {
      const game = publishedGames.find((item) => String(item.id) === button.dataset.playGame);
      if (!game) return;
      openPublishedGame(game);
    });
  });
}

function openPublishedGame(game) {
  usePlayGameSurface();
  currentPlayGame = game;
  generatedSpec = { ...game };
  playGameTitle.textContent = generatedSpec.title;
  if (worldNameInput) worldNameInput.value = generatedSpec.title;
  createPlayableWorld(generatedSpec);
  if (game.savedWorld) restoreGameWorld(game.savedWorld, { freshPlay: true });
  setGameMessage(`${generatedSpec.title} loaded. Press Play to start.`);
  showView("playGame");
}

function serializeGameWorld() {
  return {
    blankMap: blankMapActive,
    worldStyle: gameState.worldStyle,
    blockColor: gameState.blockColor,
    uiStyle: gameState.uiStyle || selectedUiStyle,
    physics: { ...gameState.physics },
    score: gameState.score,
    goal: gameState.goal,
    won: gameState.won,
    character: selectedCharacter,
    startPoint: { ...gameState.startPoint },
    player: { ...gameState.player },
    items: gameState.items.map((item) => ({ ...item })),
    hazards: gameState.hazards.map((hazard) => ({ ...hazard })),
    blocks: gameState.blocks.map((block) => ({ ...block })),
    portals: gameState.portals.map((portal) => ({ ...portal })),
    flags: gameState.flags.map((flag) => ({ ...flag })),
    effects: gameState.effects.map((effect) => ({ ...effect })),
  };
}

function restoreGameWorld(world, options = {}) {
  blankMapActive = Boolean(world.blankMap);
  gameState.running = false;
  gamePaused = false;
  gameState.worldStyle = world.worldStyle || "grid";
  gameState.blockColor = world.blockColor || null;
  gameState.uiStyle = world.uiStyle || "round";
  selectedUiStyle = gameState.uiStyle;
  syncUiButtons();
  applyUiStyle();
  gameState.physics = { ...defaultPhysics, ...(world.physics || {}) };
  selectedBackgroundStyle = gameState.worldStyle;
  syncBackgroundButtons();
  gameState.score = options.freshPlay ? 0 : world.score || 0;
  gameState.goal = world.goal || 0;
  gameState.won = options.freshPlay ? false : Boolean(world.won);
  selectedCharacter = world.character || "adventurer";
  syncCharacterButtons();
  gameState.startPoint = world.startPoint || getDefaultStartPoint(blankMapActive);
  gameState.player = {
    ...world.player,
    ...(options.freshPlay ? gameState.startPoint : {}),
    velocityY: 0,
    onGround: false,
    keys: undefined,
  };
  gameState.items = (world.items || []).map((item) => ({
    ...item,
    collected: options.freshPlay ? false : item.collected,
  }));
  gameState.hazards = (world.hazards || []).map((hazard) => ({ ...hazard }));
  gameState.blocks = (world.blocks || []).map((block) => ({ ...block }));
  gameState.portals = (world.portals || []).map((portal) => ({ ...portal }));
  gameState.flags = (world.flags || []).map((flag) => ({ ...flag }));
  gameState.effects = (world.effects || []).map((effect) => ({ ...effect }));
  syncGameStats();
  activePlayButton.textContent = "Play";
  drawGame();
}

function thumbClassFor(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("race")) return "racing";
  if (value.includes("battle")) return "battle";
  if (value.includes("sim")) return "sim";
  return "obby";
}

function characterLabel(character) {
  const labels = {
    adventurer: "Adventurer",
    hoodie: "Hoodie",
    ninja: "Ninja",
    robot: "Robot",
    mage: "Mage",
  };
  return labels[character] || "Adventurer";
}

function effectLabel(effect) {
  const labels = {
    sparkle: "Sparkle",
    fire: "Fire",
    mist: "Mist",
    stars: "Stars",
  };
  return labels[effect] || "Sparkle";
}

function uiLabel(style) {
  const labels = {
    round: "Round",
    glass: "Glass",
    pixel: "Pixel",
    gold: "Gold",
  };
  return labels[style] || "Round";
}

function backgroundLabel(style) {
  const labels = {
    grid: "Black Grid",
    sky: "Sky",
    cloud: "Cloud",
    space: "Space",
    city: "City",
    island: "Island",
    race: "Race",
    arena: "Arena",
    dream: "Dream",
  };
  return labels[style] || "Black Grid";
}

function escapeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target && (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
  if (isTyping) return;

  const key = event.key.toLowerCase();
  if ((key === "delete" || key === "backspace") && selectedEditableItem) {
    event.preventDefault();
    deleteSelectedEditableItem();
    return;
  }

  if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    gameState.keys.add(key);
  }
});

window.addEventListener("keyup", (event) => {
  gameState.keys.delete(event.key.toLowerCase());
});

document.querySelectorAll("[data-touch-key]").forEach((button) => {
  const key = button.dataset.touchKey;
  const release = () => {
    gameState.keys.delete(key);
    button.classList.remove("active-touch");
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!gameState.running && !gameState.won && generatedSpec) {
      toggleGameRun();
    }
    gameState.keys.add(key);
    button.classList.add("active-touch");
    button.setPointerCapture?.(event.pointerId);
  });

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

function buildGeneratedGame() {
  const type = aiAnswers[0] || "Adventure";
  const world = aiAnswers[1] || "Island";
  const action = aiAnswers[2] || "Collect";
  const extra = aiAnswers[3] && aiAnswers[3] !== "No" ? aiAnswers[3] : "";

  generatedSpec = {
    type,
    world,
    action,
    extra,
    title: makeGameTitle(type, world, action),
    theme: makeTheme(type, world, action, extra),
    character: selectedCharacter,
    uiStyle: selectedUiStyle,
  };

  aiQuestion.textContent = "AI made your game. Test it now.";
  answerGrid.innerHTML = `
    <button class="active" type="button">${generatedSpec.type}</button>
    <button type="button">${generatedSpec.world}</button>
    <button type="button">${generatedSpec.action}</button>
    <button type="button">${extra || "No extras"}</button>
  `;
  customAnswer.classList.add("hidden");
  generatedTitle.textContent = generatedSpec.title;
  if (worldNameInput) worldNameInput.value = generatedSpec.title;
  generatedGame.classList.remove("hidden");
  createPlayableWorld(generatedSpec);
  generatedGame.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function ensurePlayableWorld(source) {
  if (generatedSpec) return;
  blankMapActive = false;
  generatedSpec = {
    type: source === "code" ? "Code" : "Hand",
    world: "Builder",
    action: "Create",
    extra: "",
    title: source === "code" ? "Code Mode Game" : "Hand Built Game",
    theme: makeTheme("Adventure", "Island", "Collect", ""),
    character: selectedCharacter,
    uiStyle: selectedUiStyle,
  };
  generatedTitle.textContent = generatedSpec.title;
  if (worldNameInput) worldNameInput.value = generatedSpec.title;
  generatedGame.classList.remove("hidden");
  createPlayableWorld(generatedSpec);
}

function placeHandMaterial(tool, x, y) {
  const snappedX = Math.round(x / 20) * 20;
  const snappedY = Math.round(y / 20) * 20;

  if (tool === "erase") {
    eraseHandMaterial(snappedX, snappedY);
    drawGame();
    return;
  } else if (tool.startsWith("effect:")) {
    const effect = tool.split(":")[1] || "sparkle";
    gameState.effects.push({ x: snappedX, y: snappedY, style: effect, size: 34 });
  } else if (tool === "coin") {
    gameState.items.push({ x: snappedX, y: snappedY, size: 15, collected: false });
    gameState.goal += 1;
    syncGameStats();
  } else if (tool === "danger") {
    gameState.hazards.push({ x: snappedX, y: snappedY, width: 34, height: 26, vx: 0 });
  } else if (tool === "block") {
    gameState.blocks.push({ x: snappedX, y: snappedY, width: 58, height: 24 });
  } else if (tool === "barrier") {
    gameState.blocks.push({ x: snappedX, y: snappedY, width: 58, height: 58, hidden: true });
  } else if (tool === "flag") {
    gameState.flags.push({ x: snappedX, y: snappedY - 72, width: 56, height: 82 });
  } else if (tool === "portal") {
    gameState.portals.push({ x: snappedX, y: snappedY, size: 32 });
  }

  setGameMessage(`Hand Mode placed ${tool.startsWith("effect:") ? "effect" : handToolLabel(tool)}. Press Play to test it.`);
  drawGame();
}

function eraseHandMaterial(x, y) {
  const before = gameState.items.length + gameState.hazards.length + gameState.blocks.length + gameState.portals.length + gameState.flags.length + gameState.effects.length;
  gameState.items = gameState.items.filter((item) => distance(item.x, item.y, x, y) > 34);
  gameState.hazards = gameState.hazards.filter((item) => distance(item.x, item.y, x, y) > 38);
  gameState.blocks = gameState.blocks.filter((item) => !(x >= item.x - 10 && x <= item.x + item.width + 10 && y >= item.y - 10 && y <= item.y + item.height + 10));
  gameState.portals = gameState.portals.filter((item) => distance(item.x, item.y, x, y) > 40);
  gameState.flags = gameState.flags.filter((item) => !(x >= item.x - 10 && x <= item.x + item.width + 10 && y >= item.y - 10 && y <= item.y + item.height + 10));
  gameState.effects = gameState.effects.filter((item) => distance(item.x, item.y, x, y) > 42);
  gameState.goal = gameState.items.length;
  syncGameStats();
  const after = gameState.items.length + gameState.hazards.length + gameState.blocks.length + gameState.portals.length + gameState.flags.length + gameState.effects.length;
  setGameMessage(before === after ? "Nothing close enough to erase." : "Item erased.");
}

function getCanvasPoint(event) {
  const rect = gameCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * gameCanvas.width,
    y: ((event.clientY - rect.top) / rect.height) * gameCanvas.height,
  };
}

function findEditableItem(x, y) {
  const hitLists = [
    { type: "flag", list: gameState.flags },
    { type: "block", list: gameState.blocks },
    { type: "danger", list: gameState.hazards },
    { type: "portal", list: gameState.portals },
    { type: "effect", list: gameState.effects },
    { type: "coin", list: gameState.items },
  ];

  for (const group of hitLists) {
    for (let index = group.list.length - 1; index >= 0; index -= 1) {
      if (editableContains(group.type, group.list[index], x, y)) {
        return { type: group.type, index };
      }
    }
  }
  return null;
}

function editableContains(type, item, x, y) {
  const bounds = getEditableBounds(type, item);
  return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
}

function getEditableItem(ref) {
  const lists = {
    coin: gameState.items,
    danger: gameState.hazards,
    block: gameState.blocks,
    flag: gameState.flags,
    portal: gameState.portals,
    effect: gameState.effects,
  };
  return lists[ref.type]?.[ref.index] || null;
}

function getEditableAnchor(ref) {
  const item = getEditableItem(ref);
  if (!item) return { x: 0, y: 0 };
  if (ref.type === "coin" || ref.type === "effect") return { x: item.x, y: item.y };
  return { x: item.x, y: item.y };
}

function getEditableBounds(type, item) {
  if (type === "coin") {
    const size = item.size || 15;
    return { x: item.x - size, y: item.y - size, width: size * 2, height: size * 2 };
  }
  if (type === "effect") {
    const size = item.size || 34;
    return { x: item.x - size, y: item.y - size, width: size * 2, height: size * 2 };
  }
  if (type === "portal") return { x: item.x, y: item.y, width: item.size, height: item.size };
  return { x: item.x, y: item.y, width: item.width, height: item.height };
}

function moveEditableItem(ref, x, y) {
  const item = getEditableItem(ref);
  if (!item) return;
  if (ref.type === "coin" || ref.type === "effect") {
    item.x = clamp(Math.round(x / 10) * 10, 10, gameCanvas.width - 10);
    item.y = clamp(Math.round(y / 10) * 10, 10, gameCanvas.height - 10);
    return;
  }

  const width = ref.type === "portal" ? item.size : item.width;
  const height = ref.type === "portal" ? item.size : item.height;
  item.x = clamp(Math.round(x / 10) * 10, 0, gameCanvas.width - width);
  item.y = clamp(Math.round(y / 10) * 10, 0, gameCanvas.height - height);
}

function deleteSelectedEditableItem() {
  if (!selectedEditableItem) return false;
  const lists = {
    coin: gameState.items,
    danger: gameState.hazards,
    block: gameState.blocks,
    flag: gameState.flags,
    portal: gameState.portals,
    effect: gameState.effects,
  };
  const list = lists[selectedEditableItem.type];
  if (!list?.[selectedEditableItem.index]) return false;
  list.splice(selectedEditableItem.index, 1);
  gameState.goal = gameState.items.length;
  syncGameStats();
  setGameMessage(`${editableLabel(selectedEditableItem.type)} deleted.`);
  selectedEditableItem = null;
  dragEditableItem = null;
  drawGame();
  return true;
}

function editableLabel(type) {
  const labels = {
    coin: "Coin",
    danger: "Danger",
    block: "Block",
    flag: "Flag",
    portal: "Portal",
    effect: "Effect",
  };
  return labels[type] || "Item";
}

function handToolLabel(tool) {
  const labels = {
    coin: "coin",
    danger: "danger",
    block: "block",
    barrier: "invisible barrier",
    flag: "flag",
    portal: "portal",
    erase: "eraser",
  };
  return labels[tool] || tool;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function applyCodeRules(source) {
  const rules = {};
  source.split("\n").forEach((line) => {
    const [rawKey, rawValue] = line.split("=");
    if (!rawKey || !rawValue) return;
    rules[rawKey.trim().toLowerCase()] = rawValue.trim();
  });

  if (rules.speed) {
    const speed = Number(rules.speed);
    if (Number.isFinite(speed)) gameState.player.speed = clamp(speed, 1, 10);
  }

  if (rules.goal) {
    const goal = Number(rules.goal);
    if (Number.isFinite(goal)) {
      gameState.goal = clamp(Math.round(goal), 1, 20);
      while (gameState.items.length < gameState.goal) {
        gameState.items.push({
          x: 120 + gameState.items.length * 70,
          y: 110 + (gameState.items.length % 3) * 55,
          size: 15,
          collected: false,
        });
      }
      syncGameStats();
    }
  }

  if (rules.theme) {
    generatedSpec.theme = makeTheme("", rules.theme, "", "");
  }

  if (rules.title) {
    generatedSpec.title = rules.title;
    generatedTitle.textContent = generatedSpec.title;
  }

  codeMessage.textContent = "Code applied. Press Play to test your rules.";
  setGameMessage("Code Mode changed the game rules.");
  drawGame();
}

function makeGameTitle(type, world, action) {
  const first = cleanName(world) || "Mystery";
  const second = cleanName(type) || "Adventure";
  const verb = cleanName(action) || "Quest";
  if (second.toLowerCase() === "racing") return `${first} Rush`;
  if (second.toLowerCase() === "obby") return `${first} Obby`;
  if (second.toLowerCase() === "battle") return `${first} Battle`;
  if (second.toLowerCase() === "simulator") return `${first} Simulator`;
  return `${first} ${verb} Quest`;
}

function makeTheme(type, world, action, extra) {
  const words = `${type} ${world} ${action} ${extra}`.toLowerCase();
  if (words.includes("space")) return { sky: "#101827", ground: "#4f46e5", block: "#22d3ee", danger: "#f43f5e", item: "#fde047" };
  if (words.includes("city")) return { sky: "#93c5fd", ground: "#64748b", block: "#f97316", danger: "#ef4444", item: "#fde047" };
  if (words.includes("school")) return { sky: "#bae6fd", ground: "#60a5fa", block: "#facc15", danger: "#fb7185", item: "#34d399" };
  if (words.includes("forest")) return { sky: "#bbf7d0", ground: "#22c55e", block: "#92400e", danger: "#dc2626", item: "#fde047" };
  return { sky: "#9ed7ff", ground: "#7dde9e", block: "#8e6cff", danger: "#ef4444", item: "#ffc857" };
}

function createPlayableWorld(spec) {
  cancelAnimationFrame(gameLoop);
  blankMapActive = Boolean(spec.blankMap);
  gameState.worldStyle = spec.worldStyle || "grid";
  gameState.blockColor = spec.blockColor || null;
  gameState.uiStyle = spec.uiStyle || selectedUiStyle || "round";
  selectedUiStyle = gameState.uiStyle;
  syncUiButtons();
  applyUiStyle();
  gameState.physics = { ...defaultPhysics, ...(spec.physics || {}) };
  selectedBackgroundStyle = gameState.worldStyle;
  syncBackgroundButtons();
  selectedCharacter = spec.character || selectedCharacter || "adventurer";
  syncCharacterButtons();
  gameState.running = false;
  gamePaused = false;
  activePlayButton.textContent = "Play";
  gameState.score = 0;
  gameState.won = false;
  gameState.goal = blankMapActive ? 0 : spec.type.toLowerCase() === "simulator" ? 8 : 6;
  gameState.startPoint = getDefaultStartPoint(blankMapActive);
  gameState.player = {
    x: gameState.startPoint.x,
    y: gameState.startPoint.y,
    size: 24,
    speed: spec.type.toLowerCase() === "racing" ? 5.4 : 4.2,
    velocityY: 0,
    onGround: false,
  };
  gameState.items = blankMapActive ? [] : makeItems(gameState.goal);
  gameState.hazards = blankMapActive ? [] : makeHazards(spec.type);
  gameState.blocks = blankMapActive ? [] : [
    { x: 0, y: 288, width: 225, height: 58 },
    { x: 290, y: 238, width: 120, height: 48 },
    { x: 500, y: 260, width: 150, height: 50 },
    { x: 660, y: 190, width: 100, height: 156 },
  ];
  gameState.portals = [];
  gameState.flags = [];
  gameState.effects = [];
  syncGameStats();
  setGameMessage(blankMapActive
    ? "Blank black map ready. Use Hand Mode to place blocks, coins, danger, and a flag."
    : `AI created a 2D ${spec.title}. Move with A/D or arrows. Jump with W or Up.`);
  drawGame();
}

function getDefaultStartPoint(isBlankMap) {
  return { x: 92, y: isBlankMap ? 250 : 230 };
}

function syncCharacterButtons() {
  characterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.character === selectedCharacter);
  });
}

function syncBackgroundButtons() {
  backgroundButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.backgroundStyle === selectedBackgroundStyle);
  });
}

function syncUiButtons() {
  uiButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.uiStyle === selectedUiStyle);
  });
}

function makeItems(count) {
  return Array.from({ length: count }, (_, index) => ({
    x: 185 + index * 72,
    y: 122 + (index % 2) * 42,
    size: 15,
    collected: false,
  }));
}

function makeHazards(type) {
  const amount = type.toLowerCase() === "battle" ? 5 : 3;
  return Array.from({ length: amount }, (_, index) => ({
    x: 250 + index * 105,
    y: 312,
    width: 34,
    height: 24,
    vx: 0,
  }));
}

function runGame() {
  if (!gameState.running) return;
  updateGame();
  drawGame();
  if (gameState.running) gameLoop = requestAnimationFrame(runGame);
}

function toggleGameRun() {
  if (gameState.running) {
    gameState.running = false;
    gamePaused = true;
    cancelAnimationFrame(gameLoop);
    activePlayButton.textContent = "Continue";
    return;
  }

  cancelAnimationFrame(gameLoop);
  if (!gamePaused) resetPlayerToStart();
  gamePaused = false;
  gameState.running = true;
  activePlayButton.textContent = "Pause";
  runGame();
}

function resetPlayerToStart() {
  gameState.player.x = gameState.startPoint.x;
  gameState.player.y = gameState.startPoint.y;
  gameState.player.velocityY = 0;
  gameState.player.onGround = false;
  gameState.won = false;
  gamePaused = false;
  gameState.score = 0;
  gameState.items.forEach((item) => {
    item.collected = false;
  });
  syncGameStats();
  drawGame();
}

function updateGame() {
  const player = gameState.player;
  const previousX = player.x;
  const previousY = player.y;
  if (gameState.keys.has("arrowleft") || gameState.keys.has("a")) player.x -= player.speed;
  if (gameState.keys.has("arrowright") || gameState.keys.has("d")) player.x += player.speed;
  if ((gameState.keys.has("arrowup") || gameState.keys.has("w")) && player.onGround) {
    player.velocityY = gameState.physics.jump;
    player.onGround = false;
  }

  player.velocityY += gameState.physics.gravity;
  player.y += player.velocityY;
  player.x = clamp(player.x, 10, activeCanvas.width - 34);
  player.onGround = false;

  for (const block of gameState.blocks) {
    const falling = player.velocityY >= 0;
    const feet = player.y + player.size;
    const wasAbove = feet - player.velocityY <= block.y + 2;
    if (
      falling &&
      wasAbove &&
      player.x + player.size > block.x &&
      player.x < block.x + block.width &&
      feet >= block.y &&
      feet <= block.y + block.height
    ) {
      player.y = block.y - player.size;
      player.velocityY = 0;
      player.onGround = true;
    }
  }

  for (const block of gameState.blocks) {
    if (!block.hidden) continue;
    if (!rectsOverlap(player.x, player.y, player.size, player.size, block.x, block.y, block.width, block.height)) continue;

    if (previousY + player.size <= block.y) {
      player.y = block.y - player.size;
      player.velocityY = 0;
      player.onGround = true;
    } else if (previousY >= block.y + block.height) {
      player.y = block.y + block.height;
      player.velocityY = 0;
    } else if (previousX + player.size <= block.x) {
      player.x = block.x - player.size;
    } else if (previousX >= block.x + block.width) {
      player.x = block.x + block.width;
    } else {
      player.x = previousX;
    }
  }

  if (player.y > activeCanvas.height - 20) {
    resetPlayerToStart();
    setGameMessage("You fell. Try the jump again.");
  }

  for (const hazard of gameState.hazards) {
    hazard.x += hazard.vx;
    if (hazard.x < 80 || hazard.x > activeCanvas.width - 80) hazard.vx *= -1;
    if (rectsOverlap(player.x, player.y, player.size, player.size, hazard.x, hazard.y, hazard.width, hazard.height)) {
      resetPlayerToStart();
      setGameMessage("Spikes touched you. Try another path.");
    }
  }

  for (const portal of gameState.portals) {
    if (rectsOverlap(player.x, player.y, player.size, player.size, portal.x, portal.y, portal.size, portal.size)) {
      winGame("Portal reached. Your hand-built exit works.");
    }
  }

  for (const flag of gameState.flags) {
    if (rectsOverlap(player.x, player.y, player.size, player.size, flag.x, flag.y, flag.width, flag.height)) {
      winGame(`You reached the flag. ${generatedSpec.title} complete.`);
    }
  }

  if (!blankMapActive && rectsOverlap(player.x, player.y, player.size, player.size, 704, 112, 56, 82)) {
    winGame(`You reached the flag. ${generatedSpec.title} complete.`);
  }

  for (const item of gameState.items) {
    if (!item.collected && rectsOverlap(player.x, player.y, player.size, player.size, item.x, item.y, item.size, item.size)) {
      item.collected = true;
      gameState.score += 1;
      syncGameStats();
      if (canEarnPointsFromCurrentGame()) {
        currentUser.points += 1;
        pointsEl.textContent = currentUser.points;
        saveAccounts();
        setGameMessage("Coin collected. +1 point. Reach the flag to win anytime.");
      } else {
        setGameMessage("Coin collected. No points for playing your own game.");
      }
    }
  }
}

function canEarnPointsFromCurrentGame() {
  return Boolean(
    currentUser &&
    generatedSpec?.creator &&
    generatedSpec.creator !== currentUserName
  );
}

function winGame(message) {
  if (gameState.won) return;
  gameState.won = true;
  gameState.running = false;
  gamePaused = false;
  cancelAnimationFrame(gameLoop);
  activePlayButton.textContent = "Play Again";
  setGameMessage(message);
  if (generatedSpec?.creator && generatedSpec.creator !== currentUserName && demoAccounts[generatedSpec.creator]) {
    demoAccounts[generatedSpec.creator].points += 5;
    saveAccounts();
  }
}

function drawGame() {
  const ctx = activeCanvas.getContext("2d");
  const theme = generatedSpec?.theme || makeTheme("", "", "", "");
  ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

  if (blankMapActive) {
    drawWorldBackground(ctx, theme);
    for (const block of gameState.blocks) {
      if (!block.hidden) draw2dPlatform(ctx, block.x, block.y, block.width, block.height, block.color || gameState.blockColor || theme.block);
    }
    for (const item of gameState.items) {
      if (!item.collected) draw2dCoin(ctx, item.x, item.y, item.size, theme.item);
    }
    for (const hazard of gameState.hazards) draw2dSpikes(ctx, hazard.x, hazard.y, hazard.width, hazard.height);
    for (const portal of gameState.portals) draw2dPortal(ctx, portal.x, portal.y, portal.size);
    for (const flag of gameState.flags) draw2dFlag(ctx, flag.x, flag.y);
    for (const effect of gameState.effects) draw2dEffect(ctx, effect);
    drawEditableSelection(ctx);
    draw2dPlayer(ctx, gameState.player.x, gameState.player.y, gameState.player.size);
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, activeCanvas.height);
  sky.addColorStop(0, theme.sky);
  sky.addColorStop(0.55, lighten(theme.sky, 42));
  sky.addColorStop(1, "#2c7da8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);

  drawClouds(ctx);
  draw2dMountains(ctx);
  draw2dTree(ctx, 62, 164);

  for (const block of gameState.blocks) {
    if (!block.hidden) draw2dPlatform(ctx, block.x, block.y, block.width, block.height, block.color || gameState.blockColor || theme.block);
  }
  for (const item of gameState.items) {
    if (!item.collected) draw2dCoin(ctx, item.x, item.y, item.size, theme.item);
  }
  for (const hazard of gameState.hazards) draw2dSpikes(ctx, hazard.x, hazard.y, hazard.width, hazard.height);
  for (const portal of gameState.portals) draw2dPortal(ctx, portal.x, portal.y, portal.size);
  for (const flag of gameState.flags) draw2dFlag(ctx, flag.x, flag.y);
  for (const effect of gameState.effects) draw2dEffect(ctx, effect);
  drawEditableSelection(ctx);
  draw2dFlag(ctx, 704, 112);
  draw2dSlime(ctx, 600, 236);
  draw2dPlayer(ctx, gameState.player.x, gameState.player.y, gameState.player.size);
}

function drawWorldBackground(ctx, theme) {
  const style = gameState.worldStyle || "grid";

  if (style === "sky" || style === "cloud") {
    const sky = ctx.createLinearGradient(0, 0, 0, activeCanvas.height);
    sky.addColorStop(0, "#7dd3fc");
    sky.addColorStop(0.65, "#dbeafe");
    sky.addColorStop(1, "#60a5fa");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    drawClouds(ctx);
    if (style === "cloud") {
      ctx.fillStyle = "rgba(255,255,255,0.62)";
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.ellipse(95 + i * 160, 260 + (i % 2) * 26, 90, 22, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return;
  }

  if (style === "race") {
    ctx.fillStyle = "#07111f";
    ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    const track = ctx.createLinearGradient(0, 90, 0, activeCanvas.height);
    track.addColorStop(0, "#1f2937");
    track.addColorStop(1, "#020617");
    ctx.fillStyle = track;
    ctx.fillRect(0, 95, activeCanvas.width, 250);
    ctx.strokeStyle = "rgba(96, 165, 250, 0.28)";
    ctx.lineWidth = 3;
    for (let y = 112; y < activeCanvas.height; y += 44) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(activeCanvas.width, y + 18);
      ctx.stroke();
    }
    ctx.strokeStyle = "#facc15";
    ctx.setLineDash([20, 18]);
    ctx.beginPath();
    ctx.moveTo(0, 222);
    ctx.lineTo(activeCanvas.width, 222);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  if (style === "city") {
    const sky = ctx.createLinearGradient(0, 0, 0, activeCanvas.height);
    sky.addColorStop(0, "#0f172a");
    sky.addColorStop(1, "#334155");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    for (let i = 0; i < 12; i += 1) {
      const w = 42 + (i % 3) * 14;
      const h = 95 + (i % 4) * 24;
      const x = i * 72;
      ctx.fillRect(x, activeCanvas.height - h, w, h);
      ctx.fillStyle = "rgba(250, 204, 21, 0.6)";
      ctx.fillRect(x + 10, activeCanvas.height - h + 18, 8, 10);
      ctx.fillRect(x + 26, activeCanvas.height - h + 42, 8, 10);
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    }
    return;
  }

  if (style === "island") {
    const sky = ctx.createLinearGradient(0, 0, 0, activeCanvas.height);
    sky.addColorStop(0, "#7dd3fc");
    sky.addColorStop(0.58, "#bfdbfe");
    sky.addColorStop(0.59, "#0ea5e9");
    sky.addColorStop(1, "#0369a1");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    drawClouds(ctx);
    ctx.fillStyle = "rgba(34, 197, 94, 0.72)";
    ctx.beginPath();
    ctx.ellipse(140, 270, 150, 36, 0, 0, Math.PI * 2);
    ctx.ellipse(560, 242, 180, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (style === "space") {
    ctx.fillStyle = "#050816";
    ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    for (let i = 0; i < 60; i += 1) {
      const x = (i * 137) % activeCanvas.width;
      const y = (i * 71) % activeCanvas.height;
      ctx.fillStyle = i % 5 === 0 ? "#67e8f9" : "rgba(255,255,255,0.78)";
      ctx.fillRect(x, y, i % 4 === 0 ? 3 : 2, i % 4 === 0 ? 3 : 2);
    }
    ctx.strokeStyle = "rgba(124, 58, 237, 0.3)";
    drawBlankGrid(ctx);
    return;
  }

  if (style === "arena") {
    const arena = ctx.createRadialGradient(activeCanvas.width / 2, activeCanvas.height / 2, 40, activeCanvas.width / 2, activeCanvas.height / 2, 390);
    arena.addColorStop(0, "#431407");
    arena.addColorStop(1, "#0f172a");
    ctx.fillStyle = arena;
    ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    ctx.strokeStyle = "rgba(248, 113, 113, 0.2)";
    for (let x = 0; x <= activeCanvas.width; x += 70) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 90, activeCanvas.height);
      ctx.stroke();
    }
    return;
  }

  if (style === "dream") {
    const dream = ctx.createLinearGradient(0, 0, activeCanvas.width, activeCanvas.height);
    dream.addColorStop(0, "#f0abfc");
    dream.addColorStop(0.5, "#93c5fd");
    dream.addColorStop(1, "#c4b5fd");
    ctx.fillStyle = dream;
    ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    for (let i = 0; i < 9; i += 1) {
      ctx.beginPath();
      ctx.arc(80 + i * 85, 70 + (i % 3) * 55, 18 + (i % 4) * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
  drawBlankGrid(ctx);
}

function drawBlankGrid(ctx) {
  ctx.strokeStyle = "rgba(148, 163, 184, 0.16)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= activeCanvas.width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, activeCanvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= activeCanvas.height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(activeCanvas.width, y);
    ctx.stroke();
  }
}

function draw2dMountains(ctx) {
  ctx.fillStyle = "rgba(37, 111, 158, 0.52)";
  ctx.beginPath();
  ctx.moveTo(0, 285);
  ctx.lineTo(145, 132);
  ctx.lineTo(300, 285);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(30, 94, 140, 0.55)";
  ctx.beginPath();
  ctx.moveTo(250, 285);
  ctx.lineTo(440, 115);
  ctx.lineTo(625, 285);
  ctx.closePath();
  ctx.fill();
}

function draw2dTree(ctx, x, y) {
  ctx.fillStyle = "#7a3f1d";
  ctx.fillRect(x + 32, y + 60, 26, 92);
  ctx.fillStyle = "#3fa536";
  ctx.beginPath();
  ctx.arc(x + 44, y + 42, 48, 0, Math.PI * 2);
  ctx.arc(x + 20, y + 62, 36, 0, Math.PI * 2);
  ctx.arc(x + 70, y + 66, 34, 0, Math.PI * 2);
  ctx.fill();
}

function draw2dPlatform(ctx, x, y, width, height, color) {
  ctx.fillStyle = "#62c644";
  ctx.fillRect(x, y, width, 14);
  ctx.fillStyle = color === "#8e6cff" ? "#7a4b28" : color;
  ctx.fillRect(x, y + 14, width, height - 14);
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 2;
  for (let tx = x; tx < x + width; tx += 30) {
    ctx.strokeRect(tx, y + 14, Math.min(30, x + width - tx), 28);
  }
}

function draw2dCoin(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.75, size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff7b0";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function draw2dSpikes(ctx, x, y, width, height) {
  ctx.fillStyle = "#e2e8f0";
  const count = Math.max(1, Math.floor(width / 18));
  for (let i = 0; i < count; i += 1) {
    const sx = x + i * 18;
    ctx.beginPath();
    ctx.moveTo(sx, y + height);
    ctx.lineTo(sx + 9, y);
    ctx.lineTo(sx + 18, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.stroke();
  }
}

function draw2dPortal(ctx, x, y, size) {
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size / 2, size * 0.48, size * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawEditableSelection(ctx) {
  if (!selectedEditableItem) return;
  const item = getEditableItem(selectedEditableItem);
  if (!item) return;
  const bounds = getEditableBounds(selectedEditableItem.type, item);
  ctx.save();
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 5]);
  ctx.strokeRect(bounds.x - 6, bounds.y - 6, bounds.width + 12, bounds.height + 12);
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
  ctx.fillRect(bounds.x - 6, bounds.y - 6, bounds.width + 12, bounds.height + 12);
  ctx.restore();
}

function draw2dEffect(ctx, effect) {
  const size = effect.size || 34;
  const x = effect.x;
  const y = effect.y;
  const style = effect.style || "sparkle";

  if (style === "fire") {
    ctx.fillStyle = "rgba(239, 68, 68, 0.28)";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.55);
    ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.05, x + size * 0.12, y + size * 0.45);
    ctx.quadraticCurveTo(x - size * 0.35, y + size * 0.05, x, y - size * 0.55);
    ctx.fill();
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.arc(x + 2, y + 3, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (style === "mist") {
    ctx.fillStyle = "rgba(226, 232, 240, 0.45)";
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.ellipse(x - 22 + i * 15, y + (i % 2) * 6, size * 0.42, size * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (style === "stars") {
    ctx.fillStyle = "#fde047";
    for (let i = 0; i < 5; i += 1) {
      const px = x + Math.cos(i * 1.3) * size * 0.45;
      const py = y + Math.sin(i * 1.3) * size * 0.32;
      drawStar(ctx, px, py, 5 + (i % 2) * 2);
    }
    return;
  }

  ctx.strokeStyle = "#f0abfc";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    const angle = (Math.PI / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(angle) * size * 0.5, y - Math.sin(angle) * size * 0.5);
    ctx.lineTo(x + Math.cos(angle) * size * 0.5, y + Math.sin(angle) * size * 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(ctx, x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 === 0 ? radius : radius * 0.42;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function draw2dFlag(ctx, x, y) {
  ctx.fillStyle = "#7c3f1d";
  ctx.fillRect(x, y, 6, 82);
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 6);
  ctx.lineTo(x + 54, y + 22);
  ctx.lineTo(x + 6, y + 38);
  ctx.closePath();
  ctx.fill();
}

function draw2dSlime(ctx, x, y) {
  ctx.fillStyle = "#a855f7";
  ctx.beginPath();
  ctx.roundRect(x, y, 52, 34, 16);
  ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.fillRect(x + 14, y + 12, 5, 5);
  ctx.fillRect(x + 32, y + 12, 5, 5);
}

function draw2dPlayer(ctx, x, y, size) {
  const cx = x + size / 2;
  const footY = y + size + 1;
  const style = getCharacterStyle(selectedCharacter);

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(cx, footY + 2, size * 0.6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(69, 26, 3, 0.5)";

  ctx.fillStyle = style.pants;
  ctx.fillRect(cx - 6, y + 15, 5, 11);
  ctx.fillRect(cx + 2, y + 15, 5, 11);
  ctx.fillStyle = style.shoes;
  ctx.fillRect(cx - 8, footY - 2, 8, 4);
  ctx.fillRect(cx + 2, footY - 2, 8, 4);

  ctx.fillStyle = style.shirt;
  ctx.beginPath();
  ctx.roundRect(cx - 10, y + 10, 20, 12, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = style.skin;
  ctx.fillRect(cx - 14, y + 13, 5, 8);
  ctx.fillRect(cx + 10, y + 13, 5, 8);

  ctx.fillStyle = style.skin;
  ctx.beginPath();
  ctx.arc(cx, y + 4, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = style.hair;
  ctx.beginPath();
  ctx.arc(cx - 5, y - 3, 6, Math.PI * 0.7, Math.PI * 1.9);
  ctx.arc(cx + 2, y - 3, 7, Math.PI * 0.95, Math.PI * 2.08);
  ctx.arc(cx + 8, y + 2, 4, Math.PI * 1.35, Math.PI * 2.35);
  ctx.fill();
  ctx.fillRect(cx - 9, y - 1, 18, 5);

  if (style.mask) {
    ctx.fillStyle = style.mask;
    ctx.fillRect(cx - 8, y + 1, 16, 6);
  }

  if (style.robot) {
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 6, y - 2, 12, 10);
  }

  ctx.fillStyle = style.eye;
  ctx.fillRect(cx - 4, y + 4, 2, 2);
  ctx.fillRect(cx + 4, y + 4, 2, 2);

  ctx.fillStyle = style.mouth;
  ctx.fillRect(cx + 1, y + 8, 4, 2);
}

function getCharacterStyle(character) {
  const styles = {
    adventurer: { skin: "#f7bf8c", hair: "#4a250f", shirt: "#f97316", pants: "#1d4ed8", shoes: "#111827", eye: "#111827", mouth: "#9a3412" },
    hoodie: { skin: "#f7bf8c", hair: "#2f1608", shirt: "#2563eb", pants: "#111827", shoes: "#020617", eye: "#111827", mouth: "#9a3412" },
    ninja: { skin: "#f7bf8c", hair: "#020617", shirt: "#111827", pants: "#374151", shoes: "#020617", eye: "#f8fafc", mouth: "#020617", mask: "#020617" },
    robot: { skin: "#cbd5e1", hair: "#94a3b8", shirt: "#64748b", pants: "#475569", shoes: "#1f2937", eye: "#38bdf8", mouth: "#0f172a", robot: true },
    mage: { skin: "#f7bf8c", hair: "#6d28d9", shirt: "#8b5cf6", pants: "#5b21b6", shoes: "#312e81", eye: "#111827", mouth: "#7c2d12" },
  };
  return styles[character] || styles.adventurer;
}

function drawClouds(ctx) {
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.ellipse(80 + i * 140, 45 + (i % 2) * 18, 35, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(104 + i * 140, 39 + (i % 2) * 18, 23, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPerspectiveGround(ctx, theme) {
  const horizon = 112;
  const vanishingX = gameCanvas.width / 2;

  const ground = ctx.createLinearGradient(0, horizon, 0, gameCanvas.height);
  ground.addColorStop(0, lighten(theme.ground, 28));
  ground.addColorStop(1, theme.ground);
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.moveTo(0, gameCanvas.height);
  ctx.lineTo(110, horizon);
  ctx.lineTo(gameCanvas.width - 110, horizon);
  ctx.lineTo(gameCanvas.width, gameCanvas.height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  for (let i = -7; i <= 7; i += 1) {
    ctx.beginPath();
    ctx.moveTo(vanishingX, horizon);
    ctx.lineTo(vanishingX + i * 95, gameCanvas.height);
    ctx.stroke();
  }

  for (let z = 0; z < 8; z += 1) {
    const y = horizon + 18 + z * z * 4.1;
    const left = 110 - z * 20;
    const right = gameCanvas.width - 110 + z * 20;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }
}

function projectPoint(x, y) {
  const horizon = 112;
  const depth = clamp(y, 55, 330) / 330;
  const scale = 0.32 + depth * 1.05;
  const center = gameCanvas.width / 2;
  return {
    x: center + (x - center) * scale,
    y: horizon + depth * depth * 235,
    scale,
  };
}

function drawCube(ctx, x, y, width, height, color) {
  const p = projectPoint(x, y);
  const w = width * p.scale;
  const h = height * p.scale;
  const d = 18 * p.scale;
  const left = p.x - w / 2;
  const top = p.y - h;

  ctx.fillStyle = color;
  ctx.fillRect(left, top, w, h);

  ctx.fillStyle = lighten(color, 26);
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + d, top - d);
  ctx.lineTo(left + w + d, top - d);
  ctx.lineTo(left + w, top);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = darken(color, 20);
  ctx.beginPath();
  ctx.moveTo(left + w, top);
  ctx.lineTo(left + w + d, top - d);
  ctx.lineTo(left + w + d, top + h - d);
  ctx.lineTo(left + w, top + h);
  ctx.closePath();
  ctx.fill();
}

function drawCoin3d(ctx, x, y, size, color) {
  const p = projectPoint(x, y);
  const radius = size * p.scale;
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + radius * 0.8, radius * 1.1, radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - radius * 0.6, radius * 0.72, radius, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff7b0";
  ctx.lineWidth = Math.max(1, 2 * p.scale);
  ctx.stroke();
}

function drawPortal3d(ctx, x, y, size) {
  const p = projectPoint(x, y);
  const w = size * p.scale;
  const h = size * 1.45 * p.scale;
  const glow = ctx.createRadialGradient(p.x, p.y - h / 2, 2, p.x, p.y - h / 2, h);
  glow.addColorStop(0, "#ffffff");
  glow.addColorStop(0.35, "#6ee7c8");
  glow.addColorStop(1, "#7c3aed");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - h / 2, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d8b4fe";
  ctx.lineWidth = Math.max(2, 4 * p.scale);
  ctx.stroke();
}

function drawPlayer3d(ctx, x, y, size) {
  const p = projectPoint(x, y);
  const s = size * p.scale;
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + s * 1.35, s * 0.9, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#17202a";
  ctx.fillRect(p.x - s * 0.38, p.y, s * 0.76, s * 1.15);
  ctx.fillStyle = "#3969ff";
  ctx.beginPath();
  ctx.arc(p.x, p.y - s * 0.22, s * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffce57";
  ctx.fillRect(p.x - s * 0.22, p.y + s * 1.15, s * 0.16, s * 0.5);
  ctx.fillRect(p.x + s * 0.08, p.y + s * 1.15, s * 0.16, s * 0.5);
}

function lighten(color, amount) {
  return shadeColor(color, amount);
}

function darken(color, amount) {
  return shadeColor(color, -amount);
}

function shadeColor(color, amount) {
  const hex = color.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((ch) => ch + ch).join("") : hex;
  const num = Number.parseInt(full, 16);
  const r = clamp((num >> 16) + amount, 0, 255);
  const g = clamp(((num >> 8) & 255) + amount, 0, 255);
  const b = clamp((num & 255) + amount, 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

renderQuestion();
