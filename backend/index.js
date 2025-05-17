import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Clear cache to handle YouTube updates
ytdl.cache.sig.clear();
ytdl.cache.info.clear();
ytdl.cache.cookie.clear();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Video information endpoint (720p MP4 only)
app.post('/api/info', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          Cookie: process.env.YOUTUBE_COOKIE || '',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    });

    // Find 720p MP4 format with both audio and video
    const format720 = info.formats.find(f => 
      f.qualityLabel === '720p' &&
      f.container === 'mp4' &&
      f.hasAudio &&
      f.hasVideo
    );

    if (!format720) {
      return res.status(404).json({ 
        error: '720p MP4 format not available for this video' 
      });
    }

    res.json({
      title: info.videoDetails.title,
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnails.sort((a, b) => b.width - a.width)[0].url,
      contentLength: format720.contentLength,
      itag: format720.itag
    });

  } catch (error) {
    console.error('Info Error:', error.message);
    res.status(500).json({
      error: error.message.includes("Could not extract functions") ?
        'YouTube structure changed - please update server' :
        error.message
    });
  }
});

// Download endpoint (720p MP4 only)
app.get('/api/download', async (req, res) => {
  try {
    const { url, itag } = req.query;
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).send('Invalid YouTube URL');
    }

    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          Cookie: process.env.YOUTUBE_COOKIE || '',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        }
      }
    });

    // Verify itag matches 720p MP4
    const format = info.formats.find(f => 
      f.itag === parseInt(itag) &&
      f.qualityLabel === '720p' &&
      f.container === 'mp4' &&
      f.hasAudio &&
      f.hasVideo
    );
    
    if (!format) {
      return res.status(404).send('720p MP4 format not available');
    }

    res.header({
      'Content-Disposition': `attachment; filename="${info.videoDetails.title.replace(/[^\w]/g, '_')}.mp4"`,
      'Content-Type': 'video/mp4',
      'Content-Length': format.contentLength
    });

    ytdl(url, { format }).pipe(res);

  } catch (error) {
    console.error('Download Error:', error.message);
    res.status(500).send(`Download failed: ${error.message}`);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('YTDL Core version:', ytdl.version);
});