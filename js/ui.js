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

            // Draw HP Text on HP Bar
            ctx.font = HP_TEXT_ON_BAR_FONT;
            ctx.fillStyle = HP_TEXT_ON_BAR_COLOR;
            ctx.textAlign = 'left';
            const hpBarContentX = UI_HP_BAR_X + 35 + HP_TEXT_ON_BAR_X_OFFSET;
            const hpBarContentY = UI_HP_BAR_Y - 17 + HP_TEXT_ON_BAR_Y_OFFSET;
            ctx.fillText(`${Math.round(player.hp)}/${player.maxHp}`, hpBarContentX, hpBarContentY);

            // Draw Player Level and EXP Bar
            ctx.fillStyle = UI_TEXT_COLOR;
            ctx.fillText(`Level: ${player.level}`, UI_HP_BAR_X, UI_EXP_BAR_Y - 5);
            let expPercentage = player.exp / EXP_TO_LEVEL_UP;

            // Cap EXP bar display on victory screen if EXP somehow exceeds max for current level display
            if (this.game.gameState === GAME_STATE_LEVEL_CLEAR && expPercentage > 1) {
                expPercentage = 1;
            }

            const expBarXOffset = UI_HP_BAR_X + 75;
            ctx.fillStyle = '#555';
            ctx.fillRect(expBarXOffset, UI_EXP_BAR_Y - 17, UI_HP_BAR_WIDTH * 0.7, UI_HP_BAR_HEIGHT * 0.7);
            ctx.fillStyle = '#007bff'; // Blue for EXP
            ctx.fillRect(expBarXOffset, UI_EXP_BAR_Y - 17, (UI_HP_BAR_WIDTH * 0.7) * expPercentage, UI_HP_BAR_HEIGHT * 0.7);
            ctx.strokeStyle = UI_TEXT_COLOR;
            ctx.strokeRect(expBarXOffset, UI_EXP_BAR_Y - 17, UI_HP_BAR_WIDTH * 0.7, UI_HP_BAR_HEIGHT * 0.7);
        }

        // Draw Boss HP Bar if boss exists and is active
        if (this.game.boss && this.game.boss.isActive) {
            const bossHpRatio = this.game.boss.hp / this.game.boss.maxHp;
            const bossHpBarWidth = CANVAS_WIDTH * 0.6;
            const bossHpBarX = CANVAS_WIDTH / 2 - bossHpBarWidth / 2;
            const bossHpBarY = BOSS_UI_HP_BAR_Y_POSITION;

            // Draw the background of the HP bar
            ctx.fillStyle = '#555'; 
            ctx.fillRect(bossHpBarX, bossHpBarY, bossHpBarWidth, BOSS_UI_HP_BAR_HEIGHT);

            // Draw the actual health level
            ctx.fillStyle = bossHpRatio > 0.5 ? UI_HP_BAR_COLOR_FULL : (bossHpRatio > 0.2 ? UI_HP_BAR_COLOR_MEDIUM : UI_HP_BAR_COLOR_LOW);
            ctx.fillRect(bossHpBarX, bossHpBarY, bossHpBarWidth * bossHpRatio, BOSS_UI_HP_BAR_HEIGHT);
            
            // Ensure the border is also drawn for the bar
            ctx.strokeStyle = UI_TEXT_COLOR; // Or a specific border color if preferred
            ctx.strokeRect(bossHpBarX, bossHpBarY, bossHpBarWidth, BOSS_UI_HP_BAR_HEIGHT);
        }

        // Draw Game State Messages (Game Over, Level Clear, Start Screen, Level Up)
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
             ctx.fillText('ShootingJoe', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
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

        // Draw HP Restored on Level Up message if active
        if (this.game.showHpRestoredMessageUntil > Date.now()) {
            ctx.font = 'bold 18px Arial'; // Slightly smaller font
            ctx.fillStyle = 'lime'; // Green color for heal
            ctx.textAlign = 'left'; // Align with HP bar text
            // Position above the HP bar and to the right of the avatar
            const textX = PLAYER_AVATAR_SECTION_X + PLAYER_AVATAR_SIZE_BOTTOM_LEFT + 10; // Move right of avatar + margin
            const textY = UI_EXP_BAR_Y - 25; // Position it above the EXP bar, which is above HP bar text
            ctx.fillText('升级回复生命', textX, textY);
        }

        // Draw Player Avatar and ATK Display (Bottom-Left, above HP/EXP bars)
        if (this.game.player && 
            (this.game.gameState === GAME_STATE_PLAYING || 
             this.game.gameState === GAME_STATE_GAME_OVER || 
             this.game.gameState === GAME_STATE_LEVEL_CLEAR)) { // Show during gameplay and end screens
            
            const player = this.game.player;

            // Draw player avatar
            if (player.image) ctx.drawImage(player.image, 
                              PLAYER_AVATAR_SECTION_X, 
                              PLAYER_AVATAR_SECTION_Y, 
                              PLAYER_AVATAR_SIZE_BOTTOM_LEFT, 
                              PLAYER_AVATAR_SIZE_BOTTOM_LEFT);

            // Draw player ATK text next to avatar - REMOVED
            /*
            ctx.font = PLAYER_AVATAR_TEXT_FONT;
            ctx.fillStyle = PLAYER_AVATAR_TEXT_COLOR;
            ctx.textAlign = 'left';
            const atkTextX = PLAYER_AVATAR_SECTION_X + PLAYER_AVATAR_TEXT_X_OFFSET;
            let atkTextY = PLAYER_AVATAR_SECTION_Y + PLAYER_AVATAR_TEXT_Y_OFFSET;
            
            ctx.fillText(`ATK: ${player.atk}`, atkTextX, atkTextY);
            */
        }
    }
} 