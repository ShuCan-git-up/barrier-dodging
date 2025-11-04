// Game constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GAME_DURATION = 180; // 3 minutes in seconds
const OBSTACLE_INTERVAL = 2; // seconds
const TOTAL_OBSTACLES = GAME_DURATION / OBSTACLE_INTERVAL; // 90 obstacles
const GROUND_HEIGHT = 50;
const GRAVITY = 0.8;
const JUMP_STRENGTH = -15;

// Game state
let gameState = {
    running: false,
    paused: false,
    timeRemaining: GAME_DURATION,
    obstaclesPassed: 0,
    totalObstaclesSpawned: 0,
    gameOver: false,
    animationId: null,
    lastObstacleTime: 0,
    startTime: null
};

// Player object (Mario-like character)
const player = {
    x: 100,
    y: canvas.height - GROUND_HEIGHT - 60,
    width: 40,
    height: 60,
    velocityY: 0,
    jumping: false,
    groundY: canvas.height - GROUND_HEIGHT - 60,
    
    draw() {
        // Mario-like character in black and white
        ctx.save();
        
        // Body (overalls)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 30, 24, 30);
        
        // Head
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Hat
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 5, 24, 8);
        ctx.fillRect(this.x + 12, this.y, 16, 5);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 16, this.y + 15, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 24, this.y + 15, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Mustache
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 12, this.y + 20, 7, 3);
        ctx.fillRect(this.x + 21, this.y + 20, 7, 3);
        
        // Legs
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 10, this.y + 45, 8, 15);
        ctx.fillRect(this.x + 22, this.y + 45, 8, 15);
        
        // Shoes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 55, 10, 5);
        ctx.fillRect(this.x + 22, this.y + 55, 10, 5);
        
        ctx.restore();
    },
    
    jump() {
        if (!this.jumping) {
            this.velocityY = JUMP_STRENGTH;
            this.jumping = true;
        }
    },
    
    update() {
        this.velocityY += GRAVITY;
        this.y += this.velocityY;
        
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.jumping = false;
        }
    },
    
    reset() {
        this.y = this.groundY;
        this.velocityY = 0;
        this.jumping = false;
    }
};

// Obstacle object (COVID-19 virus)
class Obstacle {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width;
        this.y = canvas.height - GROUND_HEIGHT - this.height;
        this.speed = 3;
        this.passed = false;
    }
    
    draw() {
        ctx.save();
        
        // COVID-19 virus body (red/orange sphere)
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 5,
            this.x + this.width/2, this.y + this.height/2, this.width/2
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.5, '#ee5a6f');
        gradient.addColorStop(1, '#c44569');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Spikes (virus proteins)
        ctx.fillStyle = '#ff4757';
        ctx.strokeStyle = '#c44569';
        ctx.lineWidth = 1;
        
        const spikeCount = 12;
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        const radius = this.width/2;
        
        for (let i = 0; i < spikeCount; i++) {
            const angle = (Math.PI * 2 * i) / spikeCount;
            const spikeLength = 8;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + spikeLength);
            const y2 = centerY + Math.sin(angle) * (radius + spikeLength);
            
            ctx.beginPath();
            ctx.arc(x2, y2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#c44569';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    update() {
        this.x -= this.speed;
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    collidesWith(player) {
        return (
            player.x < this.x + this.width - 15 &&
            player.x + player.width > this.x + 15 &&
            player.y < this.y + this.height - 15 &&
            player.y + player.height > this.y + 15
        );
    }
}

let obstacles = [];

// UI Elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverModal = document.getElementById('gameOverModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const obstaclesDisplay = document.getElementById('obstacles');
const finalScoreDisplay = document.getElementById('finalScore');

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    resetGame();
});

canvas.addEventListener('click', () => {
    if (gameState.running && !gameState.paused && !gameState.gameOver) {
        player.jump();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState.running && !gameState.paused && !gameState.gameOver) {
        e.preventDefault();
        player.jump();
    }
});

function startGame() {
    gameState.running = true;
    gameState.paused = false;
    gameState.gameOver = false;
    gameState.startTime = Date.now();
    gameState.lastObstacleTime = 0;
    
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    restartBtn.style.display = 'inline-block';
    
    gameLoop();
}

