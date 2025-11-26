import re
import json
from flask import jsonify
from app.utils.logger import log

def extract_url(message):
    """Extract URL from mediaplayer command"""
    match = re.search(r'(https?://[^\s]+)', message)
    return match.group(1) if match else None

def is_youtube_url(url):
    """Check if URL is a YouTube URL"""
    youtube_patterns = [
        r'youtube\.com/watch\?v=',
        r'youtu\.be/',
        r'youtube\.com/embed/'
    ]
    return any(pattern in url for pattern in youtube_patterns)

def get_youtube_embed_url(url):
    """Convert YouTube URL to embed format"""
    if 'youtu.be/' in url:
        video_id = url.split('youtu.be/')[1].split('?')[0]
    elif 'youtube.com/watch?v=' in url:
        video_id = url.split('v=')[1].split('&')[0]
    elif 'youtube.com/embed/' in url:
        video_id = url.split('embed/')[1].split('?')[0]
    else:
        return None
    
    return f"https://www.youtube.com/embed/{video_id}"

def handle_mediaplayer_command(message):
    """Handle media player commands"""
    try:
        if message.startswith("/mediaplayer play"):
            url = extract_url(message)
            if not url:
                return jsonify({
                    "success": False,
                    "message": "No valid URL provided"
                })
            
            if is_youtube_url(url):
                embed_url = get_youtube_embed_url(url)
                if embed_url:
                    return jsonify({
                        "success": True,
                        "action": "play",
                        "type": "youtube",
                        "url": embed_url,
                        "original_url": url
                    })
            
            # For other video sources, return direct URL
            return jsonify({
                "success": True,
                "action": "play",
                "type": "direct",
                "url": url,
                "original_url": url
            })
            
        elif message.startswith("/mediaplayer stop"):
            return jsonify({
                "success": True,
                "action": "stop"
            })
            
        elif message.startswith("/mediaplayer pause"):
            return jsonify({
                "success": True,
                "action": "pause"
            })
            
        else:
            return jsonify({
                "success": False,
                "message": "Unknown mediaplayer command"
            })
            
    except Exception as e:
        log.exception(e, "Error in mediaplayer command")
        return jsonify({
            "success": False,
            "message": f"Error: {str(e)}"
        })
