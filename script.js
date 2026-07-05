const demoAccounts = {
  Alex: { password: "play123", points: 250 },
  Mia: { password: "obby", points: 410 },
};

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
const choiceButtons = document.querySelectorAll("[data-auth-mode]");
const navButtons = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");
const modeButtons = document.querySelectorAll("[data-create-mode]");
const modePanels = document.querySelectorAll("[data-mode-panel]");
const handToolButtons = document.querySelectorAll("[data-hand-tool]");
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

let authMode = "first";
let currentUser = null;
let currentQuestion = 0;
let reportCount = 0;
let selectedAnswer = "";
let aiAnswers = [];
let generatedSpec = null;
let gameLoop = 0;
let handTool = "coin";

const gameState = {
  running: false,
  score: 0,
  goal: 6,
  player: { x: 70, y: 260, size: 22, speed: 4 },
  items: [],
  hazards: [],
  blocks: [],
  portals: [],
  keys: new Set(),
};

const aiQuestions = [
  {
    text: "What kind of 3D game do you want to make?",
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

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    authMode = button.dataset.authMode;
    choiceButtons.forEach((item) => item.classList.toggle("active", item === button));
    authMessage.textContent = authMode === "first"
      ? "No two accounts can use the same name."
      : "Returning players must use the saved password.";
    validateAuth();
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
  welcomeName.textContent = name;
  userAvatar.textContent = name.charAt(0).toUpperCase();
  pointsEl.textContent = currentUser.points;
  authScreen.classList.remove("active");
  mainScreen.classList.add("active");
});

function validateAuth() {
  continueBtn.disabled = cleanName(nameInput.value).length < 2 || passwordInput.value.length < 3;
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
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewId);
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
  const name = cleanName(friendSearch.value) || "Alex";
  friendMessage.textContent = `Friend invitation sent to ${name}.`;
});

sendPoints.addEventListener("click", () => {
  const amount = Number(giftAmount.value || 0);
  if (!amount || amount < 1) {
    giftMessage.textContent = "Choose how many points to send.";
    return;
  }
  if (amount > currentUser.points) {
    giftMessage.textContent = "You do not have enough points.";
    return;
  }
  currentUser.points -= amount;
  pointsEl.textContent = currentUser.points;
  giftMessage.textContent = `Sent ${amount} points to a friend.`;
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
});

playGenerated.addEventListener("click", () => {
  gameState.running = !gameState.running;
  playGenerated.textContent = gameState.running ? "Pause" : "Play";
  if (gameState.running) runGame();
});

resetGenerated.addEventListener("click", () => {
  if (generatedSpec) createPlayableWorld(generatedSpec);
});

publishGenerated.addEventListener("click", () => {
  if (!generatedSpec) return;
  generatedMessage.textContent = `${generatedSpec.title} was published. Every real player would give you 5 points.`;
});