function togglePause() {
    if (gameState.running && !gameState.gameOver) {
        gameState.paused = !gameState.paused;
        pauseBtn.textContent = gameState.paused ? '继续' : '暂停';
        
        if (!gameState.paused) {
            // Adjust start time to account for pause duration
            const now = Date.now();
            gameState.startTime = now - (GAME_DURATION - gameState.timeRemaining) * 1000;
            gameLoop();
        }
    }
}

function resetGame() {
    // Cancel animation
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
    
    // Reset game state
    gameState = {
        running: false,
        paused: false,
        timeRemaining: GAME_DURATION,
        obstaclesPassed: 0,
        totalObstaclesSpawned: 0,
        gameOver: false,
        animationId: null,
        lastObstacleTime: 0,
        startTime: null
    };
    
    // Reset player
    player.reset();
    
    // Clear obstacles
    obstacles = [];
    
    // Reset UI
    updateUI();
    pauseBtn.textContent = '暂停';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    
    // Clear canvas
    drawScene();
}

function endGame(won) {
    gameState.gameOver = true;
    gameState.running = false;
    
    const score = calculateScore();
    const message = won 
        ? `恭喜！您成功完成游戏！<br>最终得分: ${score}分<br>躲过了 ${gameState.obstaclesPassed} 个障碍！`
        : `游戏结束！<br>最终得分: ${score}分<br>躲过了 ${gameState.obstaclesPassed} 个障碍！`;
    
    finalScoreDisplay.innerHTML = message;
    gameOverModal.style.display = 'flex';
    
    pauseBtn.style.display = 'none';
}

function calculateScore() {
    if (gameState.totalObstaclesSpawned === 0) return 0;
    return Math.round((gameState.obstaclesPassed / TOTAL_OBSTACLES) * 100);
}

function updateUI() {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    scoreDisplay.textContent = calculateScore();
    obstaclesDisplay.textContent = `${gameState.obstaclesPassed}/${TOTAL_OBSTACLES}`;
}

function spawnObstacle() {
    if (gameState.totalObstaclesSpawned < TOTAL_OBSTACLES) {
        obstacles.push(new Obstacle());
        gameState.totalObstaclesSpawned++;
    }
}

function drawGround() {
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    
    // Ground line
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - GROUND_HEIGHT);
    ctx.lineTo(canvas.width, canvas.height - GROUND_HEIGHT);
    ctx.stroke();
}

function drawScene() {
    // Clear canvas
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    drawGround();
    
    // Draw player
    player.draw();
    
    // Draw obstacles
    obstacles.forEach(obstacle => obstacle.draw());
    
    // Draw pause overlay
    if (gameState.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('暂停', canvas.width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    // Update time
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    gameState.timeRemaining = Math.max(0, GAME_DURATION - Math.floor(elapsed));
    
    // Check if game time is up
    if (gameState.timeRemaining === 0 && gameState.totalObstaclesSpawned >= TOTAL_OBSTACLES) {
        endGame(true);
        return;
    }
    
    // Spawn obstacles every 2 seconds
    const currentObstacleSlot = Math.floor(elapsed / OBSTACLE_INTERVAL);
    if (currentObstacleSlot > gameState.lastObstacleTime && gameState.totalObstaclesSpawned < TOTAL_OBSTACLES) {
        spawnObstacle();
        gameState.lastObstacleTime = currentObstacleSlot;
    }
    
    // Update player
    player.update();
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.update();
        
        // Check collision
        if (obstacle.collidesWith(player)) {
            endGame(false);
            return;
        }
        
        // Check if obstacle passed
        if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
            obstacle.passed = true;
            gameState.obstaclesPassed++;
        }
        
        // Remove off-screen obstacles
        if (obstacle.isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }
    
    // Update UI
    updateUI();
    
    // Draw scene
    drawScene();
    
    // Continue game loop
    gameState.animationId = requestAnimationFrame(gameLoop);
}

// Initial draw
drawScene();
updateUI();
