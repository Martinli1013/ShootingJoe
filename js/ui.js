class UI {
    constructor(game) {
        this.game = game; // Reference to the main game object to access player, state, etc.
    }

    draw(ctx) {
        // Draw Player HP Bar
        if (this.game.player) {
            const player = this.game.player;
            ctx.font = UI_FONT;
            ctx.fillStyle = UI_TEXT_COLOR;
            ctx.textAlign = 'left';
            ctx.fillText(`HP:`, UI_HP_BAR_X, UI_HP_BAR_Y - 5);
            
            const hpPercentage = player.hp / player.maxHp;
            let hpBarColor = UI_HP_BAR_COLOR_LOW;
            if (hpPercentage > 0.66) {
                hpBarColor = UI_HP_BAR_COLOR_FULL;
            } else if (hpPercentage > 0.33) {
                hpBarColor = UI_HP_BAR_COLOR_MEDIUM;
            }

            // Background of HP bar (e.g., dark gray)
            ctx.fillStyle = '#555';
            ctx.fillRect(UI_HP_BAR_X + 35, UI_HP_BAR_Y - 17, UI_HP_BAR_WIDTH, UI_HP_BAR_HEIGHT);
            // Foreground of HP bar (current health)
            ctx.fillStyle = hpBarColor;
            ctx.fillRect(UI_HP_BAR_X + 35, UI_HP_BAR_Y - 17, UI_HP_BAR_WIDTH * hpPercentage, UI_HP_BAR_HEIGHT);
            ctx.strokeStyle = UI_TEXT_COLOR;
            ctx.strokeRect(UI_HP_BAR_X + 35, UI_HP_BAR_Y - 17, UI_HP_BAR_WIDTH, UI_HP_BAR_HEIGHT); // Border

            // Draw Player Level and EXP Bar
            ctx.fillStyle = UI_TEXT_COLOR;
            ctx.fillText(`Level: ${player.level}`, UI_HP_BAR_X, UI_EXP_BAR_Y - 5);
            const expPercentage = player.exp / EXP_TO_LEVEL_UP;
            ctx.fillStyle = '#555';
            ctx.fillRect(UI_HP_BAR_X + 60, UI_EXP_BAR_Y - 17, UI_HP_BAR_WIDTH * 0.7, UI_HP_BAR_HEIGHT * 0.7);
            ctx.fillStyle = '#007bff'; // Blue for EXP
            ctx.fillRect(UI_HP_BAR_X + 60, UI_EXP_BAR_Y - 17, (UI_HP_BAR_WIDTH * 0.7) * expPercentage, UI_HP_BAR_HEIGHT * 0.7);
            ctx.strokeStyle = UI_TEXT_COLOR;
            ctx.strokeRect(UI_HP_BAR_X + 60, UI_EXP_BAR_Y - 17, UI_HP_BAR_WIDTH * 0.7, UI_HP_BAR_HEIGHT * 0.7);
        }

        // Draw Boss HP Bar (if boss exists and is active)
        if (this.game.boss && this.game.boss.isActive) {
            const boss = this.game.boss;
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = UI_TEXT_COLOR;
            ctx.textAlign = 'center';
            ctx.fillText("BOSS HP", CANVAS_WIDTH / 2, 30);

            const bossHpPercentage = boss.hp / BOSS_INITIAL_HP; // Assuming boss max HP is its initial HP
            const bossHpBarWidth = CANVAS_WIDTH * 0.6;
            const bossHpBarX = CANVAS_WIDTH / 2 - bossHpBarWidth / 2;

            ctx.fillStyle = '#555';
            ctx.fillRect(bossHpBarX, 40, bossHpBarWidth, UI_HP_BAR_HEIGHT);
            ctx.fillStyle = UI_HP_BAR_COLOR_LOW; // Boss HP always red for intensity
            ctx.fillRect(bossHpBarX, 40, bossHpBarWidth * bossHpPercentage, UI_HP_BAR_HEIGHT);
            ctx.strokeStyle = UI_TEXT_COLOR;
            ctx.strokeRect(bossHpBarX, 40, bossHpBarWidth, UI_HP_BAR_HEIGHT);
        }

        // Draw Game State Messages (Game Over, Level Clear)
        ctx.textAlign = 'center';
        ctx.fillStyle = UI_TEXT_COLOR;
        if (this.game.gameState === GAME_STATE_GAME_OVER) {
            ctx.font = '48px Arial';
            ctx.fillText('游戏结束!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
            ctx.font = '24px Arial';
            ctx.fillText('按 R 键再试一次', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        } else if (this.game.gameState === GAME_STATE_LEVEL_CLEAR) {
            ctx.font = '48px Arial';
            ctx.fillText('胜利!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
            // Add prompt for next level or restart if desired
        } else if (this.game.gameState === GAME_STATE_START_SCREEN) {
             ctx.font = '36px Arial';
             ctx.fillText('ShootingJoe - 卓哥打飞机', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
             ctx.font = '24px Arial';
             ctx.fillText('按 ENTER 键开始游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        }

        // Draw Level Up message if active
        if (this.game.showLevelUpMessageUntil > Date.now()) {
            ctx.font = 'bold 30px Arial';
            ctx.fillStyle = 'yellow';
            ctx.textAlign = 'center';
            ctx.fillText(`等级提升! LV ${this.game.player.level}!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        }
    }
} 