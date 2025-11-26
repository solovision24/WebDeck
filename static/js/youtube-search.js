// YouTube Search Integration for WebDeck
class YouTubeSearchManager {
    constructor() {
        this.searchModal = null;
        this.searchResults = [];
        this.currentInput = null;
        this.init();
    }

    init() {
        this.createSearchModal();
        this.addSearchButtonsToInputs();
    }

    createSearchModal() {
        // Create modal container
        this.searchModal = document.createElement('div');
        this.searchModal.id = 'youtube-search-modal';
        this.searchModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 20000;
            display: none;
            justify-content: center;
            align-items: center;
        `;

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #2a2a2a;
            border: 2px solid #444;
            border-radius: 12px;
            width: 80%;
            max-width: 600px;
            max-height: 80%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #1a1a1a;
            padding: 15px;
            border-bottom: 1px solid #444;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h3');
        title.textContent = 'YouTube Video Search';
        title.style.cssText = `
            color: #fff;
            margin: 0;
            font-size: 18px;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: #ff4444;
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
        `;
        closeBtn.onclick = () => this.hide();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Create search bar
        const searchBar = document.createElement('div');
        searchBar.style.cssText = `
            padding: 15px;
            border-bottom: 1px solid #444;
        `;

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search YouTube videos or paste URL...';
        searchInput.style.cssText = `
            width: 100%;
            padding: 12px;
            background: #1a1a1a;
            border: 1px solid #555;
            border-radius: 6px;
            color: #fff;
            font-size: 14px;
            box-sizing: border-box;
        `;

        searchBar.appendChild(searchInput);

        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'youtube-search-results';
        resultsContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 15px;
        `;

        // Add paste button functionality
        searchInput.addEventListener('paste', (e) => {
            setTimeout(() => this.performSearch(searchInput.value), 100);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });

        // Assemble modal
        modalContent.appendChild(header);
        modalContent.appendChild(searchBar);
        modalContent.appendChild(resultsContainer);
        this.searchModal.appendChild(modalContent);

        document.body.appendChild(this.searchModal);
    }

    addSearchButtonsToInputs() {
        // Find all YouTube URL input fields
        const observer = new MutationObserver(() => {
            this.addSearchButtons();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.addSearchButtons();
    }

    addSearchButtons() {
        const inputs = document.querySelectorAll('input[placeholder*="YouTube"], input[placeholder*="youtube"]');
        
        inputs.forEach(input => {
            // Skip if already has search button
            if (input.dataset.youtubeSearchAdded) return;
            input.dataset.youtubeSearchAdded = 'true';

            // Create search button
            const searchBtn = document.createElement('button');
            searchBtn.textContent = '🔍';
            searchBtn.title = 'Search YouTube';
            searchBtn.style.cssText = `
                margin-left: 8px;
                padding: 8px 12px;
                background: #ff4444;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-size: 14px;
            `;

            // Create paste button
            const pasteBtn = document.createElement('button');
            pasteBtn.textContent = '📋';
            pasteBtn.title = 'Paste from clipboard';
            pasteBtn.style.cssText = `
                margin-left: 4px;
                padding: 8px 12px;
                background: #44ff44;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-size: 14px;
            `;

            // Button container
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                align-items: center;
                margin-top: 8px;
            `;

            buttonContainer.appendChild(searchBtn);
            buttonContainer.appendChild(pasteBtn);

            // Insert after input
            input.parentNode.insertBefore(buttonContainer, input.nextSibling);

            // Event handlers
            searchBtn.onclick = () => {
                this.currentInput = input;
                this.show();
            };

            pasteBtn.onclick = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    input.value = text;
                    this.validateAndPreview(input);
                } catch (err) {
                    console.error('Failed to read clipboard:', err);
                }
            };

            // Add validation on input change
            input.addEventListener('input', () => this.validateAndPreview(input));
        });
    }

    validateAndPreview(input) {
        const url = input.value.trim();
        if (!url) return;

        // Simple YouTube URL validation
        const youtubePatterns = [
            /youtube\.com\/watch\?v=/,
            /youtu\.be\//,
            /youtube\.com\/embed\//
        ];

        const isValid = youtubePatterns.some(pattern => pattern.test(url));
        
        // Visual feedback
        input.style.borderColor = isValid ? '#44ff44' : '#ff4444';
        
        if (isValid) {
            this.showVideoPreview(input);
        }
    }

    showVideoPreview(input) {
        // Remove existing preview
        const existingPreview = input.parentNode.querySelector('.video-preview');
        if (existingPreview) existingPreview.remove();

        const url = input.value.trim();
        
        // Extract video ID
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (!match) return;

        const videoId = match[1];
        
        // Create preview
        const preview = document.createElement('div');
        preview.className = 'video-preview';
        preview.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            background: #1a1a1a;
            border-radius: 6px;
            border: 1px solid #444;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const thumbnail = document.createElement('img');
        thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        thumbnail.style.cssText = `
            width: 80px;
            height: 60px;
            border-radius: 4px;
            object-fit: cover;
        `;

        const info = document.createElement('div');
        info.innerHTML = `
            <div style="color: #fff; font-size: 12px;">✓ Valid YouTube URL detected</div>
            <div style="color: #aaa; font-size: 10px;">Video ID: ${videoId}</div>
        `;

        preview.appendChild(thumbnail);
        preview.appendChild(info);
        input.parentNode.appendChild(preview);
    }

    show() {
        this.searchModal.style.display = 'flex';
        document.getElementById('youtube-search-results').innerHTML = `
            <div style="text-align: center; color: #aaa; padding: 20px;">
                Search for YouTube videos above...
            </div>
        `;
    }

    hide() {
        this.searchModal.style.display = 'none';
    }

    async performSearch(query) {
        const resultsContainer = document.getElementById('youtube-search-results');
        
        // Show loading
        resultsContainer.innerHTML = `
            <div style="text-align: center; color: #aaa; padding: 20px;">
                Searching...
            </div>
        `;

        try {
            const response = await fetch('/youtube-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            });

            const data = await response.json();
            
            if (data.success) {
                this.displayResults(data.results);
            } else {
                resultsContainer.innerHTML = `
                    <div style="text-align: center; color: #ff4444; padding: 20px;">
                        Search failed: ${data.message}
                    </div>
                `;
            }
        } catch (error) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; color: #ff4444; padding: 20px;">
                    Search error: ${error.message}
                </div>
            `;
        }
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('youtube-search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; color: #aaa; padding: 20px;">
                    No videos found
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = results.map(video => `
            <div class="video-result" style="
                display: flex;
                align-items: center;
                padding: 12px;
                margin-bottom: 10px;
                background: #1a1a1a;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
            " onmouseover="this.style.background='#333'" onmouseout="this.style.background='#1a1a1a'">
                <img src="${video.thumbnail_url}" style="
                    width: 120px;
                    height: 90px;
                    border-radius: 6px;
                    object-fit: cover;
                    margin-right: 15px;
                ">
                <div style="flex: 1; color: #fff;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${video.title}</div>
                    <div style="color: #aaa; font-size: 12px;">${video.author}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        resultsContainer.querySelectorAll('.video-result').forEach((element, index) => {
            element.onclick = () => this.selectVideo(results[index]);
        });
    }

    selectVideo(video) {
        if (this.currentInput) {
            this.currentInput.value = video.url;
            this.validateAndPreview(this.currentInput);
        }
        this.hide();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.youtubeSearch = new YouTubeSearchManager();
});

console.log('youtube-search.js loaded');
