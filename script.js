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
        if (bot.frozen) return; // Frozen bots don't move

        // Try to find nearest frozen bot within range
        let target = null;
        let minDist = 150; // Only consider frozen bots within this distance

        bots.forEach(other => {
            if (other !== bot && other.frozen) {
                const dx = other.x - bot.x;
                const dy = other.y - bot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDist) {
                    minDist = distance;
                    target = other;
                }
            }
        });

        if (target) {
            // Move toward the frozen teammate
            const angle = Math.atan2(target.y - bot.y, target.x - bot.x);
            const speed = 1.5; // Slower speed for rescue
            bot.dx = Math.cos(angle) * speed;
            bot.dy = Math.sin(angle) * speed;
        }

        bot.x += bot.dx;
        bot.y += bot.dy;

        // Bounce off canvas edges
        if (bot.x - bot.radius < 0 || bot.x + bot.radius > canvas.width) {
            bot.dx *= -1;
        }
        if (bot.y - bot.radius < 0 || bot.y + bot.radius > canvas.height) {
            bot.dy *= -1;
        }

        // Unfreeze logic
        bots.forEach(other => {
            if (other !== bot && other.frozen && checkCollision(bot, other)) {
                other.frozen = false;
                other.color = 'blue';
                // Assign new random direction to unfrozen bot
                other.dx = (Math.random() - 0.5) * 2;
                other.dy = (Math.random() - 0.5) * 2;
            }
        });
    });
}

// Obstacles
const obstacles = [];
const obstacleCount = 5;

// Utility: Check circle-rectangle overlap
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

// Generate obstacles avoiding player & bots
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

        // Check overlap with player
        if (isCircleCollidingWithRect(player, rect)) {
            collides = true;
        }

        // Check overlap with each bot
        for (const bot of bots) {
            if (isCircleCollidingWithRect(bot, rect)) {
                collides = true;
                break;
            }
        }
    } while (collides); // Repeat until we get a non-colliding position

    obstacles.push(rect);
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

    obstacles.forEach(ob => {
        ctx.fillStyle = ob.color;
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
    });
    
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
