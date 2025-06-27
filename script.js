const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Background color
const backgroundColor = '#2c3e50';

// Game state
let animationId;
let timerInterval;
let totalTime = 0;
let remainingTime = 0;
let gameStarted = false;

// Player
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: 'red',
  speed: 5,
  dx: 0,
  dy: 0
};

// Bots
const bots = [];
const botCount = 5;

for (let i = 0; i < botCount; i++) {
  bots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 20,
    color: 'blue',
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2,
    frozen: false
  });
}

// Obstacles
const obstacles = [];
const obstacleCount = 5;
let slowed = false;
let slowEffectTimer = null;

// Circle-rectangle collision
function isCircleCollidingWithRect(circle, rect) {
  const distX = Math.abs(circle.x - rect.x - rect.width / 2);
  const distY = Math.abs(circle.y - rect.y - rect.height / 2);

  if (distX > (rect.width / 2 + circle.radius)) return false;
  if (distY > (rect.height / 2 + circle.radius)) return false;

  if (distX <= (rect.width / 2)) return true;
  if (distY <= (rect.height / 2)) return true;

  const dx = distX - rect.width / 2;
  const dy = distY - rect.height / 2;
  return (dx * dx + dy * dy <= circle.radius * circle.radius);
}

// Generate obstacles avoiding player/bots
for (let i = 0; i < obstacleCount; i++) {
  let rect, collides;

  do {
    collides = false;
    rect = {
      x: Math.random() * (canvas.width - 100),
      y: Math.random() * (canvas.height - 100),
      width: 60,
      height: 60,
      color: '#444'
    };

    if (isCircleCollidingWithRect(player, rect)) collides = true;

    for (const bot of bots) {
      if (isCircleCollidingWithRect(bot, rect)) {
        collides = true;
        break;
      }
    }
  } while (collides);

  obstacles.push(rect);
}

// Circle-circle collision
function checkCollision(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}

// Draw a circle
function drawCircle(obj) {
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.closePath();
}

// Update player movement and handle obstacle effects
function updatePlayer() {
  player.x += player.dx;
  player.y += player.dy;

  if (player.x - player.radius < 0) player.x = player.radius;
  if (player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;
  if (player.y - player.radius < 0) player.y = player.radius;
  if (player.y + player.radius > canvas.height) player.y = canvas.height - player.radius;

  obstacles.forEach(ob => {
    if (isCircleCollidingWithRect(player, ob) && !slowed) {
      slowed = true;
      player.speed = 2.5;

      bots.forEach(bot => {
        if (!bot.frozen) {
          bot.dx *= 1.5;
          bot.dy *= 1.5;
        }
      });

      slowEffectTimer = setTimeout(() => {
        player.speed = 5;
        bots.forEach(bot => {
          if (!bot.frozen) {
            bot.dx /= 1.5;
            bot.dy /= 1.5;
          }
        });
        slowed = false;
      }, 10000);
    }
  });
}

// Update bots
function updateBots() {
  bots.forEach(bot => {
    if (bot.frozen) return;

    let target = null;
    let minDist = 150;

    bots.forEach(other => {
      if (other !== bot && other.frozen) {
        const dx = other.x - bot.x;
        const dy = other.y - bot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          target = other;
        }
      }
    });

    if (target) {
      const angle = Math.atan2(target.y - bot.y, target.x - bot.x);
      const speed = 1.5;
      bot.dx = Math.cos(angle) * speed;
      bot.dy = Math.sin(angle) * speed;
    }

    bot.x += bot.dx;
    bot.y += bot.dy;

    if (bot.x - bot.radius < 0 || bot.x + bot.radius > canvas.width) bot.dx *= -1;
    if (bot.y - bot.radius < 0 || bot.y + bot.radius > canvas.height) bot.dy *= -1;

    bots.forEach(other => {
      if (other !== bot && other.frozen && checkCollision(bot, other)) {
        other.frozen = false;
        other.color = 'blue';
        other.dx = (Math.random() - 0.5) * 2;
        other.dy = (Math.random() - 0.5) * 2;
      }
    });

    if (checkCollision(player, bot)) {
      bot.frozen = true;
      bot.color = 'gray';
      bot.dx = 0;
      bot.dy = 0;
    }
  });
}

// Input controls
function keyDownHandler(e) {
  if (e.key === "ArrowRight") player.dx = player.speed;
  if (e.key === "ArrowLeft") player.dx = -player.speed;
  if (e.key === "ArrowUp") player.dy = -player.speed;
  if (e.key === "ArrowDown") player.dy = player.speed;
}

function keyUpHandler(e) {
  if (["ArrowRight", "ArrowLeft"].includes(e.key)) player.dx = 0;
  if (["ArrowUp", "ArrowDown"].includes(e.key)) player.dy = 0;
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Timer display
function updateTimerDisplay() {
  const timerEl = document.getElementById('timer');
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startGameTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  alert("⏰ Time's up! Game Over!");
  cancelAnimationFrame(animationId);
}

// Start game
function gameLoop() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateBots();

  obstacles.forEach(ob => {
    ctx.fillStyle = ob.color;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
  });

  drawCircle(player);
  bots.forEach(bot => drawCircle(bot));

  animationId = requestAnimationFrame(gameLoop);
}

// Handle difficulty selection from UI
let baseBotSpeed = 1.0; // default

function selectDifficulty(mode) {
  if (mode === 'easy') {
    totalTime = 300;
    baseBotSpeed = 1.0;
  } else if (mode === 'medium') {
    totalTime = 180;
    baseBotSpeed = 1.5;
  } else if (mode === 'hard') {
    totalTime = 120;
    baseBotSpeed = 2.0;
  }

  remainingTime = totalTime;

  // Set speed for each bot
  bots.forEach(bot => {
    bot.dx = (Math.random() - 0.5) * 2 * baseBotSpeed;
    bot.dy = (Math.random() - 0.5) * 2 * baseBotSpeed;
  });

  document.getElementById('controls').style.display = 'none'; // Hide difficulty buttons
  startGameTimer();
  gameLoop();
}

