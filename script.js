// Select the canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make canvas full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Optional: Update canvas size on window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Background color
const backgroundColor = '#2c3e50';

function gameLoop() {
  // Fill background color each frame
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Future game logic and drawing here

  requestAnimationFrame(gameLoop);
}

gameLoop();
