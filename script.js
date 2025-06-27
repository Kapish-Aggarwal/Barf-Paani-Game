// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

window.addEventListener("keydown", function (e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
});

function isRectOverlap(r1, r2) {
  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  );
}

function isCircleCollidingWithRect(circle, rect) {
  const distX = Math.abs(circle.x - rect.x - rect.width / 2);
  const distY = Math.abs(circle.y - rect.y - rect.height / 2);

  if (distX > (rect.width / 2 + circle.radius)) return false;
  if (distY > (rect.height / 2 + circle.radius)) return false;

  if (distX <= (rect.width / 2)) return true;
  if (distY <= (rect.height / 2)) return true;

  const dx = distX - rect.width / 2;
  const dy = distY - rect.height / 2;
  return dx * dx + dy * dy <= (circle.radius * circle.radius);
}

let totalTime = 0, remainingTime = 0, timerInterval = null;
let animationId, gameRunning = false, slowed = false;

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: 'red',
  speed: 5,
  defaultSpeed: 5,
  dx: 0,
  dy: 0
};

const bots = [];
const botCount = 5;
let baseBotSpeed = 2.0;

for (let i = 0; i < botCount; i++) {
  const angle = Math.random() * 2 * Math.PI;
  const speed = baseBotSpeed;
  bots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 20,
    color: 'blue',
    speed: speed,
    baseSpeed: speed,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    frozen: false
  });
}

const obstacleCount = 12;
const obstacles = [];
for (let i = 0; i < obstacleCount; i++) {
  let rect, attempts = 0, collides;
  do {
    rect = {
      width: 60,
      height: 60,
      x: Math.random() * (canvas.width - 100),
      y: Math.random() * (canvas.height - 100),
      color: '#444'
    };
    collides = isCircleCollidingWithRect(player, rect);
    for (const b of bots) collides ||= isCircleCollidingWithRect(b, rect);
    for (const ob of obstacles) collides ||= isRectOverlap(ob, rect);
    attempts++;
  } while (collides && attempts < 1000);
  obstacles.push(rect);
}

function drawCircle(obj, glow = false) {
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
  ctx.fillStyle = obj.color;
  ctx.shadowColor = glow ? obj.color : 'transparent';
  ctx.shadowBlur = glow ? 15 : 0;
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}

function updatePlayer() {
  const nextX = player.x + player.dx;
  const nextY = player.y + player.dy;

  for (const ob of obstacles) {
    if (isCircleCollidingWithRect({ ...player, x: nextX, y: nextY }, ob)) {
      if (!slowed) {
        slowed = true;
        player.speed = player.defaultSpeed / 2;
        bots.forEach(bot => {
          if (!bot.frozen) {
            const angle = Math.atan2(bot.dy, bot.dx);
            bot.dx = Math.cos(angle) * bot.baseSpeed * 3;
            bot.dy = Math.sin(angle) * bot.baseSpeed * 3;
          }
        });

        setTimeout(() => {
          player.defaultSpeed *= 0.5;
          player.speed = player.defaultSpeed;
          bots.forEach(bot => {
            if (!bot.frozen) {
              bot.baseSpeed += 0.5;
              const angle = Math.atan2(bot.dy, bot.dx);
              bot.dx = Math.cos(angle) * bot.baseSpeed;
              bot.dy = Math.sin(angle) * bot.baseSpeed;
            }
          });
          slowed = false;
        }, 10000);
      }
      return;
    }
  }

  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, nextX));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, nextY));
}

function checkCollision(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) < a.radius + b.radius;
}

function updateBots() {
  let allFrozen = true;
  bots.forEach(bot => {
    if (bot.frozen) return;
    allFrozen = false;

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
      bot.dx = Math.cos(angle) * bot.baseSpeed;
      bot.dy = Math.sin(angle) * bot.baseSpeed;
    }

    bot.x += bot.dx;
    bot.y += bot.dy;

    if (bot.x - bot.radius < 0 || bot.x + bot.radius > canvas.width) bot.dx *= -1;
    if (bot.y - bot.radius < 0 || bot.y + bot.radius > canvas.height) bot.dy *= -1;

    bots.forEach(other => {
      if (other !== bot && other.frozen && checkCollision(bot, other)) {
        other.frozen = false;
        other.color = 'blue';
        const angle = Math.random() * 2 * Math.PI;
        other.dx = Math.cos(angle) * other.baseSpeed;
        other.dy = Math.sin(angle) * other.baseSpeed;
      }
    });

    if (checkCollision(player, bot)) {
      bot.frozen = true;
      bot.color = 'gray';
      bot.dx = 0;
      bot.dy = 0;
    }
  });

  if (allFrozen && gameRunning) endGame(true);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") player.dx = player.speed;
  if (e.key === "ArrowLeft") player.dx = -player.speed;
  if (e.key === "ArrowUp") player.dy = -player.speed;
  if (e.key === "ArrowDown") player.dy = player.speed;
});
document.addEventListener("keyup", e => {
  if (["ArrowRight", "ArrowLeft"].includes(e.key)) player.dx = 0;
  if (["ArrowUp", "ArrowDown"].includes(e.key)) player.dy = 0;
});

function updateTimerDisplay() {
  const el = document.getElementById('timer');
  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;
  el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
}

function startGameTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

function endGame(won) {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  document.getElementById('gameMessage').style.display = 'block';
  document.getElementById('gameMessage').textContent = won ? "🎉 You Win!" : "⏰ Time's up! You Lose!";
  setTimeout(() => location.reload(), 4000);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayer();
  updateBots();
  obstacles.forEach(ob => {
    ctx.fillStyle = ob.color;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
  });
  drawCircle(player);
  bots.forEach(bot => drawCircle(bot, bot.frozen));
  if (gameRunning) animationId = requestAnimationFrame(gameLoop);
}

function selectDifficulty(mode) {
  if (mode === 'easy') {
    totalTime = 300;
    baseBotSpeed = 2.0;
  } else if (mode === 'medium') {
    totalTime = 180;
    baseBotSpeed = 2.5;
  } else if (mode === 'hard') {
    totalTime = 120;
    baseBotSpeed = 3.0;
  }

  remainingTime = totalTime;
  bots.forEach(bot => {
    const angle = Math.random() * 2 * Math.PI;
    bot.baseSpeed = baseBotSpeed;
    bot.dx = Math.cos(angle) * baseBotSpeed;
    bot.dy = Math.sin(angle) * baseBotSpeed;
    bot.frozen = false;
    bot.color = 'blue';
  });

  player.defaultSpeed = 5;
  player.speed = 5;

  document.getElementById('controls').style.display = 'none';
  document.getElementById('intro').style.display = 'none';

  gameRunning = true;
  startGameTimer();
  gameLoop();
}