// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Player constants
const PLAYER_INITIAL_HP = 100;
const PLAYER_INITIAL_ATK = 100;
const PLAYER_SPEED = 5; // Pixels per frame
const PLAYER_WIDTH = 50; // Example width for collision and drawing
const PLAYER_HEIGHT = 50; // Example height
const PLAYER_COLOR = 'rgba(0, 255, 255, 0.8)'; // Cyan-ish, will be replaced by pixel art
const PLAYER_HIT_FLASH_DURATION = 200; // ms
const PLAYER_HIT_FLASH_INTERVAL = 50; // ms
const PLAYER_HP_REGEN_OVERLAPPING_PER_SECOND = 20; // HP regenerated per second when overlapping with boss

// Player Bullet constants
const PLAYER_BULLET_SPEED = 10;
const PLAYER_BULLET_WIDTH = 24; // Update to match your player_bullet.png width
const PLAYER_BULLET_HEIGHT = 36; // Update to match your player_bullet.png height
const PLAYER_BULLET_IMAGE_SRC = 'img/Player_bullet.png';
// const PLAYER_BULLET_COLOR = 'rgba(255, 255, 255, 0.9)'; // Color becomes fallback or unused

// Upgraded Player Bullet sizes & image
const PLAYER_BULLET_WIDTH_LEVEL15 = 36; // Update to match your player_bullet_large.png width
const PLAYER_BULLET_HEIGHT_LEVEL15 = 54; // Update to match your player_bullet_large.png height
const PLAYER_BULLET_LARGE_IMAGE_SRC = 'img/Player_bullet_large.png';

// Automatic firing interval (milliseconds). Lower is faster.
const PLAYER_FIRE_RATE = 200; // 5 bullets per second

// Enemy constants
// Adjusted for more enemies and faster speeds
const ENEMY_SPAWN_INTERVAL_MIN = 100; // ms (previously 250, then 500)
const ENEMY_SPAWN_INTERVAL_MAX = 300; // ms (previously 750, then 1500)

// Enemy spawn rate increase after player reaches level 15
const PLAYER_LEVEL_FOR_FASTER_SPAWN = 15;
const ENEMY_SPAWN_INTERVAL_MIN_FASTER = 50; // ms, significantly faster
const ENEMY_SPAWN_INTERVAL_MAX_FASTER = 150; // ms, significantly faster

// Enemy Type 1 ("女高中生") constants
const ENEMY1_WIDTH = 50;
const ENEMY1_HEIGHT = 60;
const ENEMY1_COLOR = 'rgba(255, 105, 180, 0.8)'; // Pink-ish
const ENEMY1_SPEED_MIN = 2.0;
const ENEMY1_SPEED_MAX = 3.5;
const ENEMY1_SPEED_SCALING_PER_PLAYER_LEVEL = 0.05; // New constant
const ENEMY1_HP = 301;
const ENEMY1_COLLISION_DAMAGE = 15;
const ENEMY1_EXP = 10;

