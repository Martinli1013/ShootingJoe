// Base class for all enemies
class Enemy extends GameObject {
    constructor(x, y, width, height, color, hp, speed, collisionDamage, expValue, imageSrc, resourceManager) {
        super(x, y, width, height, color);
        this.hp = hp;
        this.maxHp = hp; // Initialize maxHp to the starting HP
        this.speed = speed;
        this.collisionDamage = collisionDamage;
        this.expValue = expValue;
        this.isBoss = false; // Differentiate boss from regular enemies for game logic
        this.resourceManager = resourceManager;
        this.imageSrc = imageSrc;
        this.image = imageSrc ? this.resourceManager.getImage(imageSrc) : null;

        if (!this.image && imageSrc) {
            console.warn("Enemy image failed to load from ResourceManager:", imageSrc);
        }
    }

    // Basic downward movement, can be overridden by specific enemy types
    update(deltaTime, player) {
        this.y += this.speed;
        // Deactivate if off-screen (bottom)
        if (this.y > CANVAS_HEIGHT) {
            this.isActive = false;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.isActive = false;
            // Return EXP value when destroyed
            return this.expValue;
        }
        return 0; // No EXP if not destroyed
    }

    draw(ctx) {
        if (!this.isActive) return;
        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.color || 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            if (this.imageSrc && !this.image) {
                // console.warn("Drawing fallback for Enemy, image not loaded:", this.imageSrc);
            }
        }
    }
}

// Enemy Type 1: "女高中生" - Randomly flying
class EnemyType1 extends Enemy {
    constructor(x, y, playerLevel = 1, resourceManager) {
        const speedIncrease = (playerLevel - 1) * ENEMY1_SPEED_SCALING_PER_PLAYER_LEVEL;
        const currentSpeedMin = ENEMY1_SPEED_MIN + speedIncrease;
        const currentSpeedMax = ENEMY1_SPEED_MAX + speedIncrease;
        
        const speed = getRandomFloat(currentSpeedMin, currentSpeedMax);
        super(x, y, ENEMY1_WIDTH, ENEMY1_HEIGHT, ENEMY1_COLOR, ENEMY1_HP, speed, ENEMY1_COLLISION_DAMAGE, ENEMY1_EXP, 'img/imgenemy_girl.png', resourceManager);
        // Add some horizontal movement tendency
        this.dx = getRandomFloat(-1, 1) * this.speed * 0.5; // Slower horizontal drift
    }

    update(deltaTime, player) {
        this.y += this.speed; // Basic downward movement
        this.x += this.dx;   // Horizontal drift

        // Boundary check for horizontal movement (bounce off sides)
        if (this.x <= 0 || this.x + this.width >= CANVAS_WIDTH) {
            this.dx *= -1;
        }

        if (this.y > CANVAS_HEIGHT) {
            this.isActive = false;
        }
    }
}

// Enemy Type 2: "熟女" - Tracks player slowly
class EnemyType2 extends Enemy {
    constructor(x, y, resourceManager) {
        super(x, y, ENEMY2_WIDTH, ENEMY2_HEIGHT, ENEMY2_COLOR, ENEMY2_HP, ENEMY2_SPEED, ENEMY2_COLLISION_DAMAGE, ENEMY2_EXP, 'img/imgenemy_lady.png', resourceManager);
    }

    update(deltaTime, player) {
        if (!player || !player.isActive) {
            // If no player, just move down slowly
            this.y += this.speed;
        } else {
            // Calculate direction towards player
            const diffX = player.x + player.width / 2 - (this.x + this.width / 2);
            const diffY = player.y + player.height / 2 - (this.y + this.height / 2);
            const distance = Math.sqrt(diffX * diffX + diffY * diffY);

            if (distance > 0) { // Avoid division by zero
                this.x += (diffX / distance) * this.speed;
                this.y += (diffY / distance) * this.speed;
            }
        }

        if (this.y > CANVAS_HEIGHT) {
            this.isActive = false;
        }
    }
}

// Boss Enemy: "蜘蛛精"
class BossEnemy extends Enemy {
    constructor(resourceManager) {
        super(BOSS_X, BOSS_Y, BOSS_WIDTH, BOSS_HEIGHT, BOSS_COLOR, BOSS_INITIAL_HP, 0, 0, 0, 'img/imgboss_main.png', resourceManager);
        this.isBoss = true;
        this.bullets = [];
        this.lastAttackTime = Date.now(); // Initialize lastAttackTime
        this.attackPattern = 1; // Start with pattern 1

        // Dialogue properties
        this.currentDialogueText = null;
        this.dialogueDisplayUntil = 0;
        this.nextDialogueTime = Date.now() + BOSS_DIALOGUE_INTERVAL_NORMAL;
        this.dialogueFont = BOSS_DIALOGUE_FONT;
        this.dialogueColor = BOSS_DIALOGUE_COLOR;
    }

