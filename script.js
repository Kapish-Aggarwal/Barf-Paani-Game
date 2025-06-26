const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Background
const backgroundColor = '#2c3e50';

// Player object
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: 'red',
  speed: 5,
  dx: 0,
  dy: 0
};

// Generate bots with random direction & speed
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
    frozen: false // NEW: frozen flag
  });
}


// Draw circle helper
function drawCircle(obj) {
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.closePath();
}

// Update player
function updatePlayer() {
  player.x += player.dx;
  player.y += player.dy;

  // Boundary constraint
  if (player.x - player.radius < 0) player.x = player.radius;
  if (player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;
  if (player.y - player.radius < 0) player.y = player.radius;
  if (player.y + player.radius > canvas.height) player.y = canvas.height - player.radius;
}

// Update bot positions
function updateBots() {
  bots.forEach(bot => {
    if (!bot.frozen) {
      // Check for collision with player
      if (checkCollision(player, bot)) {
        bot.frozen = true;
        bot.color = 'gray';  // Mark as frozen visually
        bot.dx = 0;          // Stop movement
        bot.dy = 0;
      }

      // Regular movement
      bot.x += bot.dx;
      bot.y += bot.dy;

      // Bounce off canvas edges
      if (bot.x - bot.radius < 0 || bot.x + bot.radius > canvas.width) {
        bot.dx *= -1;
      }
      if (bot.y - bot.radius < 0 || bot.y + bot.radius > canvas.height) {
        bot.dy *= -1;
      }
    }
  });
}


// Input handling
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

// Game loop
function gameLoop() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateBots();

  drawCircle(player);
  bots.forEach(bot => drawCircle(bot));

  requestAnimationFrame(gameLoop);
}
// Collision detection
function checkCollision(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}

gameLoop();
