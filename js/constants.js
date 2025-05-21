// Canvas dimensions (adjust as needed, but keep in mind pixel art scale)
const CANVAS_WIDTH = 800; // Example width
const CANVAS_HEIGHT = 600; // Example height

// Player constants
const PLAYER_INITIAL_HP = 100;
const PLAYER_INITIAL_ATK = 10;
const PLAYER_SPEED = 5; // Pixels per frame
const PLAYER_WIDTH = 50; // Example width for collision and drawing
const PLAYER_HEIGHT = 50; // Example height
const PLAYER_COLOR = 'rgba(0, 255, 255, 0.8)'; // Cyan-ish, will be replaced by pixel art
const PLAYER_HIT_FLASH_DURATION = 200; // ms
const PLAYER_HIT_FLASH_INTERVAL = 50; // ms

// Player Bullet constants
const PLAYER_BULLET_SPEED = 10;
const PLAYER_BULLET_WIDTH = 8; // "粘稠的水滴"
const PLAYER_BULLET_HEIGHT = 12;
const PLAYER_BULLET_COLOR = 'rgba(255, 255, 255, 0.9)'; // White
// Automatic firing interval (milliseconds). Lower is faster.
const PLAYER_FIRE_RATE = 200; // 5 bullets per second

// Enemy constants
const ENEMY_SPAWN_INTERVAL_MIN = 1000; // ms
const ENEMY_SPAWN_INTERVAL_MAX = 3000; // ms

// Enemy Type 1 ("女高中生") constants
const ENEMY1_WIDTH = 40;
const ENEMY1_HEIGHT = 40;
const ENEMY1_COLOR = 'rgba(255, 105, 180, 0.8)'; // Pink-ish
const ENEMY1_SPEED_MIN = 1;
const ENEMY1_SPEED_MAX = 3;
const ENEMY1_HP = 1; // Typically one-shot by player
const ENEMY1_COLLISION_DAMAGE = 15;
const ENEMY1_EXP = 10;

// Enemy Type 2 ("熟女") constants
const ENEMY2_WIDTH = 45;
const ENEMY2_HEIGHT = 45;
const ENEMY2_COLOR = 'rgba(220, 20, 60, 0.8)'; // Crimson-ish
const ENEMY2_SPEED = 0.8; // Slower, but tracks player
const ENEMY2_HP = 1; // Typically one-shot by player
const ENEMY2_COLLISION_DAMAGE = 20;
const ENEMY2_EXP = 15;

// Boss ("蜘蛛精") constants
const BOSS_WIDTH = 150;
const BOSS_HEIGHT = 100;
const BOSS_COLOR = 'rgba(128, 0, 128, 0.9)'; // Purple-ish
const BOSS_INITIAL_HP = 500;
const BOSS_X = CANVAS_WIDTH / 2 - BOSS_WIDTH / 2; // Centered at top
const BOSS_Y = 50; // Distance from top
const BOSS_ATTACK_INTERVAL = 2000; // ms (2 seconds)

// Boss Bullet Type 1 (Large Single Shot)
const BOSS_BULLET1_WIDTH = 20;
const BOSS_BULLET1_HEIGHT = 20;
const BOSS_BULLET1_COLOR = 'rgba(100, 0, 100, 0.9)'; // Darker Purple
const BOSS_BULLET1_SPEED = 2;
const BOSS_BULLET1_DAMAGE = 30;

// Boss Bullet Type 2 (Small Spread Shot)
const BOSS_BULLET2_WIDTH = 10;
const BOSS_BULLET2_HEIGHT = 10;
const BOSS_BULLET2_COLOR = 'rgba(150, 50, 150, 0.9)'; // Lighter Purple
const BOSS_BULLET2_SPEED = 3;
const BOSS_BULLET2_DAMAGE = 15;
const BOSS_BULLET2_COUNT = 5; // Number of bullets in a spread
const BOSS_BULLET2_SPREAD_ANGLE = Math.PI / 6; // 30 degrees total spread

// UI constants
const UI_HP_BAR_X = 10;
const UI_HP_BAR_Y = CANVAS_HEIGHT - 30;
const UI_HP_BAR_WIDTH = 200;
const UI_HP_BAR_HEIGHT = 20;
const UI_HP_BAR_COLOR_FULL = 'green';
const UI_HP_BAR_COLOR_MEDIUM = 'yellow';
const UI_HP_BAR_COLOR_LOW = 'red';
const UI_TEXT_COLOR = 'white';
const UI_FONT = '16px Arial';
const UI_EXP_BAR_Y = CANVAS_HEIGHT - 55;

// Game states
const GAME_STATE_PLAYING = 'playing';
const GAME_STATE_GAME_OVER = 'game_over';
const GAME_STATE_LEVEL_CLEAR = 'level_clear';
const GAME_STATE_START_SCREEN = 'start_screen'; // Optional: for a start screen

// Leveling
const EXP_TO_LEVEL_UP = 100;
const LEVEL_UP_HP_BONUS = 5;
const LEVEL_UP_ATK_BONUS = 1;

// Background scroll speed
const BACKGROUND_SCROLL_SPEED = 0.5; // Pixels per frame 