    update(deltaTime, player) {
        const now = Date.now();
        let currentPatternInterval = (this.attackPattern === 1) ? BOSS_FIRE_INTERVAL_PATTERN_1 : BOSS_FIRE_INTERVAL_PATTERN_2;

        if (now - this.lastAttackTime > currentPatternInterval) {
            if (this.attackPattern === 1) {
                this.fireBigBullet(player);
                this.attackPattern = 2; // Switch to pattern 2
            } else {
                this.fireSpreadPattern(); // No player target for spread pattern
                this.attackPattern = 1; // Switch back to pattern 1
            }
            this.lastAttackTime = now;
        }

        this.bullets = this.bullets.filter(bullet => bullet.isActive);
        this.bullets.forEach(bullet => bullet.update(deltaTime));
        this.updateDialogue(player);
    }

    fireBigBullet(player) {
        if (!player || !player.isActive) return;
        const bulletX = this.x + this.width / 2 - BOSS_BULLET1_WIDTH / 2;
        const bulletY = this.y + this.height; // Start from bottom of boss

        // Angle for tracking bullet (initial aim, tracking will adjust)
        const angleToPlayer = Math.atan2(
            player.y + player.height / 2 - (bulletY + BOSS_BULLET1_HEIGHT / 2),
            player.x + player.width / 2 - (bulletX + BOSS_BULLET1_WIDTH / 2)
        );

        this.bullets.push(new Bullet(
            bulletX, bulletY,
            BOSS_BULLET1_SPEED,
            BOSS_BULLET1_DAMAGE,
            false, // isPlayerBullet
            angleToPlayer, // angle
            BOSS_BULLET1_IMAGE_SRC,
            BOSS_BULLET1_WIDTH, BOSS_BULLET1_HEIGHT,
            player, // target for tracking
            'purple', // Fallback color for Boss Bullet 1
            this.resourceManager
        ));
    }

    fireSpreadPattern() {
        const numBullets = BOSS_BULLET2_COUNT; // 10 bullets
        const spreadAngle = BOSS_BULLET2_SPREAD_ANGLE; // Math.PI (180 degrees)
        // Start shooting from 0 radians (right) to PI radians (left), effectively covering the bottom semi-circle.
        // Or, to be centered downwards: (Math.PI / 2) - (spreadAngle / 2) to (Math.PI / 2) + (spreadAngle / 2)
        // For a 180-degree spread centered downwards, this means 0 to PI.
        // Correcting for canvas coordinates where 0 is right, PI/2 is down:
        // We want to shoot from PI/2 - PI/2 = 0 (right) to PI/2 + PI/2 = PI (left), effectively a downward fan.
        // Let's adjust so it's more intuitive: 0 degrees is right, 90 is down, 180 is left.
        // The arc should span from boss's right, downwards, to its left.
        // So, angles from 0 to Math.PI, assuming (0,0) is top-left and positive Y is down.
        // Start angle for the spread. To make it go from right, down, to left:
        // An angle of 0 radians is to the right.
        // An angle of Math.PI / 2 radians is downwards.
        // An angle of Math.PI radians is to the left.
        // The loop will go from angle = 0 to angle = Math.PI.

        const angleStep = spreadAngle / (numBullets - 1); // Angle between each bullet
        
        for (let i = 0; i < numBullets; i++) {
            const currentAngle = i * angleStep; // Angle from 0 to PI for a 180-degree spread downwards and sideways
            
            const bulletX = this.x + this.width / 2 - BOSS_BULLET2_WIDTH / 2;
            const bulletY = this.y + this.height / 2; // Fire from center-ish Y of boss for better spread appearance

            this.bullets.push(new Bullet(
                bulletX, bulletY,
                BOSS_BULLET2_SPEED,
                BOSS_BULLET2_DAMAGE,
                false, // isPlayerBullet
                currentAngle, // angle
                BOSS_BULLET2_IMAGE_SRC,
                BOSS_BULLET2_WIDTH, BOSS_BULLET2_HEIGHT,
                null, // No target for non-tracking bullets
                BOSS_BULLET2_COLOR, // Yellow fallback color
                this.resourceManager
            ));
        }
    }

