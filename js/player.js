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

        this.weaponLevel = 1; // Start at weapon level 1
        // mainBulletCount will be derived from weaponLevel in shoot() or by upgradeWeapon()
        // this.mainBulletCount = 1; // Removed, weaponLevel is the source of truth

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
        this.image = this.resourceManager.getImage(this.levelImages[1]);

        this.hitFeedbackImageSrc = 'img/imgplayer_hit_feedback.png';
        this.isShowingHitFeedback = false;
        this.hitFeedbackEndTime = 0;
        this.originalImageSrcBeforeHit = this.levelImages[1];
    }

    increaseAtk(amount) {
        this.atk += amount;
        console.log(`Player ATK increased by ${amount}. New ATK: ${this.atk}`);
    }

    increaseHp(amount) {
        this.maxHp += amount;
        this.hp += amount;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        console.log(`Player HP and MaxHP increased by ${amount}. Current HP: ${this.hp}/${this.maxHp}`);
    }

    // Renamed from addBullet and logic changed to increment weaponLevel
    upgradeWeapon() { 
        this.weaponLevel++;
        console.log(`Player weapon upgraded. New Weapon Level: ${this.weaponLevel}`);
    }

    regenerateHp(amount) { // Existing method for overlap healing, only current HP
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

        const playerCenterX = this.x + this.width / 2;
        const playerFrontY = this.y;
        const playerMidY = this.y + this.height / 2;

        const baseBulletDamage = this.atk;
        let numForwardBullets = 0;
        let numSideBulletsPerSide = 0;
        let numRearBullets = 0;

        // Determine bullet counts based on weaponLevel
        if (this.weaponLevel <= 5) {
            numForwardBullets = this.weaponLevel;
        } else if (this.weaponLevel <= 10) {
            numForwardBullets = 5;
            numSideBulletsPerSide = this.weaponLevel - 5;
        } else { // weaponLevel > 10
            numForwardBullets = 5;
            numSideBulletsPerSide = 5;
            numRearBullets = Math.min(5, this.weaponLevel - 10); // Cap rear bullets at 5
        }

        let forwardBulletEffectiveDamage = baseBulletDamage;
        if (numForwardBullets > 1 && this.weaponLevel <= 10) { // Damage reduction for multiple forward bullets only applies before rear bullets or if explicitly stated
             forwardBulletEffectiveDamage = baseBulletDamage * 0.60;
        }
        // As per rule: "前方和左右侧的子弹攻击力将不再随着武器等级的提升而减少" when rear bullets appear (WL > 10)
        // This implies the 0.60 modifier might not apply or is fixed once WL > 10.
        // For simplicity, if WL > 10, let's assume the 0.60 modifier has already been incorporated if numForwardBullets > 1.
        // The statement "不再减少" can be interpreted that the *base* for this 0.60 modifier (this.atk) doesn't get further penalized.
        // So, if numForwardBullets > 1, it's always 0.60 * atk. If 1, it's 1.0 * atk.
        if (numForwardBullets === 1) forwardBulletEffectiveDamage = baseBulletDamage; // Ensure single forward bullet does full damage

        const sideBulletEffectiveDamage = baseBulletDamage * 0.60; // Side bullets are always multiple if they exist
        const rearBulletEffectiveDamage = baseBulletDamage * 0.60; // Rear bullets are always multiple if they exist

        const bulletImg = PLAYER_BULLET_IMAGE_SRC;
        const bulletW = PLAYER_BULLET_WIDTH;
        const bulletH = PLAYER_BULLET_HEIGHT;
        const bulletSpeed = PLAYER_BULLET_SPEED;

        // Fire Forward Bullets
        if (numForwardBullets > 0) {
            const totalWidthOfForwardBullets = numForwardBullets * bulletW + (numForwardBullets - 1) * 5;
            const startXForward = playerCenterX - totalWidthOfForwardBullets / 2;
            for (let i = 0; i < numForwardBullets; i++) {
                const bulletX = startXForward + i * (bulletW + 5);
                this.bullets.push(new Bullet(bulletX, playerFrontY - bulletH, bulletSpeed, forwardBulletEffectiveDamage, true, -Math.PI / 2, bulletImg, bulletW, bulletH, null, 'white', this.resourceManager, 0));
            }
        }

        // Fire Side Bullets
        if (numSideBulletsPerSide > 0) {
            for (let i = 0; i < numSideBulletsPerSide; i++) {
                const offsetY = (numSideBulletsPerSide > 1) ? (i - (numSideBulletsPerSide -1) / 2) * (bulletH + 2) : 0;
                // Left side bullets
                this.bullets.push(new Bullet(this.x - bulletW, playerMidY - bulletH/2 + offsetY, bulletSpeed, sideBulletEffectiveDamage, true, Math.PI, bulletImg, bulletW, bulletH, null, 'white', this.resourceManager, -Math.PI / 2));
                // Right side bullets
                this.bullets.push(new Bullet(this.x + this.width, playerMidY - bulletH/2 + offsetY, bulletSpeed, sideBulletEffectiveDamage, true, 0, bulletImg, bulletW, bulletH, null, 'white', this.resourceManager, Math.PI / 2));
            }
        }

        // Fire Rear Bullets
        if (numRearBullets > 0) {
            const totalWidthOfRearBullets = numRearBullets * bulletW + (numRearBullets - 1) * 5;
            const startXRear = playerCenterX - totalWidthOfRearBullets / 2;
            for (let i = 0; i < numRearBullets; i++) {
                const bulletX = startXRear + i * (bulletW + 5);
                this.bullets.push(new Bullet(bulletX, this.y + this.height, bulletSpeed, rearBulletEffectiveDamage, true, Math.PI / 2, bulletImg, bulletW, bulletH, null, 'white', this.resourceManager, Math.PI));
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

    levelUp() {
        this.level++;
        this.exp -= EXP_TO_LEVEL_UP;
        this.updateSpeedForLevel();
        const hpToRestore = this.level * 5;
        this.hp += hpToRestore;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        this.justLeveledUp = true;
        this.setPlayerImageForLevel(this.level);
        console.log(`LEVEL UP! Player is now Level ${this.level}. HP: ${this.hp}/${this.maxHp}, ATK: ${this.atk}, Speed: ${this.speed.toFixed(2)}, WeaponLvl: ${this.weaponLevel}`);

        // Spawn Large Wine item
        // The 'game' instance is needed here. Assuming it's passed to levelUp or accessible via this.game.
        // If Player doesn't have direct access to game.items, this needs to be handled differently,
        // e.g., by returning a flag or a new item from levelUp and having Game.js handle the spawn.
        // For now, let's assume Player.levelUp() is called from Game.update() which can then handle the item.
        // For direct spawn here, we would need player.game.items.push(...)
    }

    gainExp(amount) {
        // if (this.gameState === GAME_STATE_LEVEL_CLEAR) return; // This check should be in Game.js
        this.exp += amount;
        // console.log(`Player gained ${amount} EXP. Total EXP: ${this.exp}`);
        let leveledUpThisCycle = false;
        while (this.exp >= EXP_TO_LEVEL_UP) {
            this.levelUp(); // This will set this.justLeveledUp = true
            leveledUpThisCycle = true;
        }
        // Return a flag if a level up occurred, so Game.js can spawn the item
        return leveledUpThisCycle;
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