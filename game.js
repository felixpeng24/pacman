class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 448; // 28 tiles * 16 pixels
        this.canvas.height = 496; // 31 tiles * 16 pixels
        this.tileSize = 16;
        this.score = 0;
        
        // Game state
        this.gameLoop = null;
        this.lastTime = 0;
        
        // Initialize game objects
        this.initializeGame();
    }

    initializeGame() {
        // Initialize Pac-Man
        this.pacman = {
            x: 14 * this.tileSize,
            y: 23 * this.tileSize,
            direction: 'right',
            nextDirection: 'right',
            speed: 2,
            radius: this.tileSize / 2,
            mouthOpen: 0,
            mouthSpeed: 0.1
        };

        // Initialize ghosts
        this.ghosts = [
            { x: 13 * this.tileSize, y: 11 * this.tileSize, color: 'red', direction: 'right' },
            { x: 14 * this.tileSize, y: 11 * this.tileSize, color: 'pink', direction: 'left' },
            { x: 13 * this.tileSize, y: 12 * this.tileSize, color: 'cyan', direction: 'up' },
            { x: 14 * this.tileSize, y: 12 * this.tileSize, color: 'orange', direction: 'down' }
        ];

        // Initialize maze and dots
        this.initializeMaze();
        
        // Start game loop
        this.startGameLoop();
        
        // Add event listeners
        this.addEventListeners();
    }

    initializeMaze() {
        // 0: empty, 1: wall, 2: dot, 3: power pellet
        this.maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
            [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
            [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
    }

    addEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.pacman.nextDirection = 'up';
                    break;
                case 'ArrowDown':
                    this.pacman.nextDirection = 'down';
                    break;
                case 'ArrowLeft':
                    this.pacman.nextDirection = 'left';
                    break;
                case 'ArrowRight':
                    this.pacman.nextDirection = 'right';
                    break;
            }
        });
    }

    canMove(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        return this.maze[tileY][tileX] !== 1;
    }

    updatePacman() {
        // Try to change direction if requested
        let nextX = this.pacman.x;
        let nextY = this.pacman.y;
        
        switch(this.pacman.nextDirection) {
            case 'up':
                nextY -= this.pacman.speed;
                break;
            case 'down':
                nextY += this.pacman.speed;
                break;
            case 'left':
                nextX -= this.pacman.speed;
                break;
            case 'right':
                nextX += this.pacman.speed;
                break;
        }

        if (this.canMove(nextX, nextY)) {
            this.pacman.direction = this.pacman.nextDirection;
            this.pacman.x = nextX;
            this.pacman.y = nextY;
        } else {
            // Try continuing in current direction
            nextX = this.pacman.x;
            nextY = this.pacman.y;
            
            switch(this.pacman.direction) {
                case 'up':
                    nextY -= this.pacman.speed;
                    break;
                case 'down':
                    nextY += this.pacman.speed;
                    break;
                case 'left':
                    nextX -= this.pacman.speed;
                    break;
                case 'right':
                    nextX += this.pacman.speed;
                    break;
            }

            if (this.canMove(nextX, nextY)) {
                this.pacman.x = nextX;
                this.pacman.y = nextY;
            }
        }

        // Update mouth animation
        this.pacman.mouthOpen += this.pacman.mouthSpeed;
        if (this.pacman.mouthOpen > 0.5 || this.pacman.mouthOpen < 0) {
            this.pacman.mouthSpeed = -this.pacman.mouthSpeed;
        }

        // Check for dot collection
        const tileX = Math.floor(this.pacman.x / this.tileSize);
        const tileY = Math.floor(this.pacman.y / this.tileSize);
        if (this.maze[tileY][tileX] === 2) {
            this.maze[tileY][tileX] = 0;
            this.score += 10;
            document.getElementById('score').textContent = this.score;
        } else if (this.maze[tileY][tileX] === 3) {
            this.maze[tileY][tileX] = 0;
            this.score += 50;
            document.getElementById('score').textContent = this.score;
            // TODO: Make ghosts vulnerable
        }
    }

    updateGhosts() {
        this.ghosts.forEach(ghost => {
            // Simple ghost movement - random direction changes
            if (Math.random() < 0.02) {
                const directions = ['up', 'down', 'left', 'right'];
                ghost.direction = directions[Math.floor(Math.random() * directions.length)];
            }

            let nextX = ghost.x;
            let nextY = ghost.y;
            const speed = 1;

            switch(ghost.direction) {
                case 'up':
                    nextY -= speed;
                    break;
                case 'down':
                    nextY += speed;
                    break;
                case 'left':
                    nextX -= speed;
                    break;
                case 'right':
                    nextX += speed;
                    break;
            }

            if (this.canMove(nextX, nextY)) {
                ghost.x = nextX;
                ghost.y = nextY;
            } else {
                // Change direction if blocked
                const directions = ['up', 'down', 'left', 'right'];
                ghost.direction = directions[Math.floor(Math.random() * directions.length)];
            }
        });
    }

    checkCollisions() {
        this.ghosts.forEach(ghost => {
            const distance = Math.hypot(ghost.x - this.pacman.x, ghost.y - this.pacman.y);
            if (distance < this.tileSize) {
                this.gameOver();
            }
        });
    }

    gameOver() {
        cancelAnimationFrame(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'red';
        this.ctx.font = '48px Arial';
        this.ctx.fillText('Game Over!', this.canvas.width / 2 - 100, this.canvas.height / 2);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 1) {
                    this.ctx.fillStyle = 'blue';
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (this.maze[y][x] === 2) {
                    this.ctx.fillStyle = 'white';
                    this.ctx.beginPath();
                    this.ctx.arc(x * this.tileSize + this.tileSize/2, y * this.tileSize + this.tileSize/2, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (this.maze[y][x] === 3) {
                    this.ctx.fillStyle = 'white';
                    this.ctx.beginPath();
                    this.ctx.arc(x * this.tileSize + this.tileSize/2, y * this.tileSize + this.tileSize/2, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }

        // Draw Pac-Man
        this.ctx.fillStyle = 'yellow';
        this.ctx.beginPath();
        let startAngle, endAngle;
        switch(this.pacman.direction) {
            case 'right':
                startAngle = 0.2 * Math.PI * this.pacman.mouthOpen;
                endAngle = 2 * Math.PI - 0.2 * Math.PI * this.pacman.mouthOpen;
                break;
            case 'left':
                startAngle = Math.PI + 0.2 * Math.PI * this.pacman.mouthOpen;
                endAngle = Math.PI - 0.2 * Math.PI * this.pacman.mouthOpen;
                break;
            case 'up':
                startAngle = 1.5 * Math.PI + 0.2 * Math.PI * this.pacman.mouthOpen;
                endAngle = 1.5 * Math.PI - 0.2 * Math.PI * this.pacman.mouthOpen;
                break;
            case 'down':
                startAngle = 0.5 * Math.PI + 0.2 * Math.PI * this.pacman.mouthOpen;
                endAngle = 0.5 * Math.PI - 0.2 * Math.PI * this.pacman.mouthOpen;
                break;
        }
        this.ctx.arc(this.pacman.x + this.tileSize/2, this.pacman.y + this.tileSize/2, this.pacman.radius, startAngle, endAngle);
        this.ctx.lineTo(this.pacman.x + this.tileSize/2, this.pacman.y + this.tileSize/2);
        this.ctx.fill();

        // Draw ghosts
        this.ghosts.forEach(ghost => {
            this.ctx.fillStyle = ghost.color;
            this.ctx.beginPath();
            this.ctx.arc(ghost.x + this.tileSize/2, ghost.y + this.tileSize/2, this.tileSize/2, Math.PI, 0);
            this.ctx.lineTo(ghost.x + this.tileSize, ghost.y + this.tileSize);
            this.ctx.lineTo(ghost.x, ghost.y + this.tileSize);
            this.ctx.fill();
        });
    }

    startGameLoop() {
        const gameLoop = (timestamp) => {
            const deltaTime = timestamp - this.lastTime;
            this.lastTime = timestamp;

            this.updatePacman();
            this.updateGhosts();
            this.checkCollisions();
            this.draw();

            this.gameLoop = requestAnimationFrame(gameLoop);
        };

        this.gameLoop = requestAnimationFrame(gameLoop);
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};