// Media Player Widget for WebDeck
class MediaPlayerWidget {
    constructor() {
        this.isPlaying = false;
        this.currentUrl = null;
        this.widgetContainer = null;
        this.iframe = null;
        this.init();
    }

    init() {
        // Listen for SocketIO events
        if (typeof socket !== 'undefined') {
            socket.on('json_data', (data) => {
                if (data.action && data.action.startsWith('play')) {
                    this.handlePlayCommand(data);
                } else if (data.action === 'stop') {
                    this.handleStopCommand();
                } else if (data.action === 'pause') {
                    this.handlePauseCommand();
                }
            });
        }
    }

    handlePlayCommand(data) {
        if (data.type === 'youtube') {
            this.playYouTube(data.url);
        } else {
            this.playDirect(data.url);
        }
    }

    handleStopCommand() {
        this.stop();
    }

    handlePauseCommand() {
        this.pause();
    }

    createMediaPlayerWidget() {
        // Remove existing widget if present
        const existing = document.getElementById('mediaplayer-widget');
        if (existing) {
            existing.remove();
        }

        // Create main widget container
        this.widgetContainer = document.createElement('div');
        this.widgetContainer.id = 'mediaplayer-widget';
        this.widgetContainer.className = 'mediaplayer-widget';
        
        // Apply WebDeck styling
        this.widgetContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 400px;
            background: #2a2a2a;
            border: 2px solid #444;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.8);
            display: none;
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #1a1a1a;
            padding: 10px;
            border-bottom: 1px solid #444;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('span');
        title.textContent = 'Media Player';
        title.style.cssText = `
            color: #fff;
            font-weight: bold;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: #ff4444;
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
        `;
        closeBtn.onclick = () => this.hide();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
            width: 100%;
            height: calc(100% - 40px);
            position: relative;
        `;

        // Create iframe for video
        this.iframe = document.createElement('iframe');
        this.iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 0 0 6px 6px;
        `;

        videoContainer.appendChild(this.iframe);

        // Assemble widget
        this.widgetContainer.appendChild(header);
        this.widgetContainer.appendChild(videoContainer);

        // Add to page
        document.body.appendChild(this.widgetContainer);
    }

    playYouTube(embedUrl) {
        this.createMediaPlayerWidget();
        this.iframe.src = embedUrl;
        this.show();
        this.isPlaying = true;
    }

    playDirect(url) {
        this.createMediaPlayerWidget();
        
        // For direct video files, create video element instead of iframe
        const videoContainer = this.widgetContainer.querySelector('div:last-child');
        videoContainer.innerHTML = '';
        
        const video = document.createElement('video');
        video.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 0 0 6px 6px;
        `;
        video.controls = true;
        video.src = url;
        
        videoContainer.appendChild(video);
        this.show();
        this.isPlaying = true;
    }

    pause() {
        if (this.iframe && this.iframe.contentWindow) {
            // For YouTube iframe
            this.iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
        
        const video = this.widgetContainer?.querySelector('video');
        if (video) {
            video.pause();
        }
    }

    stop() {
        if (this.iframe) {
            this.iframe.src = '';
        }
        
        const video = this.widgetContainer?.querySelector('video');
        if (video) {
            video.pause();
            video.src = '';
        }
        
        this.hide();
        this.isPlaying = false;
    }

    show() {
        if (this.widgetContainer) {
            this.widgetContainer.style.display = 'block';
        }
    }

    hide() {
        if (this.widgetContainer) {
            this.widgetContainer.style.display = 'none';
        }
        this.stop();
    }
}

// Initialize media player when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.mediaPlayer = new MediaPlayerWidget();
});

console.log('mediaplayer.js loaded');
