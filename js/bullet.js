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
     * @param {number} visualRotation - Rotation in radians for drawing (0 for up, PI/2 for left, PI for down, 3PI/2 for right).
     * @param {number | null} turnRate - Optional turning rate for tracking bullets (e.g., 0.1 for 10% towards target each frame).
     */
    constructor(x, y, speed, damage, isPlayerBullet, angle, imageSrc, width, height, target = null, color = 'white', resourceManager, visualRotation = 0, turnRate = null) {
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
        this.visualRotation = visualRotation; // Store the visual rotation
        this.turnRate = turnRate; // Store the turn rate

        if (!this.image && imageSrc) {
            console.warn("Bullet image failed to load from ResourceManager:", imageSrc);
        }
    }

    update(deltaTime) {
        if (this.target && this.target.isActive && this.turnRate !== null) {
            // "Inertial" or "Lazy" Tracking Logic
            const targetCenterX = this.target.x + this.target.width / 2;
            const targetCenterY = this.target.y + this.target.height / 2;
            const currentCenterX = this.x + this.width / 2;
            const currentCenterY = this.y + this.height / 2;

            // Ideal direction vector components towards the target
            const idealDx = targetCenterX - currentCenterX;
            const idealDy = targetCenterY - currentCenterY;
            
            // Normalize the ideal direction vector
            const distanceToTarget = Math.sqrt(idealDx * idealDx + idealDy * idealDy);
            let targetDirX = 0;
            let targetDirY = 0;
            if (distanceToTarget > 0) { // Avoid division by zero
                targetDirX = idealDx / distanceToTarget;
                targetDirY = idealDy / distanceToTarget;
            }

            // Ideal velocity components
            const idealSpeedX = targetDirX * this.speed;
            const idealSpeedY = targetDirY * this.speed;

            // Interpolate current velocity towards ideal velocity
            this.dx += (idealSpeedX - this.dx) * this.turnRate;
            this.dy += (idealSpeedY - this.dy) * this.turnRate;

            // Re-normalize to maintain constant speed (important for smooth turning)
            const currentSpeedMagnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            if (currentSpeedMagnitude > 0) {
                this.dx = (this.dx / currentSpeedMagnitude) * this.speed;
                this.dy = (this.dy / currentSpeedMagnitude) * this.speed;
            }
             // Optionally, update visualRotation based on new dx/dy if bullets should visually point where they move
             this.visualRotation = Math.atan2(this.dy, this.dx) + Math.PI / 2; // +PI/2 if 0 radians is right and image points up

        } else if (this.target && this.target.isActive && this.turnRate === null) {
            // Original perfect tracking logic (if turnRate is not set)
            const targetCenterX = this.target.x + this.target.width / 2;
            const targetCenterY = this.target.y + this.target.height / 2;
            const currentCenterX = this.x + this.width / 2;
            const currentCenterY = this.y + this.height / 2;

            const diffX = targetCenterX - currentCenterX;
            const diffY = targetCenterY - currentCenterY;
            const distance = Math.sqrt(diffX * diffX + diffY * diffY);

            if (distance > 0) { 
                this.dx = (diffX / distance) * this.speed;
                this.dy = (diffY / distance) * this.speed;
            }
        }
        // If no target, or target becomes inactive, it continues with its last dx/dy.

        this.y += this.dy;
        this.x += this.dx;

        if (this.y < -this.height || this.y > CANVAS_HEIGHT || this.x < -this.width || this.x > CANVAS_WIDTH) {
            this.isActive = false;
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            ctx.save();
            // Translate to the center of the bullet for rotation
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.visualRotation); 
            // Draw the image centered at the new origin
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
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