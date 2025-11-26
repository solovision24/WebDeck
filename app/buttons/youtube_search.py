import re
import json
import requests
from flask import jsonify
from app.utils.logger import log

def extract_video_id(url_or_id):
    """Extract YouTube video ID from URL or return ID if already extracted"""
    if not url_or_id:
        return None
    
    # If it's already a video ID (11 characters), return as is
    if len(url_or_id) == 11 and re.match(r'^[a-zA-Z0-9_-]{11}$', url_or_id):
        return url_or_id
    
    # Extract from various YouTube URL formats
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com/watch\?.*v=([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)
    
    return None

def get_video_info(video_id):
    """Get basic video information without API key"""
    try:
        # Use YouTube's oembed endpoint (no API key required)
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'title': data.get('title', 'Unknown'),
                'author': data.get('author_name', 'Unknown'),
                'thumbnail_url': data.get('thumbnail_url', ''),
                'video_id': video_id,
                'url': f"https://www.youtube.com/watch?v={video_id}"
            }
        else:
            log.warning(f"YouTube oembed request failed: {response.status_code}")
            return None
            
    except Exception as e:
        log.exception(e, "Error fetching YouTube video info")
        return None

def search_youtube_videos(query, max_results=10):
    """Search YouTube videos (simplified version without API key)"""
    try:
        # This is a simplified approach - in production you'd want to use YouTube API
        # For now, we'll return some popular videos as examples
        popular_videos = [
            {
                'title': 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
                'author': 'Rick Astley',
                'video_id': 'dQw4w9WgXcQ',
                'thumbnail_url': 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
            },
            {
                'title': 'Beautiful Nature Video - Relaxing Music',
                'author': 'Nature Channel',
                'video_id': 'j800SVei8DA',
                'thumbnail_url': 'https://img.youtube.com/vi/j800SVei8DA/hqdefault.jpg',
                'url': 'https://www.youtube.com/watch?v=j800SVei8DA'
            },
            {
                'title': 'Lofi Hip Hop Radio - Beats to Relax/Study to',
                'author': 'Lofi Girl',
                'video_id': 'jfKfPfyJRdk',
                'thumbnail_url': 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
                'url': 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
            }
        ]
        
        # Filter by query if provided
        if query and query.strip():
            query_lower = query.lower()
            filtered = [
                video for video in popular_videos 
                if query_lower in video['title'].lower() or query_lower in video['author'].lower()
            ]
            return filtered[:max_results] if filtered else popular_videos[:max_results]
        
        return popular_videos[:max_results]
        
    except Exception as e:
        log.exception(e, "Error searching YouTube videos")
        return []

def validate_youtube_url(url):
    """Validate if URL is a proper YouTube URL"""
    video_id = extract_video_id(url)
    return video_id is not None
