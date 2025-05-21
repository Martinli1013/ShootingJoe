class Bullet extends GameObject {
    /**
     * Creates a new Bullet.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {number} speed - The speed of the bullet (positive for player, can be negative for enemy).
     * @param {number} damage - The damage this bullet inflicts.
     * @param {boolean} isPlayerBullet - True if shot by player, false otherwise.
     * @param {number} [angle=Math.PI / 2] - Angle of movement in radians (PI/2 is straight up).
     *                                        Player bullets ignore this and always go up.
     *                                        Boss bullets use this for varied patterns.
     */
    constructor(x, y, speed, damage, isPlayerBullet, angle = Math.PI / 2) {
        let width, height, color;
        if (isPlayerBullet) {
            width = PLAYER_BULLET_WIDTH;
            height = PLAYER_BULLET_HEIGHT;
            color = PLAYER_BULLET_COLOR;
        } else {
            // Assuming boss bullets for now, can be more generic later
            // This will be refined in the Enemy class when Boss shoots
            width = BOSS_BULLET1_WIDTH; // Default, can be overridden by specific boss bullet types
            height = BOSS_BULLET1_HEIGHT;
            color = BOSS_BULLET1_COLOR;
        }
        super(x, y, width, height, color);
        this.speed = speed;
        this.damage = damage;
        this.isPlayerBullet = isPlayerBullet;
        this.angle = angle; // Used by enemy bullets for direction

        // For bullets that don't move straight up/down
        this.dx = Math.cos(this.angle - Math.PI / 2) * this.speed;
        this.dy = Math.sin(this.angle - Math.PI / 2) * this.speed;
    }

    update(deltaTime) {
        if (this.isPlayerBullet) {
            this.y -= this.speed; // Player bullets always go up
        } else {
            // Enemy bullets can move based on angle
            this.y += this.dy; // Positive dy for downward movement in typical canvas coords
            this.x += this.dx;
        }

        // Deactivate bullet if it goes off-screen
        if (this.y < -this.height || this.y > CANVAS_HEIGHT || this.x < -this.width || this.x > CANVAS_WIDTH) {
            this.isActive = false;
        }
    }

    // Draw method is inherited from GameObject if basic rectangle is fine.
    // Can be overridden for custom bullet appearance (e.g., drawing a sprite).
} 