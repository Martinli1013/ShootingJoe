// Entry point for the game

window.addEventListener('load', function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Error: Canvas element not found!");
        return;
    }

    const game = new Game(canvas);
    // game.startGame(); // Game now starts from GAME_STATE_START_SCREEN, user presses Enter
    game.loop(); // Start the game loop

    console.log("ShootingJoe game initialized and loop started.");
}); 