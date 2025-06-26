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

// Bot array (unchanged for now)
const bots = [];
const botCount = 5;

for (let i = 0; i < botCount; i++) {
  bots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 20,
    color: 'blue'
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

// Player movement update
function updatePlayer() {
  player.x += player.dx;
  player.y += player.dy;

  // Boundary checks
  if (player.x - player.radius < 0) player.x = player.radius;
  if (player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;
  if (player.y - player.radius < 0) player.y = player.radius;
  if (player.y + player.radius > canvas.height) player.y = canvas.height - player.radius;
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

// Main game loop
function gameLoop() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  drawCircle(player);

  bots.forEach(bot => drawCircle(bot));

  requestAnimationFrame(gameLoop);
}

gameLoop();