window.addEventListener("keydown", (event) => {
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
  generatedGame.classList.remove("hidden");
  createPlayableWorld(generatedSpec);
  generatedGame.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function ensurePlayableWorld(source) {
  if (generatedSpec) return;
  generatedSpec = {
    type: source === "code" ? "Code" : "Hand",
    world: "Builder",
    action: "Create",
    extra: "",
    title: source === "code" ? "Code Mode Game" : "Hand Built Game",
    theme: makeTheme("Adventure", "Island", "Collect", ""),
  };
  generatedTitle.textContent = generatedSpec.title;
  generatedGame.classList.remove("hidden");
  createPlayableWorld(generatedSpec);
}

function placeHandMaterial(tool, x, y) {
  const snappedX = Math.round(x / 20) * 20;
  const snappedY = Math.round(y / 20) * 20;

  if (tool === "coin") {
    gameState.items.push({ x: snappedX, y: snappedY, size: 15, collected: false });
    gameState.goal += 1;
    gameGoal.textContent = gameState.goal;
  } else if (tool === "danger") {
    gameState.hazards.push({ x: snappedX, y: snappedY, width: 34, height: 26, vx: 0 });
  } else if (tool === "block") {
    gameState.blocks.push({ x: snappedX, y: snappedY, width: 58, height: 24 });
  } else if (tool === "portal") {
    gameState.portals.push({ x: snappedX, y: snappedY, size: 32 });
  }

  generatedMessage.textContent = `Hand Mode placed ${tool}. Press Play to test it.`;
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
      gameGoal.textContent = gameState.goal;
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
  generatedMessage.textContent = "Code Mode changed the game rules.";
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
  gameState.running = false;
  playGenerated.textContent = "Play";
  gameState.score = 0;
  gameState.goal = spec.type.toLowerCase() === "simulator" ? 8 : 6;
  gameState.player = { x: 95, y: 260, size: 22, speed: spec.type.toLowerCase() === "racing" ? 5.4 : 4.2 };
  gameState.items = makeItems(gameState.goal);
  gameState.hazards = makeHazards(spec.type);
  gameState.blocks = [];
  gameState.portals = [];
  gameScore.textContent = gameState.score;
  gameGoal.textContent = gameState.goal;
  generatedMessage.textContent = `AI created a 3D ${spec.title}. Move with arrows or WASD, collect glowing pieces, avoid danger cubes.`;
  drawGame();
}

function makeItems(count) {
  return Array.from({ length: count }, (_, index) => ({
    x: 140 + index * 92,
    y: 95 + (index % 3) * 62,
    size: 15,
    collected: false,
  }));
}

function makeHazards(type) {
  const amount = type.toLowerCase() === "battle" ? 6 : 4;
  return Array.from({ length: amount }, (_, index) => ({
    x: 180 + index * 112,
    y: 245 - (index % 2) * 82,
    width: 34,
    height: 26,
    vx: index % 2 === 0 ? 1.2 : -1.2,
  }));
}

function runGame() {
  if (!gameState.running) return;
  updateGame();
  drawGame();
  gameLoop = requestAnimationFrame(runGame);
}

function updateGame() {
  const player = gameState.player;
  if (gameState.keys.has("arrowleft") || gameState.keys.has("a")) player.x -= player.speed;
  if (gameState.keys.has("arrowright") || gameState.keys.has("d")) player.x += player.speed;
  if (gameState.keys.has("arrowup") || gameState.keys.has("w")) player.y -= player.speed;
  if (gameState.keys.has("arrowdown") || gameState.keys.has("s")) player.y += player.speed;
  player.x = clamp(player.x, 18, gameCanvas.width - 34);
  player.y = clamp(player.y, 58, gameCanvas.height - 34);

  for (const hazard of gameState.hazards) {
    hazard.x += hazard.vx;
    if (hazard.x < 80 || hazard.x > gameCanvas.width - 80) hazard.vx *= -1;
    if (rectsOverlap(player.x, player.y, player.size, player.size, hazard.x, hazard.y, hazard.width, hazard.height)) {
      player.x = 70;
      player.y = 260;
      generatedMessage.textContent = "Danger block touched you. Try another path.";
    }
  }

  for (const portal of gameState.portals) {
    if (rectsOverlap(player.x, player.y, player.size, player.size, portal.x, portal.y, portal.size, portal.size)) {
      gameState.running = false;
      playGenerated.textContent = "Play Again";
      generatedMessage.textContent = "Portal reached. Your hand-built exit works.";
    }
  }

  for (const item of gameState.items) {
    if (!item.collected && rectsOverlap(player.x, player.y, player.size, player.size, item.x, item.y, item.size, item.size)) {
      item.collected = true;
      gameState.score += 1;
      gameScore.textContent = gameState.score;
      generatedMessage.textContent = `Collected ${gameState.score} of ${gameState.goal}.`;
      if (gameState.score >= gameState.goal) {
        gameState.running = false;
        playGenerated.textContent = "Play Again";
        generatedMessage.textContent = `${generatedSpec.title} complete. Publish it or edit it more.`;
        if (currentUser) {
          currentUser.points += 5;
          pointsEl.textContent = currentUser.points;
        }
      }
    }
  }
}

function drawGame() {
  const ctx = gameCanvas.getContext("2d");
  const theme = generatedSpec?.theme || makeTheme("", "", "", "");
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, gameCanvas.height * 0.55);
  sky.addColorStop(0, theme.sky);
  sky.addColorStop(1, lighten(theme.sky, 42));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  drawClouds(ctx);
  drawPerspectiveGround(ctx, theme);

  const worldObjects = [];

  for (let i = 0; i < 7; i += 1) {
    worldObjects.push({
      kind: "block",
      x: 92 + i * 95,
      y: 235 - (i % 3) * 34,
      width: 58,
      height: 24,
      color: theme.block,
    });
  }

  for (const block of gameState.blocks) {
    worldObjects.push({ kind: "block", color: theme.block, ...block });
  }

  for (const portal of gameState.portals) {
    worldObjects.push({ kind: "portal", ...portal });
  }

  for (const item of gameState.items) {
    if (!item.collected) worldObjects.push({ kind: "coin", ...item });
  }

  for (const hazard of gameState.hazards) {
    worldObjects.push({ kind: "block", color: theme.danger, ...hazard });
  }

  worldObjects.push({ kind: "player", ...gameState.player });

  worldObjects.sort((a, b) => a.y - b.y);

  for (const object of worldObjects) {
    if (object.kind === "block") {
      drawCube(ctx, object.x, object.y, object.width, object.height, object.color);
    } else if (object.kind === "coin") {
      drawCoin3d(ctx, object.x, object.y, object.size, theme.item);
    } else if (object.kind === "portal") {
      drawPortal3d(ctx, object.x, object.y, object.size);
    } else if (object.kind === "player") {
      drawPlayer3d(ctx, object.x, object.y, object.size);
    }
  }
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
