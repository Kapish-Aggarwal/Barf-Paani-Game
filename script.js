const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const backgroundColor = '#2c3e50';

// Player object
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: 'red'
};

// Bot array
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

function drawCircle(obj) {
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.closePath();
}

function gameLoop() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player
  drawCircle(player);

  // Draw bots
  bots.forEach(bot => drawCircle(bot));

  requestAnimationFrame(gameLoop);
}

gameLoop();
