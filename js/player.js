class Player extends GameObject {
    constructor(x, y, resourceManager) {
        super(x, y, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_COLOR);
        this.hp = PLAYER_INITIAL_HP;
        this.maxHp = PLAYER_INITIAL_HP;
        this.atk = PLAYER_INITIAL_ATK;
        this.exp = 0;
        this.level = 1;
        this.speed = PLAYER_SPEED;
        this.updateSpeedForLevel();

        this.bullets = [];
        this.lastShotTime = 0;
        this.fireRate = PLAYER_FIRE_RATE;

        this.bulletWidth = PLAYER_BULLET_WIDTH;
        this.bulletHeight = PLAYER_BULLET_HEIGHT;

        this.keys = {};
        this.justLeveledUp = false;

        this.resourceManager = resourceManager;
        this.levelImages = {
            1: 'img/imgplayer_start.png',
            5: 'img/imgplayer_level5.png',
            10: 'img/imgplayer_level10.png',
            15: 'img/imgplayer_level15.png'
        };
        this.image = this.resourceManager.getImage(this.levelImages[1]); // Default image

        this.hitFeedbackImageSrc = 'img/imgplayer_hit_feedback.png';
        // this.hitFeedbackImage = this.resourceManager.getImage(this.hitFeedbackImageSrc); // Get preloaded image

        this.isShowingHitFeedback = false;
        this.hitFeedbackEndTime = 0;
        this.originalImageSrcBeforeHit = this.levelImages[1];
    }

    regenerateHp(amount) {
        this.hp += amount;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }

    setPlayerImageForLevel(level) {
        let srcToLoad = this.levelImages[1];
        if (level >= 15 && this.levelImages[15]) {
            srcToLoad = this.levelImages[15];
        } else if (level >= 10 && this.levelImages[10]) {
            srcToLoad = this.levelImages[10];
        } else if (level >= 5 && this.levelImages[5]) {
            srcToLoad = this.levelImages[5];
        }

        if (!this.isShowingHitFeedback) {
            this.image = this.resourceManager.getImage(srcToLoad);
            this.originalImageSrcBeforeHit = srcToLoad;
        } else {
            // If showing hit feedback, we still want to update what the original image *should* be
            // so when feedback ends, it reverts to the correct level image.
            this.originalImageSrcBeforeHit = srcToLoad;
        }
    }

    handleInput(keys) {
        this.keys = keys;
    }

    update(deltaTime, game) {
        if (this.keys['ArrowLeft']) this.x -= this.speed;
        if (this.keys['ArrowRight']) this.x += this.speed;
        if (this.keys['ArrowUp']) this.y -= this.speed;
        if (this.keys['ArrowDown']) this.y += this.speed;
        this.x = clamp(this.x, 0, CANVAS_WIDTH - this.width);
        this.y = clamp(this.y, 0, CANVAS_HEIGHT - this.height);
        this.shoot();
        this.bullets = this.bullets.filter(bullet => bullet.isActive);
        this.bullets.forEach(bullet => bullet.update(deltaTime));

        const now = Date.now();
        if (this.isShowingHitFeedback && now > this.hitFeedbackEndTime) {
            this.isShowingHitFeedback = false;
            this.image = this.resourceManager.getImage(this.originalImageSrcBeforeHit);
        }

        // Check for overlap with boss for HP regeneration
        if (game && game.boss && game.boss.isActive && checkCollision(this, game.boss)) {
            const regenAmount = (PLAYER_HP_REGEN_OVERLAPPING_PER_SECOND * deltaTime);
            this.regenerateHp(regenAmount);
            // console.log("Player overlapping with boss, regenerating HP. Current HP:", this.hp);
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShotTime < this.fireRate) return;
        this.lastShotTime = now;

        // Common bullet properties
        const playerCenterX = this.x + this.width / 2;
        const playerFrontY = this.y; // Bullets originate near the front of the player
        const playerMidY = this.y + this.height / 2; // For side shots

        let mainNumBullets = 1;
        let mainIsScatter = false;
        let mainBulletAngles = [-Math.PI / 2]; // Default: straight up
        let mainBulletWidth = this.bulletWidth;
        let mainBulletHeight = this.bulletHeight;
        let mainBulletImageSrc = PLAYER_BULLET_IMAGE_SRC;
        let currentBulletDamage = this.atk; // Base damage

        if (this.level >= 15) { // This includes Level 20+ for the forward part
            mainNumBullets = 6; // Forward 6-shot scatter
            mainIsScatter = true;
            const forwardSpreadDegrees = [-15, -9, -3, 3, 9, 15];
            mainBulletAngles = forwardSpreadDegrees.map(deg => -Math.PI / 2 - (deg * Math.PI / 180));
            mainBulletWidth = PLAYER_BULLET_WIDTH_LEVEL15;
            mainBulletHeight = PLAYER_BULLET_HEIGHT_LEVEL15;
            mainBulletImageSrc = PLAYER_BULLET_LARGE_IMAGE_SRC;
            // currentBulletDamage remains this.atk (full damage for level 15+)
        } else if (this.level >= 10) {
            mainNumBullets = 3; // Changed from 5 to 3
            currentBulletDamage = this.atk * 0.65; // 35% damage reduction
        } else if (this.level >= 5) {
            mainNumBullets = 2; // Changed from 3 to 2
            currentBulletDamage = this.atk * 0.60; // 40% damage reduction
        }
        // For levels 1-4, mainNumBullets is 1, currentBulletDamage is this.atk (full)

        const mainBulletSpacing = mainBulletWidth + 5;

        // Fire main (forward) bullets
        for (let i = 0; i < mainNumBullets; i++) {
            let currentBulletX;
            let currentAngle = -Math.PI / 2; // Default for non-scatter

            if (mainIsScatter) {
                currentBulletX = playerCenterX - mainBulletWidth / 2;
                currentAngle = mainBulletAngles[i % mainBulletAngles.length];
            } else {
                // Centered multi-shot (not scatter)
                currentBulletX = playerCenterX - mainBulletWidth / 2 + (i - Math.floor(mainNumBullets / 2)) * mainBulletSpacing;
            }
            
            const newBullet = new Bullet(
                currentBulletX,
                playerFrontY - mainBulletHeight, // Adjust Y to be slightly in front
                PLAYER_BULLET_SPEED,
                currentBulletDamage, // Use potentially modified damage
                true,
                currentAngle,
                mainBulletImageSrc,
                mainBulletWidth,
                mainBulletHeight,
                null,
                'white',
                this.resourceManager
            );
            this.bullets.push(newBullet);
        }

        // Level 20+ additional side attacks
        if (this.level >= 20) {
            const sideNumBullets = 3;
            const sideSpreadDegrees = [-10, 0, 10]; // Small spread for side shots
            const sideBulletWidth = PLAYER_BULLET_WIDTH; // Standard bullets for side
            const sideBulletHeight = PLAYER_BULLET_HEIGHT;
            const sideBulletImageSrc = PLAYER_BULLET_IMAGE_SRC;

            // Left side shots (angles around Math.PI)
            const leftBaseAngle = Math.PI;
            const leftBulletX = this.x - sideBulletWidth; // From left edge
            const leftBulletAngles = sideSpreadDegrees.map(deg => leftBaseAngle - (deg * Math.PI / 180));

            for (let i = 0; i < sideNumBullets; i++) {
                const newSideBullet = new Bullet(
                    leftBulletX,
                    playerMidY - sideBulletHeight / 2,
                    PLAYER_BULLET_SPEED,
                    this.atk, // Side bullets at level 20 still do full damage
                    true,
                    leftBulletAngles[i],
                    sideBulletImageSrc,
                    sideBulletWidth,
                    sideBulletHeight,
                    null,
                    'white',
                    this.resourceManager
                );
                this.bullets.push(newSideBullet);
            }

            // Right side shots (angles around 0 or 2*Math.PI)
            const rightBaseAngle = 0;
            const rightBulletX = this.x + this.width; // From right edge
            const rightBulletAngles = sideSpreadDegrees.map(deg => rightBaseAngle - (deg * Math.PI / 180));

            for (let i = 0; i < sideNumBullets; i++) {
                const newSideBullet = new Bullet(
                    rightBulletX,
                    playerMidY - sideBulletHeight / 2,
                    PLAYER_BULLET_SPEED,
                    this.atk, // Side bullets at level 20 still do full damage
                    true,
                    rightBulletAngles[i],
                    sideBulletImageSrc,
                    sideBulletWidth,
                    sideBulletHeight,
                    null,
                    'white',
                    this.resourceManager
                );
                this.bullets.push(newSideBullet);
            }
        }
    }

    takeDamage(amount) {
        if (this.isShowingHitFeedback) return;

        this.hp -= amount;
        this.hp = Math.max(0, this.hp);
        console.log("Player hit! HP:", this.hp);

        const hitImg = this.resourceManager.getImage(this.hitFeedbackImageSrc);
        if (hitImg && hitImg.complete && hitImg.naturalHeight !== 0) {
            this.image = hitImg;
            this.isShowingHitFeedback = true;
            this.hitFeedbackEndTime = Date.now() + 300; // Show feedback for 300ms
        } else {
            console.warn("Hit feedback image not available from ResourceManager, src:", this.hitFeedbackImageSrc);
            // No visual feedback if image is not loaded, or just a color flash could be added here.
        }

        if (this.hp <= 0) {
            this.isActive = false;
            console.log("Player destroyed!");
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
        this.exp -= EXP_TO_LEVEL_UP;
        
        this.maxHp += LEVEL_UP_HP_BONUS;
        this.atk += LEVEL_UP_ATK_BONUS;
        this.updateSpeedForLevel();

        // Restore HP: level * 5, capped by new maxHp
        const hpToRestore = this.level * 5;
        this.hp += hpToRestore;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        // An alternative: this.hp = Math.min(this.hp + hpToRestore, this.maxHp);
        // And if you want full heal on level up: this.hp = this.maxHp;

        this.justLeveledUp = true;

        if (this.level >= 15) {
            this.bulletWidth = PLAYER_BULLET_WIDTH_LEVEL15;
            this.bulletHeight = PLAYER_BULLET_HEIGHT_LEVEL15;
        }
        this.setPlayerImageForLevel(this.level);

        console.log(`LEVEL UP! Player is now Level ${this.level}. HP: ${this.hp}/${this.maxHp}, ATK: ${this.atk}, Speed: ${this.speed.toFixed(2)}`);
    }

    updateSpeedForLevel() {
        if (this.level >= 20) {
            this.speed = 8.0;
        } else if (this.level >= 15) {
            this.speed = 6.5;
        } else if (this.level >= 10) {
            this.speed = 6.0;
        } else if (this.level >= 5) {
            this.speed = 5.5;
        } else {
            this.speed = PLAYER_SPEED; // Initial speed (5)
        }
    }

    draw(ctx) {
        if (!this.isActive) return;
        this.bullets.forEach(bullet => bullet.draw(ctx));

        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback if player image isn't available for some reason
            ctx.fillStyle = PLAYER_COLOR; // Defined in constants.js
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // console.warn("Drawing fallback for Player, image not loaded/available. Current image src expected:", this.image ? this.image.src : this.originalImageSrcBeforeHit);
        }
    }
} 