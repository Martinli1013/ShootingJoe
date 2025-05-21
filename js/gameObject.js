// Base class for all game objects (Player, Enemy, Bullet, etc.)
class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color; // Placeholder for actual sprite/animation
        this.isActive = true; // Game objects can be deactivated (e.g., when destroyed)
    }

    // Update object state (called every frame)
    update(deltaTime) {
        // To be implemented by derived classes
        // deltaTime can be used for frame-rate independent movement if needed
    }

    // Draw the object on the canvas (called every frame)
    draw(ctx) {
        // Basic rectangle drawing, to be overridden by derived classes for specific visuals
        if (this.isActive) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // Methods for collision or other interactions can be added here or in derived classes
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
} 