    attack(player) { // This method seems to be a duplicate or older version. Will remove if not used by main update loop.
        // The main update loop now calls fireBigBullet and fireSpreadPattern directly.
        // Keeping it for now in case of subtle dependencies, but likely can be removed.
        if (!player || !player.isActive) return;

        this.attackPatternToggle = !this.attackPatternToggle;

        if (this.attackPatternToggle) {
            const bulletX = this.x + this.width / 2 - BOSS_BULLET1_WIDTH / 2;
            const bulletY = this.y + this.height;
            const angleToPlayer = Math.atan2(
                player.y + player.height / 2 - (bulletY + BOSS_BULLET1_HEIGHT / 2),
                player.x + player.width / 2 - (bulletX + BOSS_BULLET1_WIDTH / 2)
            );
            this.bullets.push(new Bullet(bulletX, bulletY, BOSS_BULLET1_SPEED, BOSS_BULLET1_DAMAGE, false, angleToPlayer, BOSS_BULLET1_IMAGE_SRC, BOSS_BULLET1_WIDTH, BOSS_BULLET1_HEIGHT, player, 'purple', this.resourceManager));
        } else {
            const baseAngleToPlayer = Math.atan2(
                player.y + player.height / 2 - (this.y + this.height + BOSS_BULLET2_HEIGHT / 2),
                player.x + player.width / 2 - (this.x + this.width / 2 - BOSS_BULLET2_WIDTH / 2)
            );
            const totalSpread = BOSS_BULLET2_SPREAD_ANGLE; // This would use the new 180 degree constant
            const angleStepOld = BOSS_BULLET2_COUNT > 1 ? totalSpread / (BOSS_BULLET2_COUNT - 1) : 0;
            const startAngleOld = baseAngleToPlayer - totalSpread / 2;

            for (let i = 0; i < BOSS_BULLET2_COUNT; i++) {
                const bulletX = this.x + this.width / 2 - BOSS_BULLET2_WIDTH / 2;
                const bulletY = this.y + this.height;
                const currentAngleOld = startAngleOld + (i * angleStepOld);
                this.bullets.push(new Bullet(bulletX, bulletY, BOSS_BULLET2_SPEED, BOSS_BULLET2_DAMAGE, false, currentAngleOld, BOSS_BULLET2_IMAGE_SRC, BOSS_BULLET2_WIDTH, BOSS_BULLET2_HEIGHT, null, BOSS_BULLET2_COLOR, this.resourceManager)); // Now null target
            }
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        console.log(`Boss HP: ${this.hp}/${BOSS_INITIAL_HP}`);
        if (this.hp <= 0) {
            this.isActive = false;
            console.log("BOSS DEFEATED!");
            // No EXP from this method, EXP given by game logic for defeating boss
            // Or, we can return a special value or a large EXP amount here if preferred.
            return 500; // Example: Boss gives 500 EXP directly
        }
        return 0;
    }

    draw(ctx) {
        // Call the base Enemy draw method (which now handles image drawing)
        super.draw(ctx); 
        // Draw boss bullets
        this.bullets.forEach(bullet => bullet.draw(ctx));

        // Draw dialogue text
        if (this.currentDialogueText) {
            ctx.font = this.dialogueFont;
            ctx.fillStyle = this.dialogueColor;
            ctx.textAlign = 'center';
            // Position dialogue above the boss
            ctx.fillText(this.currentDialogueText, this.x + this.width / 2, this.y + BOSS_DIALOGUE_Y_OFFSET);
        }
    }

    updateDialogue(player) {
        const now = Date.now();

        // Clear dialogue if its time is up
        if (this.currentDialogueText && now > this.dialogueDisplayUntil) {
            this.currentDialogueText = null;
        }

        // Check if it's time for new dialogue
        if (!this.currentDialogueText && now >= this.nextDialogueTime) {
            let dialogueList;
            let dialogueInterval = BOSS_DIALOGUE_INTERVAL_NORMAL; // Default interval

            if (player && player.isActive && checkCollision(this, player)) {
                dialogueList = BOSS_DIALOGUE_OVERLAPPING;
                // Optionally, use a different interval/duration for overlapping dialogue
                // dialogueInterval = BOSS_DIALOGUE_INTERVAL_OVERLAPPING; 
            } else {
                const isLowHP = this.hp < (this.maxHp * BOSS_DIALOGUE_LOW_HP_THRESHOLD);
                dialogueList = isLowHP ? BOSS_DIALOGUE_LOW_HP : BOSS_DIALOGUE_NORMAL;
                dialogueInterval = isLowHP ? BOSS_DIALOGUE_INTERVAL_LOW_HP : BOSS_DIALOGUE_INTERVAL_NORMAL;
            }

            if (dialogueList && dialogueList.length > 0) {
                this.currentDialogueText = dialogueList[Math.floor(Math.random() * dialogueList.length)];
                this.dialogueDisplayUntil = now + BOSS_DIALOGUE_DURATION;
                this.nextDialogueTime = now + dialogueInterval;
            }
        }
    }
} 