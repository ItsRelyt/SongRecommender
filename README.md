# 🎵 SoundFinder

A free, single-file music player that streams full-length songs from the Internet Archive. **No API key required.**

## Features

- 🎶 **Full-length songs** - No 30-second previews, play complete tracks
- 🔍 **Search** - Find music by artist, album, genre, or keywords
- ✨ **Smart recommendations** - Discover similar music
- 🎮 **Full player controls** - Play/pause, next/prev, seek, volume
- 🎨 **Beautiful UI** - Clean, responsive design
- ⌨️ **Keyboard shortcuts** - Space (play/pause), Shift+Arrow (next/prev)
- 📱 **Mobile-friendly** - Works on all devices
- 🌐 **Powered by Internet Archive** - Thousands of Creative Commons and public domain tracks

## How to Use

### Option 1: Open Directly
Just open `dist/index.html` in your browser. That's it!

### Option 2: Deploy to GitHub Pages
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → Branch: `main`, folder: `/dist`
4. Save - your site will be live at `https://yourusername.github.io/repo-name/`

### Option 3: Deploy Anywhere
Upload `dist/index.html` to any web host (Netlify, Vercel, etc.)

## How It Works

SoundFinder uses the **Internet Archive's public API** to search and stream audio files. The Internet Archive hosts thousands of Creative Commons and public domain music tracks from independent artists, live concerts, and historical recordings.

- **Search API**: `https://archive.org/advancedsearch.php`
- **Metadata API**: `https://archive.org/metadata/{identifier}`
- **Streaming**: Direct links to audio files (MP3, OGG, FLAC)

No API keys, no authentication, no rate limits (within reason).

## Development

The entire app is a single HTML file with inline CSS and JavaScript. No build step required for development - just edit `index.html` and refresh.

To rebuild for production:
```bash
npm run build
```

This copies `index.html` to `dist/` for deployment.

## Tech Stack

- **Pure HTML/CSS/JavaScript** - No frameworks, no dependencies
- **Internet Archive API** - Free, open, no authentication
- **HTML5 Audio** - Native browser audio playback
- **Responsive Design** - Mobile-first CSS

## Browser Support

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT - Use however you want!

## Credits

Music sourced from the [Internet Archive](https://archive.org) - a non-profit digital library providing free access to millions of books, audio, and video.

---

**Note**: The Internet Archive contains user-uploaded content. While most music is Creative Commons or public domain, please respect copyright and support artists when possible.
