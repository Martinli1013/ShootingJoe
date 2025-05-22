class ResourceManager {
    constructor() {
        this.images = {};
    }

    preloadImages(imageList, onProgress, onComplete) {
        let loaded = 0;
        const total = imageList.length;
        imageList.forEach(src => {
            const img = new Image();
            img.onload = () => {
                loaded++;
                this.images[src] = img;
                if (onProgress) onProgress(loaded, total);
                if (loaded === total && onComplete) onComplete();
            };
            img.onerror = () => {
                loaded++;
                this.images[src] = null; // 标记加载失败
                if (onProgress) onProgress(loaded, total);
                if (loaded === total && onComplete) onComplete();
            };
            img.src = src;
        });
    }

    getImage(src) {
        return this.images[src];
    }
} 