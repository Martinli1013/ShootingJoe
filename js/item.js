class Item extends GameObject {
    constructor(x, y, itemType, itemSize, imageSrc, resourceManager, width, height) {
        super(x, y, width, height, null); // Use passed width and height
        this.itemType = itemType;
        this.itemSize = itemSize;
        this.imageSrc = imageSrc;
        this.resourceManager = resourceManager;
        this.image = this.resourceManager.getImage(this.imageSrc);
        this.speed = ITEM_FALL_SPEED;

        if (!this.image && this.imageSrc) {
            console.warn(`Item image failed to load from ResourceManager: ${this.imageSrc}`);
        }
    }

    update(deltaTime) {
        // this.y += this.speed * deltaTime; // deltaTime should be incorporated for frame-independent speed
        // A more robust way for frame-independent speed is: this.y += this.speed * (deltaTime / (1000/60)); if speed is pixels per frame
        // Assuming ITEM_FALL_SPEED is pixels per second, then this.y += this.speed * deltaTime; is correct.
        // For now, let's assume ITEM_FALL_SPEED is pixels per update cycle as it was simpler.
        // Reverting to simpler: this.y += this.speed;

        // Keeping frame-rate independent movement if deltaTime is consistently passed and ITEM_FALL_SPEED is pixels per second.
        // If ITEM_FALL_SPEED is pixels per frame, then the simpler this.y += ITEM_FALL_SPEED is fine.
        // Based on prior comments, assuming ITEM_FALL_SPEED is pixels per second and deltaTime is correctly used.
        // this.y += this.speed * deltaTime; // Use this.speed (which is ITEM_FALL_SPEED) and deltaTime

        this.y += this.speed; // Apply speed directly, assuming it's pixels per frame.

        // this.y += ITEM_FALL_SPEED; // REMOVE THIS LINE - Redundant and mixes movement logic

        if (this.y > CANVAS_HEIGHT) {
            this.isActive = false; // Deactivate if off-screen
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback drawing if image not loaded - for debugging
            ctx.fillStyle = 'purple'; 
            ctx.fillRect(this.x, this.y, this.width, this.height);
            if (this.imageSrc) {
                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.fillText(this.itemType.substring(0,1), this.x + 5, this.y + 10);
            }
            // console.warn(`Drawing fallback for Item, image not loaded: ${this.imageSrc}`);
        }
    }

    // Method to apply effect to player - to be called on collision
    applyEffect(player, game) {
        let message = "";
        switch (this.itemType) {
            case ITEM_TYPE_ALCOHOL:
                if (this.itemSize === ITEM_SIZE_SMALL) {
                    player.increaseAtk(ALCOHOL_SMALL_ATK_BONUS);
                    message = `ATK +${ALCOHOL_SMALL_ATK_BONUS}`;
                } else if (this.itemSize === ITEM_SIZE_MEDIUM) {
                    player.increaseAtk(ALCOHOL_MEDIUM_ATK_BONUS);
                    message = `ATK +${ALCOHOL_MEDIUM_ATK_BONUS}`;
                } else if (this.itemSize === ITEM_SIZE_LARGE) {
                    if (player.weaponLevel < 15) { // Max effective weapon level for bullet quantity is 15
                        player.upgradeWeapon();
                        message = "Weapon Upgraded!";
                    } else {
                        player.increaseAtk(10); // Grant +10 ATK if weapon level is already maxed out for bullet types
                        message = "ATK +10 (Max Weapon Reached)";
                    }
                }
                break;
            case ITEM_TYPE_SANDWICH:
                if (this.itemSize === ITEM_SIZE_SMALL) {
                    player.increaseHp(SANDWICH_SMALL_HP_BONUS);
                    message = `HP +${SANDWICH_SMALL_HP_BONUS}`;
                } else if (this.itemSize === ITEM_SIZE_MEDIUM) {
                    player.increaseHp(SANDWICH_MEDIUM_HP_BONUS);
                    message = `HP +${SANDWICH_MEDIUM_HP_BONUS}`;
                } else if (this.itemSize === ITEM_SIZE_LARGE) {
                    player.increaseHp(SANDWICH_LARGE_HP_BONUS);
                    message = `HP +${SANDWICH_LARGE_HP_BONUS}`;
                }
                break;
        }
        if (message && game && typeof game.displayMessage === 'function') {
            game.displayMessage(message, player.x, player.y - 20, 2000); // Display near player
        }
        this.isActive = false; // Item consumed
    }
} 