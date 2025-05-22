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
const ENEMY_SPAWN_INTERVAL_MIN = 200 // ms (previously 250, then 500)
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
const ENEMY1_HP = 301; // Base HP at player level 1
const ENEMY1_HP_GAIN_PER_LEVEL = 8; // Additional HP per player level after level 1
const ENEMY1_COLLISION_DAMAGE = 15;
const ENEMY1_EXP = 5; // Reduced from 10

const ENEMY_TYPE_1_DEATH_TEXTS = [
    "你们不上班吗",
    "卓哥卓哥",
    "起飞",
    "差点意思",
    "躲歪了",
    "别挣扎了",
    "冲啊",
    "买到ST啦",
    "卓哥可以的",
    "啥情况",
    "?",
    "隔了困救我",
    "秀",
    "含泪下线",
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
const ENEMY2_HP = 201; // Base HP at player level 1
const ENEMY2_HP_GAIN_PER_LEVEL = 12; // Additional HP per player level after level 1
const ENEMY2_COLLISION_DAMAGE = 20;
const ENEMY2_EXP = 8; // Reduced from 15

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
const BOSS_BULLET2_WIDTH = 35; // Increased from 25
const BOSS_BULLET2_HEIGHT = 35; // Increased from 25
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
    "哪来的屌丝",
    "卓哥还在动"
];
const BOSS_DIALOGUE_OVERLAPPING = [
    "卓哥搞毛",
    "你在这里干嘛啊",
    "这个位置对了",
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
const GAME_STATE_PAUSED = 'paused'; // New state for paused game

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

// Item Constants
// const ITEM_WIDTH = 30; // Will be replaced by specific sizes
// const ITEM_HEIGHT = 30; // Will be replaced by specific sizes
const ITEM_FALL_SPEED = ENEMY2_SPEED * 0.5;

const ALCOHOL_ITEM_WIDTH = 50;
const ALCOHOL_ITEM_HEIGHT = 50;

const SANDWICH_SMALL_WIDTH = 30;
const SANDWICH_SMALL_HEIGHT = 30;
const SANDWICH_MEDIUM_WIDTH = 35;
const SANDWICH_MEDIUM_HEIGHT = 35;
const SANDWICH_LARGE_WIDTH = 45;
const SANDWICH_LARGE_HEIGHT = 45;

// Item Types
const ITEM_TYPE_ALCOHOL = 'alcohol';
const ITEM_TYPE_SANDWICH = 'sandwich';

// Item Sizes
const ITEM_SIZE_SMALL = 'small';
const ITEM_SIZE_MEDIUM = 'medium';
const ITEM_SIZE_LARGE = 'large';

// Alcohol Item Properties (Enemy 1 - 奶哥 drops)
const ALCOHOL_SMALL_DROP_RATE = 0.12; // Reduced from 0.20 (20%)
const ALCOHOL_SMALL_ATK_BONUS = 5;
const ALCOHOL_SMALL_IMG_SRC = 'img/wine_small.png';

const ALCOHOL_MEDIUM_DROP_RATE = 0.06; // Reduced from 0.10 (10%)
const ALCOHOL_MEDIUM_ATK_BONUS = 8;
const ALCOHOL_MEDIUM_IMG_SRC = 'img/wine_medium.png';

const ALCOHOL_LARGE_DROP_RATE = 0.03; // Reduced from 0.05 (5%)
const ALCOHOL_LARGE_BULLET_BONUS = 1; // Adds 1 extra bullet
const ALCOHOL_LARGE_IMG_SRC = 'img/wine_large.png';
// Bullet damage modifier: ATK * numMainBullets * 0.60 for each bullet if numMainBullets > 1

// Sandwich Item Properties (Enemy 2 - 阿王 drops)
const SANDWICH_SMALL_DROP_RATE = 0.15; // Reduced from 0.25 (25%)
const SANDWICH_SMALL_HP_BONUS = 3;
const SANDWICH_SMALL_IMG_SRC = 'img/sandwich_small.png';

const SANDWICH_MEDIUM_DROP_RATE = 0.08; // Reduced from 0.15 (15%)
const SANDWICH_MEDIUM_HP_BONUS = 6;
const SANDWICH_MEDIUM_IMG_SRC = 'img/sandwich_medium.png';

const SANDWICH_LARGE_DROP_RATE = 0.05; // Reduced from 0.10 (10%)
const SANDWICH_LARGE_HP_BONUS = 12;
const SANDWICH_LARGE_IMG_SRC = 'img/sandwich_large.png';

// Enemy 2 (阿王) Sandwich-related Dialogue
const ENEMY2_SANDWICH_DIALOGUE_TEXT = "我三明治掉了";
const ENEMY2_SANDWICH_DIALOGUE_INTERVAL = 2000; // ms (2 seconds)
const ENEMY2_SANDWICH_DIALOGUE_DURATION = 1500; // ms (1.5 seconds)

// Boss Enemy
// ... existing code ... 