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
const choiceButtons = document.querySelectorAll("[data-auth-mode]");
const navButtons = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");
const assetTabButtons = document.querySelectorAll("[data-asset-tab]");
const assetPanels = document.querySelectorAll("[data-asset-panel]");
const characterButtons = document.querySelectorAll("[data-character]");
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
const giftAmount = document.querySelector("#giftAmount");
const sendPoints = document.querySelector("#sendPoints");
const giftMessage = document.querySelector("#giftMessage");
const sendReport = document.querySelector("#sendReport");
const lockedNotice = document.querySelector("#lockedNotice");
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

const gameState = {
  running: false,
  score: 0,
  goal: 6,
  startPoint: { x: 92, y: 230 },
  player: { x: 70, y: 260, size: 22, speed: 4 },
  items: [],
  hazards: [],
  blocks: [],
  portals: [],
  flags: [],
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

restoreRememberedSession();

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.authMode);
  });
});

[nameInput, passwordInput].forEach((input) => input.addEventListener("input", validateAuth));

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = cleanName(nameInput.value);
  const password = passwordInput.value;
  const existing = demoAccounts[name];

  if (authMode === "first" && existing) {
    authMessage.textContent = "This name is already taken.";
    return;
  }

  if (authMode === "returning" && (!existing || existing.password !== password)) {
    authMessage.textContent = "Name or password is not correct.";
    return;
  }

  currentUser = existing || { password, points: 0 };
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

function rememberSession(name) {
  localStorage.setItem(STORAGE_KEYS.currentName, name);
}

function clearRememberedSession() {
  localStorage.removeItem(STORAGE_KEYS.currentName);
}

function signIn(name, user) {
  currentUser = user;
  currentUserName = name;
  welcomeName.textContent = name;
  userAvatar.textContent = name.charAt(0).toUpperCase();
  pointsEl.textContent = currentUser.points;
  rememberSession(name);
  authScreen.classList.remove("active");
  mainScreen.classList.add("active");
}

function restoreRememberedSession() {
  const savedName = localStorage.getItem(STORAGE_KEYS.currentName);
  if (savedName && demoAccounts[savedName]) {
    signIn(savedName, demoAccounts[savedName]);
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
    handMessage.textContent = `Selected ${handTool}. Click inside the game to place it.`;
    ensurePlayableWorld("hand");
  });
});

startBlankMap.addEventListener("click", () => {
  const worldName = cleanName(worldNameInput.value) || "Blank Black Map";
  generatedSpec = {
    type: "Hand",
    world: worldName,
    action: "Create",
    extra: "",
    title: worldName,
    theme: makeTheme("blank", "black", "create", ""),
    blankMap: true,
    character: selectedCharacter,
  };
  generatedTitle.textContent = generatedSpec.title;
  generatedGame.classList.remove("hidden");
  createPlayableWorld(generatedSpec);
  handMessage.textContent = "Blank black map started. Pick a material, then click inside the game.";
});

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
  const handModeActive = !document.querySelector('[data-mode-panel="hand"]').classList.contains("hidden");
  if (!handModeActive) return;
  ensurePlayableWorld("hand");
  const rect = gameCanvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * gameCanvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * gameCanvas.height;
  placeHandMaterial(handTool, x, y);
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
  const name = cleanName(friendSearch.value);
  if (!name) {
    friendMessage.textContent = "Write a player's name before sending an invitation.";
    return;
  }
  if (name === currentUser.name) {
    friendMessage.textContent = "You cannot send a friend invitation to yourself.";
    return;
  }
  friendMessage.textContent = `Friend invitation sent to ${name}.`;
});

sendPoints.addEventListener("click", () => {
  giftMessage.textContent = "Add a friend before sending points.";
});

sendReport.addEventListener("click", () => {
  reportCount += 1;
  if (reportCount === 1) {
    currentUser.points = Math.max(0, currentUser.points - 20);
  } else if (reportCount === 2) {
    currentUser.points = Math.max(0, currentUser.points - 50);
  } else {
    lockedNotice.classList.remove("hidden");
  }
  pointsEl.textContent = currentUser.points;
  saveAccounts();
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

  myGamesEmpty.classList.toggle("hidden", publishedGames.length > 0);
  myGamesGrid.innerHTML = publishedGames.map((game) => makePublishedGameCard(game, { showDelete: game.creator === currentUserName })).join("");

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
  if (game.creator !== currentUserName) return;
  publishedGames = publishedGames.filter((item) => item.id !== game.id);
  savePublishedGames();
  renderMyGames();
  renderPublicGames();
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
  };
}

