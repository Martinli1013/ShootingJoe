class Game {
    constructor(canvas, resourceManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.resourceManager = resourceManager;

        this.player = null;
        this.enemies = [];
        this.boss = null;
        this.ui = new UI(this);
        this.textParticles = []; // Added for enemy death texts
        this.gameState = GAME_STATE_START_SCREEN; // Initial game state

        this.keys = {};
        this.lastEnemySpawnTime = 0;
        this.nextEnemySpawnInterval = getRandomInt(ENEMY_SPAWN_INTERVAL_MIN, ENEMY_SPAWN_INTERVAL_MAX);
        this.bossSpawned = false;
        this.gameStartTime = 0; // To track game start time for boss spawn
        this.bossSpawnTimeDelay = 2 * 60 * 1000; // 2 minutes in milliseconds

        this.backgroundY = 0; // For scrolling background
        // this.backgroundImage = new Image(); // Placeholder for background image
        // this.backgroundImage.src = 'path/to/your/pixel_art_background.png';

        this.showLevelUpMessageUntil = 0;
        this.showHpRestoredMessageUntil = 0; // New property for HP restored message

        this.firstSpawnDelayed = false;
        this.initialSpawnDelayTime = 0;

        this.initInputHandlers();

        // Preload ending images
        // this.endingSuccessImage = this.resourceManager.getImage(ENDING_SUCCESS_IMAGE_SRC);
        // this.endingFailImage = this.resourceManager.getImage(ENDING_FAIL_IMAGE_SRC);
    }

    initInputHandlers() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            // Reverted: Removed e.preventDefault() for arrow keys
            // if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            // e.preventDefault();
            // }

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
        this.player = new Player(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, CANVAS_HEIGHT - PLAYER_HEIGHT - 20, this.resourceManager);
        this.enemies = [];
        this.boss = null;
        this.textParticles = []; // Reset text particles
        this.bossSpawned = false;
        this.lastEnemySpawnTime = 0;
        this.gameStartTime = 0; // Reset game start time
        this.nextEnemySpawnInterval = getRandomInt(ENEMY_SPAWN_INTERVAL_MIN, ENEMY_SPAWN_INTERVAL_MAX);
        this.gameState = GAME_STATE_START_SCREEN;
        this.backgroundY = 0;
        this.showLevelUpMessageUntil = 0;
        this.showHpRestoredMessageUntil = 0; // Reset HP restored message
        this.firstSpawnDelayed = false; // Reset initial spawn delay flag
        this.initialSpawnDelayTime = 0;
        // Reset other necessary game variables
    }

    startGame() {
        if (this.gameState === GAME_STATE_PLAYING) return;
        this.resetGame(); // Ensure a fresh state before starting
        this.gameState = GAME_STATE_PLAYING;
        this.firstSpawnDelayed = true;
        this.initialSpawnDelayTime = Date.now() + 1500; // Set 1.5 second delay for the first spawn
        console.log("Game Started! Initial enemy spawn delayed.");
    }

    spawnEnemy() {
        const now = Date.now();
        if (this.gameState !== GAME_STATE_PLAYING || this.bossSpawned) return;

        let currentSpawnIntervalMin = ENEMY_SPAWN_INTERVAL_MIN;
        let currentSpawnIntervalMax = ENEMY_SPAWN_INTERVAL_MAX;

        if (this.player && this.player.level >= PLAYER_LEVEL_FOR_FASTER_SPAWN) {
            currentSpawnIntervalMin = ENEMY_SPAWN_INTERVAL_MIN_FASTER;
            currentSpawnIntervalMax = ENEMY_SPAWN_INTERVAL_MAX_FASTER;
        }

        if (this.firstSpawnDelayed) {
            if (now < this.initialSpawnDelayTime) {
                return; // Not yet time for the first spawn after the initial delay
            }
            // Delay has passed, set up for the first actual spawn
            this.lastEnemySpawnTime = now; // Start counting from now for the first interval
            this.nextEnemySpawnInterval = getRandomInt(currentSpawnIntervalMin, currentSpawnIntervalMax);
            this.firstSpawnDelayed = false;
            // Fall through to the standard spawn check below, which should now trigger if interval is met
        }

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

            if (enemyTypeRoll < 0.80) { // 80% chance for Type 1 (previously 0.65)
                newEnemy = new EnemyType1(x, y, this.player ? this.player.level : 1, this.resourceManager);
            } else { // 20% chance for Type 2 (previously 0.35)
                newEnemy = new EnemyType2(x, y, this.resourceManager);
            }
            this.enemies.push(newEnemy);
            this.lastEnemySpawnTime = now;
            this.nextEnemySpawnInterval = getRandomInt(currentSpawnIntervalMin, currentSpawnIntervalMax);

            // Boss spawn logic is now in update()
        }
    }

    spawnBoss() {
        if (this.bossSpawned || this.gameState !== GAME_STATE_PLAYING) return;
        this.boss = new BossEnemy(this.resourceManager);
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

        // Check for Boss spawn based on player level
        if (!this.bossSpawned && this.player && this.player.level >= 20) {
            this.spawnBoss();
        }

        // Update player
        this.player.handleInput(this.keys);
        this.player.update(deltaTime, this);
        if (!this.player.isActive) {
            this.gameState = GAME_STATE_GAME_OVER;
            return;
        }
        if (this.player.justLeveledUp) {
            this.showLevelUpMessageUntil = Date.now() + 2000; // Show for 2 seconds
            this.showHpRestoredMessageUntil = Date.now() + 1000; // Show HP restored message for 1 second
            this.player.justLeveledUp = false; // Reset flag
            // Play level up sound here if desired
        }

        // Spawn and update enemies
        this.spawnEnemy();
        this.enemies.forEach(enemy => enemy.update(deltaTime, this.player));

        // Update text particles
        this.textParticles.forEach(particle => particle.update(deltaTime));

        // Collision detection and handling
        this.handleCollisions();

        // Filter out inactive objects
        this.enemies = this.enemies.filter(enemy => enemy.isActive);
        this.player.bullets = this.player.bullets.filter(bullet => bullet.isActive);
        if (this.boss && this.boss.bullets) {
            this.boss.bullets = this.boss.bullets.filter(bullet => bullet.isActive);
        }
        this.textParticles = this.textParticles.filter(particle => particle.isActive);

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
                    const enemyWasActive = enemy.isActive; // Check before takeDamage
                    const expGained = enemy.takeDamage(bullet.damage);
                    
                    if (enemyWasActive && !enemy.isActive && !enemy.isBoss) { // Enemy was just destroyed and is not boss
                        const particleX = enemy.x + enemy.width / 2;
                        const particleY = enemy.y + enemy.height / 2;
                        let deathText = "";
                        if (enemy instanceof EnemyType1) {
                            if (Math.random() < 0.2) {
                                deathText = ENEMY_TYPE_1_SPECIAL_DEATH_TEXT; 
                            } else {
                                deathText = ENEMY_TYPE_1_DEATH_TEXTS[Math.floor(Math.random() * ENEMY_TYPE_1_DEATH_TEXTS.length)];
                            }
                        } else if (enemy instanceof EnemyType2) {
                            if (Math.random() < 0.3) { // 30% chance for special death text
                                deathText = ENEMY_TYPE_2_SPECIAL_DEATH_TEXTS[Math.floor(Math.random() * ENEMY_TYPE_2_SPECIAL_DEATH_TEXTS.length)];
                            } else {
                                // Use EnemyType1's standard death texts if special condition is not met
                                deathText = ENEMY_TYPE_1_DEATH_TEXTS[Math.floor(Math.random() * ENEMY_TYPE_1_DEATH_TEXTS.length)];
                            }
                        } else if (enemy instanceof BossEnemy) {
                            // Boss death text is handled by its own dialogue system, or you can add specific text here
                        }

                        if (deathText) {
                            this.textParticles.push(new TextParticle(particleX, particleY, deathText));
                        }
                    }

                    if (expGained > 0) {
                        this.player.gainExp(expGained);
                    }
                }
            });
        });

        // Enemies vs Player (collision and enemy bullets)
        this.enemies.forEach(enemy => {
            if (!enemy.isActive) return;

            // Direct collision with player
            if (checkCollision(this.player, enemy)) {
                if (!enemy.isBoss) { // Regular enemies die and damage player
                    this.player.takeDamage(enemy.collisionDamage);
                    enemy.isActive = false; 
                    // Play player hit sound & enemy destroy sound
                } else {
                    // Player is overlapping with Boss. HP regeneration is handled in Player.update().
                    // Boss does not take damage from this type of collision, nor does player.
                    // Dialogue change is handled in BossEnemy.updateDialogue().
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
        // Removed ctx.save(), ctx.scale(), ctx.restore()

        // Clear canvas (using original CANVAS_WIDTH/HEIGHT)
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw background based on game state
        if (this.gameState === GAME_STATE_LEVEL_CLEAR) {
            const img = this.resourceManager.getImage(ENDING_SUCCESS_IMAGE_SRC);
            if (img && img.complete && img.naturalHeight !== 0) {
                this.ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }
        } else if (this.gameState === GAME_STATE_GAME_OVER) {
            const img = this.resourceManager.getImage(ENDING_FAIL_IMAGE_SRC);
            if (img && img.complete && img.naturalHeight !== 0) {
                this.ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }
        } else {
            // Default scrolling background for playing, start screen, or if ending images not loaded
            this.ctx.fillStyle = '#001f3f'; // Dark blue background
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            this.drawStars(); // Add some stars for a simple space effect
        }

        // Draw game objects ONLY if playing
        if (this.gameState === GAME_STATE_PLAYING) {
            if(this.player) this.player.draw(this.ctx);
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
            // Player bullets are drawn by player.draw(), boss bullets by boss.draw()
            // So we only need to draw text particles separately if they are managed by the game class
            this.textParticles.forEach(particle => particle.draw(this.ctx));
        }

        // Draw UI on top of everything (UI class will handle what to show based on state)
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