const ENEMY_TYPE_1_DEATH_TEXTS = [
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
const ENEMY_TYPE_1_SPECIAL_DEATH_TEXT = "别干我，干阿王"; // This was already in game.js logic, good to keep it here too for clarity

// Enemy Type 2 ("熟女") constants
const ENEMY2_WIDTH = 45;
const ENEMY2_HEIGHT = 45;
const ENEMY2_COLOR = 'rgba(220, 20, 60, 0.8)'; // Crimson-ish
const ENEMY2_SPEED = 2.5;
const ENEMY2_HP = 201;
const ENEMY2_COLLISION_DAMAGE = 20;
const ENEMY2_EXP = 15;

// Boss ("蜘蛛精") constants
const BOSS_HP = 250000;
const BOSS_INITIAL_HP = 250000;
const BOSS_WIDTH = 150;
const BOSS_HEIGHT = 230;
const BOSS_X = CANVAS_WIDTH / 2 - BOSS_WIDTH / 2;
const BOSS_Y = 80;
const BOSS_COLOR = 'rgba(128, 0, 128, 0.9)';
const BOSS_ATTACK_INTERVAL = 100; // Added back (ms), allows internal pattern timing to dominate

// Boss Bullet Type 1 (Big, Tracking - from existing BOSS_FIRE_INTERVAL_PATTERN_1)
const BOSS_BULLET1_SPEED = 4; // Keep this as the base speed
const BOSS_BULLET1_WIDTH = 30; // Was BOSS_BULLET_BIG_SIZE
const BOSS_BULLET1_HEIGHT = 30; // Was BOSS_BULLET_BIG_SIZE
const BOSS_BULLET1_DAMAGE = 30; // Was BOSS_BULLET_BIG_DAMAGE
const BOSS_BULLET1_IMAGE_SRC = 'img/boss_bullet_type1.png'; // Updated to new image

// Boss Bullet Type 2 (Yellow, Non-Tracking, Spread - from existing BOSS_FIRE_INTERVAL_PATTERN_2)
const BOSS_BULLET2_SPEED = 5; // Faster than bullet type 1
const BOSS_BULLET2_WIDTH = 25; // Increased from 20
const BOSS_BULLET2_HEIGHT = 25; // Increased from 20
const BOSS_BULLET2_DAMAGE = 15; // Was BOSS_BULLET_SMALL_DAMAGE
const BOSS_BULLET2_IMAGE_SRC = 'img/boss_bullet_type2.png'; // Updated to new image (was boss_bullet_yellow.png)
const BOSS_BULLET2_COLOR = 'yellow'; // Fallback color, less relevant if image loads
const BOSS_BULLET2_COUNT = 10; // Now 10 bullets
const BOSS_BULLET2_SPREAD_ANGLE = Math.PI; // 180 degrees spread (downwards, left, right)

// Timings for patterns (kept from previous logic)
const BOSS_FIRE_INTERVAL_PATTERN_1 = 2000; // 2 seconds for big bullet (Pattern 1)
const BOSS_FIRE_INTERVAL_PATTERN_2 = 3000; // 3 seconds for spread shot (Pattern 2), after big bullet

// Old combined constants (will be removed by not being referenced anymore or can be cleaned up later)
// const BOSS_BULLET_SPEED = 4;
// const BOSS_BULLET_SPREAD_ANGLE = 15; // Degrees for spread shot
// const BOSS_BULLET_SPREAD_COUNT = 5;
// const BOSS_BULLET_BIG_SIZE = 30;
// const BOSS_BULLET_SMALL_SIZE = 15;
// const BOSS_BULLET_BIG_DAMAGE = 30; // Damage for the big tracking bullet
// const BOSS_BULLET_SMALL_DAMAGE = 15; // Damage for spread bullets
// const BOSS_BULLET_IMAGE_LARGE_SRC = 'img/boss_bullet_large.png'; // Placeholder
// const BOSS_BULLET_IMAGE_SMALL_SRC = 'img/boss_bullet_small.png'; // Placeholder
// const BOSS_BULLET2_IMAGE_SRC = 'img/boss_bullet_type2.png'; // This was for the old small tracking bullets

// Boss Dialogue
const BOSS_DIALOGUE_NORMAL = [
    "卓哥在动",
    "Fake News",
    "有人请客吃饭伐",
    "这个笑死了吗的",
    "谁把外滩搞得这么low",
    "周六和奶哥喝了一瓶啤酒感冒了",
    "武汉爆美",
    "敏毅懂点皮毛就出来了",
    "今晚我不行",
    "今晚宵夜了咯？"
];
const BOSS_DIALOGUE_LOW_HP = [
    "吗的菊花一紧",
    "这算恐怖袭击伐",
    "因小失大",
    "哪来的屌丝",
    "卓哥还在动"
];
const BOSS_DIALOGUE_OVERLAPPING = [
    "卓哥搞毛",
    "你在这里干嘛啊",
    "卧槽爽",
    "有点爽",
    "哦哟哟"
];
const BOSS_DIALOGUE_LOW_HP_THRESHOLD = 0.10; // 10% HP
const BOSS_DIALOGUE_INTERVAL_NORMAL = 4000; // ms (was 2000)
const BOSS_DIALOGUE_INTERVAL_LOW_HP = 3000; // ms (was 1500)
const BOSS_DIALOGUE_DURATION = 2000; // ms (was 1000)
const BOSS_DIALOGUE_FONT = "20px 'Press Start 2P'";
const BOSS_DIALOGUE_COLOR = "white";
const BOSS_DIALOGUE_Y_OFFSET = -50; // Pixels above the boss's top edge (was -30)

// UI constants
const UI_HP_BAR_X = 10;
const UI_HP_BAR_Y = CANVAS_HEIGHT - 30; // Use CANVAS_HEIGHT
const UI_HP_BAR_WIDTH = 200;
const UI_HP_BAR_HEIGHT = 20;
const BOSS_UI_HP_BAR_HEIGHT = 15; // New constant for boss HP bar height
const BOSS_UI_HP_BAR_Y_POSITION = 50; // New Y position for Boss HP Bar
const UI_HP_BAR_COLOR_FULL = 'green';
const UI_HP_BAR_COLOR_MEDIUM = 'darkorange';
const UI_HP_BAR_COLOR_LOW = 'red';
const UI_TEXT_COLOR = 'white';
const UI_FONT = '16px Arial';
const UI_EXP_BAR_Y = CANVAS_HEIGHT - 55; // Use CANVAS_HEIGHT

// Player Stats Display (Now Bottom-Left, integrated with HP/EXP bars)
const PLAYER_AVATAR_SECTION_X = UI_HP_BAR_X; // Align with HP bar X
const PLAYER_AVATAR_SECTION_Y = CANVAS_HEIGHT - 140; // Positioned above HP/EXP bars
const PLAYER_AVATAR_SIZE_BOTTOM_LEFT = 60; // Increased avatar size
const PLAYER_AVATAR_TEXT_X_OFFSET = PLAYER_AVATAR_SIZE_BOTTOM_LEFT + 10; // Text next to avatar
const PLAYER_AVATAR_TEXT_Y_OFFSET = 15; // Initial Y offset for text relative to avatar's Y
const PLAYER_AVATAR_LINE_SPACING = 20;
const PLAYER_AVATAR_TEXT_FONT = '16px Arial';
const PLAYER_AVATAR_TEXT_COLOR = 'white';

// HP Text on HP Bar
const HP_TEXT_ON_BAR_FONT = 'bold 12px Arial';
const HP_TEXT_ON_BAR_COLOR = 'white';
const HP_TEXT_ON_BAR_X_OFFSET = 5; // Small offset from the left of the bar
const HP_TEXT_ON_BAR_Y_OFFSET = 14; // Vertical offset to center in the bar (approx for 20px bar height)

// Game states
const GAME_STATE_PLAYING = 'playing';
const GAME_STATE_GAME_OVER = 'game_over';
const GAME_STATE_LEVEL_CLEAR = 'level_clear';
const GAME_STATE_START_SCREEN = 'start_screen'; // Optional: for a start screen

// Leveling
const EXP_TO_LEVEL_UP = 100;
const LEVEL_UP_HP_BONUS = 5;
const LEVEL_UP_ATK_BONUS = 6; // Changed from 10 (or previous value)
const LEVEL_UP_SPEED_BONUS = 0.25; // Speed bonus per level (will be overridden by tiered speed)

// Background scroll speed
const BACKGROUND_SCROLL_SPEED = 0.5; // Pixels per frame 

// Ending Screen Images
const ENDING_SUCCESS_IMAGE_SRC = 'img/ending_success.png';
const ENDING_FAIL_IMAGE_SRC = 'img/ending_fail.png'; 

const ENEMY_TYPE_2_SPECIAL_DEATH_TEXTS = [
    "马老师先上",
    "送走奶歌",
    "是谁攻击本党员",
    "有东西嗷"
]; 

// Boss Enemy
// ... existing code ... 