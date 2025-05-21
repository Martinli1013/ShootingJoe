class Player extends GameObject {
    constructor(x, y) {
        super(x, y, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_COLOR);
        this.hp = PLAYER_INITIAL_HP;
        this.maxHp = PLAYER_INITIAL_HP;
        this.atk = PLAYER_INITIAL_ATK;
        this.exp = 0;
        this.level = 1;
        this.speed = PLAYER_SPEED;

        this.bullets = [];
        this.lastShotTime = 0;
        this.fireRate = PLAYER_FIRE_RATE;

        // Input handling
        this.keys = {};
        this.isFlashing = false;
        this.flashEndTime = 0;
        this.flashVisible = true;
        this.lastFlashToggleTime = 0;

        this.zhaogeImage = null; // Placeholder for "卓哥的小照片"
        this.showZhaogeImageTime = 0;
        this.justLeveledUp = false; // Flag for level up message
        // this.loadZhaogeImage(); // Implement image loading if using actual images
    }

    // Placeholder for image loading
    // loadZhaogeImage() {
    //     this.zhaogeImage = new Image();
    //     this.zhaogeImage.src = 'path/to/zhaoge_photo.png'; // Replace with actual path
    // }

    handleInput(keys) {
        this.keys = keys;
    }

    update(deltaTime) {
        // Movement
        if (this.keys['ArrowLeft']) this.x -= this.speed;
        if (this.keys['ArrowRight']) this.x += this.speed;
        if (this.keys['ArrowUp']) this.y -= this.speed;
        if (this.keys['ArrowDown']) this.y += this.speed;

        // Keep player within canvas bounds
        this.x = clamp(this.x, 0, CANVAS_WIDTH - this.width);
        this.y = clamp(this.y, 0, CANVAS_HEIGHT - this.height);

        // Automatic shooting
        const now = Date.now();
        if (now - this.lastShotTime > this.fireRate) {
            this.shoot();
            this.lastShotTime = now;
        }

        // Update bullets
        this.bullets = this.bullets.filter(bullet => bullet.isActive);
        this.bullets.forEach(bullet => bullet.update(deltaTime));

        // Handle flashing when hit
        if (this.isFlashing) {
            if (now > this.flashEndTime) {
                this.isFlashing = false;
                this.flashVisible = true; // Ensure player is visible when flashing ends
            } else {
                if (now - this.lastFlashToggleTime > PLAYER_HIT_FLASH_INTERVAL) {
                    this.flashVisible = !this.flashVisible;
                    this.lastFlashToggleTime = now;
                }
            }
        }
        if (this.showZhaogeImageTime > 0 && now > this.showZhaogeImageTime) {
            this.showZhaogeImageTime = 0;
        }
    }

    shoot() {
        // Create a new bullet instance
        // Bullet starts from the center-top of the player
        const bulletX = this.x + this.width / 2 - PLAYER_BULLET_WIDTH / 2;
        const bulletY = this.y - PLAYER_BULLET_HEIGHT; // Just above the player
        const newBullet = new Bullet(bulletX, bulletY, PLAYER_BULLET_SPEED, this.atk, true);
        this.bullets.push(newBullet);
        // Play shoot sound (to be implemented in game.js or audio manager)
    }

    takeDamage(amount) {
        if (this.isFlashing) return; // Invulnerable while flashing

        this.hp -= amount;
        this.hp = Math.max(0, this.hp); // HP cannot go below 0

        // Start flashing
        this.isFlashing = true;
        this.flashVisible = false; // Start by being invisible
        this.flashEndTime = Date.now() + PLAYER_HIT_FLASH_DURATION;
        this.lastFlashToggleTime = Date.now();

        // Show "卓哥的小照片"
        this.showZhaogeImageTime = Date.now() + 500; // Show for 0.5 seconds
        console.log("Player hit! HP:", this.hp); // For debugging

        if (this.hp <= 0) {
            this.isActive = false; // Player is destroyed
            console.log("Player destroyed!");
            // Trigger game over (to be handled in game.js)
        }
    }

    gainExp(amount) {
        this.exp += amount;
        console.log(`Player gained ${amount} EXP. Total EXP: ${this.exp}`);
        if (this.exp >= EXP_TO_LEVEL_UP) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp -= EXP_TO_LEVEL_UP; // Or this.exp = 0; if reset fully
        this.maxHp += LEVEL_UP_HP_BONUS;
        this.hp += LEVEL_UP_HP_BONUS; // Heal and increase max HP
        this.atk += LEVEL_UP_ATK_BONUS;
        this.justLeveledUp = true; // Set flag here
        console.log(`LEVEL UP! Player is now Level ${this.level}. HP: ${this.hp}/${this.maxHp}, ATK: ${this.atk}`);
        // Change player image/sprite (needs image loading and management)
    }

    draw(ctx) {
        if (!this.isActive) return;

        // Draw bullets first (so they appear behind the player if necessary)
        this.bullets.forEach(bullet => bullet.draw(ctx));

        if (this.flashVisible) {
            // Placeholder: draw player as a rectangle
            // In a real game, this would be ctx.drawImage for the player's sprite
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Draw "卓哥的小照片" if active
        if (this.showZhaogeImageTime > 0 && Date.now() < this.showZhaogeImageTime) {
            // Placeholder for Zhaoge image. Replace with actual image drawing.
            ctx.fillStyle = 'yellow'; // Placeholder color
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("卓哥!", this.x + this.width / 2, this.y - 10);
            // if (this.zhaogeImage && this.zhaogeImage.complete) {
            //     ctx.drawImage(this.zhaogeImage, this.x + this.width / 2 - imgWidth / 2, this.y - imgHeight - 5, imgWidth, imgHeight);
            // }
        }
    }
} 