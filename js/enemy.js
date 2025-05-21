// Base class for all enemies
class Enemy extends GameObject {
    constructor(x, y, width, height, color, hp, speed, collisionDamage, expValue) {
        super(x, y, width, height, color);
        this.hp = hp;
        this.speed = speed;
        this.collisionDamage = collisionDamage;
        this.expValue = expValue;
        this.isBoss = false; // Differentiate boss from regular enemies for game logic
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

    // draw method is inherited from GameObject
}

// Enemy Type 1: "女高中生" - Randomly flying
class EnemyType1 extends Enemy {
    constructor(x, y) {
        const speed = getRandomFloat(ENEMY1_SPEED_MIN, ENEMY1_SPEED_MAX);
        super(x, y, ENEMY1_WIDTH, ENEMY1_HEIGHT, ENEMY1_COLOR, ENEMY1_HP, speed, ENEMY1_COLLISION_DAMAGE, ENEMY1_EXP);
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
    constructor(x, y) {
        super(x, y, ENEMY2_WIDTH, ENEMY2_HEIGHT, ENEMY2_COLOR, ENEMY2_HP, ENEMY2_SPEED, ENEMY2_COLLISION_DAMAGE, ENEMY2_EXP);
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
    constructor() {
        super(BOSS_X, BOSS_Y, BOSS_WIDTH, BOSS_HEIGHT, BOSS_COLOR, BOSS_INITIAL_HP, 0, 0, 0); // Boss damage by bullets, not collision; no EXP from collision
        this.isBoss = true;
        this.bullets = [];
        this.lastAttackTime = Date.now();
        this.attackPatternToggle = false; // To switch between bullet types
    }

    update(deltaTime, player) {
        // Boss is stationary, so no movement update for x, y unless specifically designed

        // Attack logic
        const now = Date.now();
        if (now - this.lastAttackTime > BOSS_ATTACK_INTERVAL) {
            this.attack(player);
            this.lastAttackTime = now;
        }

        // Update boss bullets
        this.bullets = this.bullets.filter(bullet => bullet.isActive);
        this.bullets.forEach(bullet => bullet.update(deltaTime));
    }

    attack(player) {
        if (!player || !player.isActive) return; // Don't attack if no player

        this.attackPatternToggle = !this.attackPatternToggle;

        if (this.attackPatternToggle) {
            // Attack Pattern 1: Single large bullet aimed at player
            const bulletX = this.x + this.width / 2 - BOSS_BULLET1_WIDTH / 2;
            const bulletY = this.y + this.height; // From bottom of boss

            // Calculate angle towards player
            const angleToPlayer = Math.atan2(
                player.y + player.height / 2 - (bulletY + BOSS_BULLET1_HEIGHT / 2),
                player.x + player.width / 2 - (bulletX + BOSS_BULLET1_WIDTH / 2)
            ) + Math.PI / 2; // Adjust because 0 rad is to the right, PI/2 is down

            const newBullet = new Bullet(
                bulletX, 
                bulletY, 
                BOSS_BULLET1_SPEED, 
                BOSS_BULLET1_DAMAGE, 
                false, // isPlayerBullet = false
                angleToPlayer
            );
            newBullet.width = BOSS_BULLET1_WIDTH;
            newBullet.height = BOSS_BULLET1_HEIGHT;
            newBullet.color = BOSS_BULLET1_COLOR;
            this.bullets.push(newBullet);
        } else {
            // Attack Pattern 2: Spread shot
            const baseAngle = Math.PI; // Shoots downwards
            const totalSpread = BOSS_BULLET2_SPREAD_ANGLE;
            const angleStep = BOSS_BULLET2_COUNT > 1 ? totalSpread / (BOSS_BULLET2_COUNT - 1) : 0;
            const startAngle = baseAngle - totalSpread / 2;

            for (let i = 0; i < BOSS_BULLET2_COUNT; i++) {
                const bulletX = this.x + this.width / 2 - BOSS_BULLET2_WIDTH / 2;
                const bulletY = this.y + this.height; // From bottom of boss
                const currentAngle = startAngle + (i * angleStep);
                
                const newBullet = new Bullet(
                    bulletX, 
                    bulletY, 
                    BOSS_BULLET2_SPEED, 
                    BOSS_BULLET2_DAMAGE, 
                    false, // isPlayerBullet = false
                    currentAngle
                );
                newBullet.width = BOSS_BULLET2_WIDTH;
                newBullet.height = BOSS_BULLET2_HEIGHT;
                newBullet.color = BOSS_BULLET2_COLOR;
                this.bullets.push(newBullet);
            }
        }
        // Play boss attack sound
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
        super.draw(ctx); // Draw the boss body
        // Draw boss bullets
        this.bullets.forEach(bullet => bullet.draw(ctx));
    }
} 