function restoreGameWorld(world, options = {}) {
  blankMapActive = Boolean(world.blankMap);
  gameState.running = false;
  gamePaused = false;
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
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    gameState.keys.add(key);
  }
});

window.addEventListener("keyup", (event) => {
  gameState.keys.delete(event.key.toLowerCase());
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
  };
  generatedTitle.textContent = generatedSpec.title;
  if (worldNameInput) worldNameInput.value = generatedSpec.title;
  generatedGame.classList.remove("hidden");
  createPlayableWorld(generatedSpec);
}

function placeHandMaterial(tool, x, y) {
  const snappedX = Math.round(x / 20) * 20;
  const snappedY = Math.round(y / 20) * 20;

  if (tool === "coin") {
    gameState.items.push({ x: snappedX, y: snappedY, size: 15, collected: false });
    gameState.goal += 1;
    syncGameStats();
  } else if (tool === "danger") {
    gameState.hazards.push({ x: snappedX, y: snappedY, width: 34, height: 26, vx: 0 });
  } else if (tool === "block") {
    gameState.blocks.push({ x: snappedX, y: snappedY, width: 58, height: 24 });
  } else if (tool === "flag") {
    gameState.flags.push({ x: snappedX, y: snappedY - 72, width: 56, height: 82 });
  } else if (tool === "portal") {
    gameState.portals.push({ x: snappedX, y: snappedY, size: 32 });
  }

  setGameMessage(`Hand Mode placed ${tool}. Press Play to test it.`);
  drawGame();
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
  if (gameState.keys.has("arrowleft") || gameState.keys.has("a")) player.x -= player.speed;
  if (gameState.keys.has("arrowright") || gameState.keys.has("d")) player.x += player.speed;
  if ((gameState.keys.has("arrowup") || gameState.keys.has("w")) && player.onGround) {
    player.velocityY = -12.5;
    player.onGround = false;
  }

  player.velocityY += 0.55;
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
      if (currentUser) {
        currentUser.points += 1;
        pointsEl.textContent = currentUser.points;
        saveAccounts();
      }
      setGameMessage("Coin collected. +1 point. Reach the flag to win anytime.");
    }
  }
}

function winGame(message) {
  if (gameState.won) return;
  gameState.won = true;
  gameState.running = false;
  gamePaused = false;
  cancelAnimationFrame(gameLoop);
  activePlayButton.textContent = "Play Again";
  setGameMessage(message);
  if (currentUser) {
    currentUser.points += 5;
    pointsEl.textContent = currentUser.points;
    saveAccounts();
  }
}

function drawGame() {
  const ctx = activeCanvas.getContext("2d");
  const theme = generatedSpec?.theme || makeTheme("", "", "", "");
  ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

  if (blankMapActive) {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    drawBlankGrid(ctx);
    for (const block of gameState.blocks) draw2dPlatform(ctx, block.x, block.y, block.width, block.height, theme.block);
    for (const item of gameState.items) {
      if (!item.collected) draw2dCoin(ctx, item.x, item.y, item.size, theme.item);
    }
    for (const hazard of gameState.hazards) draw2dSpikes(ctx, hazard.x, hazard.y, hazard.width, hazard.height);
    for (const portal of gameState.portals) draw2dPortal(ctx, portal.x, portal.y, portal.size);
    for (const flag of gameState.flags) draw2dFlag(ctx, flag.x, flag.y);
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

  for (const block of gameState.blocks) draw2dPlatform(ctx, block.x, block.y, block.width, block.height, theme.block);
  for (const item of gameState.items) {
    if (!item.collected) draw2dCoin(ctx, item.x, item.y, item.size, theme.item);
  }
  for (const hazard of gameState.hazards) draw2dSpikes(ctx, hazard.x, hazard.y, hazard.width, hazard.height);
  for (const portal of gameState.portals) draw2dPortal(ctx, portal.x, portal.y, portal.size);
  for (const flag of gameState.flags) draw2dFlag(ctx, flag.x, flag.y);
  draw2dFlag(ctx, 704, 112);
  draw2dSlime(ctx, 600, 236);
  draw2dPlayer(ctx, gameState.player.x, gameState.player.y, gameState.player.size);
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
