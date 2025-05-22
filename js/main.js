// Entry point for the game

// import ResourceManager from './resourceManager.js'; // 删除这行

const imageList = [
    'img/imgplayer_start.png',
    'img/imgplayer_level5.png',
    'img/imgplayer_level10.png',
    'img/imgplayer_level15.png',
    'img/imgplayer_hit_feedback.png',
    'img/Player_bullet.png',
    'img/Player_bullet_large.png',
    'img/imgenemy_girl.png',
    'img/imgenemy_lady.png',
    'img/imgboss_main.png',
    'img/boss_bullet_type1.png',
    'img/boss_bullet_type2.png',
    'img/ending_success.png',
    'img/ending_fail.png',
    'img/wine_small.png',
    'img/wine_medium.png',
    'img/wine_large.png',
    'img/sandwich_small.png',
    'img/sandwich_medium.png',
    'img/sandwich_large.png'
];

const resourceManager = new ResourceManager();

window.addEventListener('load', function() {
    // 可选：显示加载进度条
    resourceManager.preloadImages(imageList, (loaded, total) => {
        // 可在此处更新进度条
        // 例如 document.getElementById('progress').innerText = `${loaded}/${total}`;
    }, () => {
        // 加载完成，启动游戏
        const canvas = document.getElementById('gameCanvas');
        const game = new Game(canvas, resourceManager);
        game.loop();
    });
}); 