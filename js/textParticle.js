const TEXT_PARTICLE_LIFETIME = 1000; // 1 second in milliseconds
// const ENEMY_DEATH_TEXTS = ["啊", "哦哦", "哦哦哦", "哦哟", "噢哟哟", "啊欧", "欧欧"]; // Old list
// Corrected to 8 unique texts as per original request
const ENEMY_DEATH_TEXTS_FINAL = [
    "无册那麻痹啊",
    "卓哥卓哥",
    "是那个男人",
    "怎么说",
    "噢哟哟",
    "笑死",
    "请客",
    "卓皇爱我",
    "笑眯眯",
    "你还搁那搞笑呢"
];

class TextParticle extends GameObject {
    constructor(x, y, text) {
        super(x, y, 0, 0, null); // Width/height not really used for text like this, color is white
        this.text = text;
        this.creationTime = Date.now();
        this.font = UI_FONT; // Use the same font size as UI HP text
        this.color = UI_TEXT_COLOR; // White color
    }

    update(deltaTime) {
        if (Date.now() - this.creationTime > TEXT_PARTICLE_LIFETIME) {
            this.isActive = false;
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        // Draw text slightly above the enemy's center where it died
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2 - 5);
    }
} 