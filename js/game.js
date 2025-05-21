class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.player = null;
        this.enemies = [];
        this.boss = null;
        this.ui = new UI(this);
        this.gameState = GAME_STATE_START_SCREEN; // Initial game state

        this.keys = {};
        this.lastEnemySpawnTime = 0;
        this.nextEnemySpawnInterval = getRandomInt(ENEMY_SPAWN_INTERVAL_MIN, ENEMY_SPAWN_INTERVAL_MAX);
        this.bossSpawned = false;

        this.backgroundY = 0; // For scrolling background
        // this.backgroundImage = new Image(); // Placeholder for background image
        // this.backgroundImage.src = 'path/to/your/pixel_art_background.png';

        this.showLevelUpMessageUntil = 0;

        this.initInputHandlers();
    }

    initInputHandlers() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            // Handle game state transitions on key press
            if (this.gameState === GAME_STATE_START_SCREEN && e.key === 'Enter') {
                this.startGame();
            }
            if (this.gameState === GAME_STATE_GAME_OVER && e.key.toLowerCase() === 'r') {
                this.resetGame();
                this.startGame();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    resetGame() {
        this.player = new Player(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, CANVAS_HEIGHT - PLAYER_HEIGHT - 20);
        this.enemies = [];
        this.boss = null;
        this.bossSpawned = false;
        this.lastEnemySpawnTime = 0;
        this.nextEnemySpawnInterval = getRandomInt(ENEMY_SPAWN_INTERVAL_MIN, ENEMY_SPAWN_INTERVAL_MAX);
        this.gameState = GAME_STATE_START_SCREEN;
        this.backgroundY = 0;
        this.showLevelUpMessageUntil = 0;
        // Reset other necessary game variables
    }

    startGame() {
        if (this.gameState === GAME_STATE_PLAYING) return;
        this.resetGame(); // Ensure a fresh state before starting
        this.gameState = GAME_STATE_PLAYING;
        console.log("Game Started!");
    }

    spawnEnemy() {
        const now = Date.now();
        if (this.gameState !== GAME_STATE_PLAYING || this.bossSpawned) return; // Don't spawn if boss is active or not playing

        if (now - this.lastEnemySpawnTime > this.nextEnemySpawnInterval) {
            const enemyTypeRoll = Math.random();
            let newEnemy;
            const spawnEdgeRoll = Math.random();
            let x, y = -ENEMY1_HEIGHT; // Start off-screen top

            if (spawnEdgeRoll < 0.4) { // 40% chance from top center
                x = getRandomFloat(CANVAS_WIDTH * 0.2, CANVAS_WIDTH * 0.8 - ENEMY1_WIDTH);
            } else if (spawnEdgeRoll < 0.7) { // 30% from left side
                x = -ENEMY1_WIDTH;
                y = getRandomFloat(0, CANVAS_HEIGHT * 0.4);
            } else { // 30% from right side
                x = CANVAS_WIDTH;
                y = getRandomFloat(0, CANVAS_HEIGHT * 0.4);
            }

            if (enemyTypeRoll < 0.65) { // 65% chance for Type 1
                newEnemy = new EnemyType1(x, y);
            } else { // 35% chance for Type 2
                newEnemy = new EnemyType2(x, y);
            }
            this.enemies.push(newEnemy);
            this.lastEnemySpawnTime = now;
            this.nextEnemySpawnInterval = getRandomInt(ENEMY_SPAWN_INTERVAL_MIN, ENEMY_SPAWN_INTERVAL_MAX);

            // Simple logic to spawn boss after a certain number of enemies or time (can be improved)
            if (this.enemies.length > 15 && !this.bossSpawned) { // Example: Spawn boss after 15 enemies
                this.spawnBoss();
            }
        }
    }

    spawnBoss() {
        if (this.bossSpawned || this.gameState !== GAME_STATE_PLAYING) return;
        this.boss = new BossEnemy();
        this.enemies.push(this.boss); // Add boss to the general enemy list for updates/drawing
        this.bossSpawned = true;
        console.log("BOSS SPAWNED!");
        // Play boss spawn sound/warning
    }

    update(deltaTime) {
        if (this.gameState !== GAME_STATE_PLAYING) {
            // Input for start/restart is handled in initInputHandlers
            return;
        }

        // Update player
        this.player.handleInput(this.keys);
        this.player.update(deltaTime);
        if (!this.player.isActive) {
            this.gameState = GAME_STATE_GAME_OVER;
            return;
        }
        if (this.player.justLeveledUp) {
            this.showLevelUpMessageUntil = Date.now() + 2000; // Show for 2 seconds
            this.player.justLeveledUp = false; // Reset flag
            // Play level up sound here if desired
        }

        // Spawn and update enemies
        this.spawnEnemy();
        this.enemies.forEach(enemy => enemy.update(deltaTime, this.player));

        // Collision detection and handling
        this.handleCollisions();

        // Filter out inactive objects
        this.enemies = this.enemies.filter(enemy => enemy.isActive);
        this.player.bullets = this.player.bullets.filter(bullet => bullet.isActive);
        if (this.boss && this.boss.bullets) {
            this.boss.bullets = this.boss.bullets.filter(bullet => bullet.isActive);
        }

        // Check for level clear (Boss defeated)
        if (this.boss && !this.boss.isActive && this.bossSpawned) {
            this.gameState = GAME_STATE_LEVEL_CLEAR;
            // Give player EXP for defeating boss if not handled in Boss.takeDamage()
            // this.player.gainExp(500); // Example: if boss.takeDamage doesn't give EXP
        }

        // Update background scroll
        this.backgroundY = (this.backgroundY + BACKGROUND_SCROLL_SPEED) % CANVAS_HEIGHT; // Loop background
    }

    handleCollisions() {
        if (!this.player || !this.player.isActive) return;

        // Player bullets vs Enemies
        this.player.bullets.forEach(bullet => {
            if (!bullet.isActive) return;
            this.enemies.forEach(enemy => {
                if (!enemy.isActive) return;
                if (checkCollision(bullet, enemy)) {
                    bullet.isActive = false;
                    const expGained = enemy.takeDamage(bullet.damage);
                    if (expGained > 0) {
                        this.player.gainExp(expGained);
                        // Removed crude level up message trigger from here
                    }
                    // Play enemy hit/destroy sound
                }
            });
        });

        // Enemies vs Player (collision and enemy bullets)
        this.enemies.forEach(enemy => {
            if (!enemy.isActive) return;

            // Direct collision with player
            if (checkCollision(this.player, enemy)) {
                if (!enemy.isBoss) { // Boss doesn't do collision damage by ramming
                    this.player.takeDamage(enemy.collisionDamage);
                    enemy.isActive = false; // Regular enemies die on collision with player
                    // Play player hit sound & enemy destroy sound
                }
            }

            // Boss bullets vs Player
            if (enemy.isBoss && enemy.bullets) {
                enemy.bullets.forEach(bullet => {
                    if (!bullet.isActive) return;
                    if (checkCollision(this.player, bullet)) {
                        this.player.takeDamage(bullet.damage);
                        bullet.isActive = false;
                        // Play player hit sound
                    }
                });
            }
        });
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw scrolling background (placeholder)
        // If using an actual image, draw it twice for seamless scrolling
        // this.ctx.drawImage(this.backgroundImage, 0, this.backgroundY, CANVAS_WIDTH, CANVAS_HEIGHT);
        // this.ctx.drawImage(this.backgroundImage, 0, this.backgroundY - CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Simple color background for now
        this.ctx.fillStyle = '#001f3f'; // Dark blue background
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Add some stars for a simple space effect
        this.drawStars(); 


        // Draw game objects if playing
        if (this.gameState === GAME_STATE_PLAYING || this.gameState === GAME_STATE_LEVEL_CLEAR || this.gameState === GAME_STATE_GAME_OVER) {
            if(this.player) this.player.draw(this.ctx);
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
        }

        // Draw UI on top of everything
        this.ui.draw(this.ctx);
    }
    
    // Simple star drawing function for background
    drawStars() {
        if (!this.stars) {
            this.stars = [];
            for (let i = 0; i < 100; i++) { // 100 stars
                this.stars.push({
                    x: Math.random() * CANVAS_WIDTH,
                    y: Math.random() * CANVAS_HEIGHT,
                    radius: Math.random() * 1.5,
                    alpha: Math.random() * 0.5 + 0.5 // Random opacity
                });
            }
        }

        this.ctx.fillStyle = 'white';
        this.stars.forEach(star => {
            star.y = (star.y + BACKGROUND_SCROLL_SPEED * star.radius * 0.5 + CANVAS_HEIGHT) % CANVAS_HEIGHT; // Slower stars move slower
            this.ctx.globalAlpha = star.alpha;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0; // Reset global alpha
    }

    loop() {
        const now = performance.now();
        const deltaTime = (now - (this.lastTime || now)) / 1000.0; // Delta time in seconds
        this.lastTime = now;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(() => this.loop());
    }
} 