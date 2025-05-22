class Bullet extends GameObject {
    /**
     * Creates a new Bullet.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {number} speed - The speed of the bullet.
     * @param {number} damage - The damage this bullet inflicts.
     * @param {boolean} isPlayerBullet - True if shot by player, false otherwise.
     * @param {number} angle - Angle of movement in radians.
     * @param {string} imageSrc - Path to the bullet image.
     * @param {number} width - Width of the bullet.
     * @param {number} height - Height of the bullet.
     * @param {GameObject | null} target - Optional target for the bullet to track.
     * @param {string | null} color - Fallback color for the bullet if image fails or is not specified.
     * @param {ResourceManager} resourceManager - The resource manager for loading images.
     */
    constructor(x, y, speed, damage, isPlayerBullet, angle, imageSrc, width, height, target = null, color = 'white', resourceManager) {
        super(x, y, width, height, null); // Base GameObject color not used directly for drawing bullets with images
        this.speed = speed;
        this.damage = damage;
        this.isPlayerBullet = isPlayerBullet;
        this.angle = angle; 
        this.target = target; // Store the target
        this.color = color; // Store the fallback color
        this.dx = Math.cos(this.angle) * this.speed;
        this.dy = Math.sin(this.angle) * this.speed;
        this.resourceManager = resourceManager;
        this.imageSrc = imageSrc;
        this.image = imageSrc ? this.resourceManager.getImage(imageSrc) : null;

        if (!this.image && imageSrc) {
            console.warn("Bullet image failed to load from ResourceManager:", imageSrc);
        }
    }

    update(deltaTime) {
        if (this.target && this.target.isActive) {
            // Calculate direction towards target's center
            const targetCenterX = this.target.x + this.target.width / 2;
            const targetCenterY = this.target.y + this.target.height / 2;
            const currentCenterX = this.x + this.width / 2;
            const currentCenterY = this.y + this.height / 2;

            const diffX = targetCenterX - currentCenterX;
            const diffY = targetCenterY - currentCenterY;
            const distance = Math.sqrt(diffX * diffX + diffY * diffY);

            if (distance > 0) { // Avoid division by zero and update dx/dy
                this.dx = (diffX / distance) * this.speed;
                this.dy = (diffY / distance) * this.speed;
            }
            // Optionally, update this.angle if needed for rotation or other logic
            // this.angle = Math.atan2(this.dy, this.dx);
        }
        // If no target, or target becomes inactive, it will continue with its last dx/dy,
        // or you could revert to initial angle-based movement if preferred.
        // For simplicity, current implementation continues last trajectory if target is lost.

        this.y += this.dy;
        this.x += this.dx;

        if (this.y < -this.height || this.y > CANVAS_HEIGHT || this.x < -this.width || this.x > CANVAS_WIDTH) {
            this.isActive = false;
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Only draw fallback color if no imageSrc was intended or image failed to load via manager
            if (!this.imageSrc || (this.imageSrc && !this.image)){
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                if (this.imageSrc && !this.image) {
                    // console.warn("Drawing fallback for Bullet, image not loaded:", this.imageSrc);
                }
            }
            // If imageSrc was provided, and image is being loaded (but not yet complete), we draw nothing to avoid flicker.
        }
    }
} 