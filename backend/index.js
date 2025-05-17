import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Clear ytdl-core cache
ytdl.cache.sig.clear();
ytdl.cache.info.clear();
ytdl.cache.cookie.clear();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

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

    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    
    res.json({
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      thumbnail: info.videoDetails.thumbnails.sort((a, b) => b.width - a.width)[0].url,
      formats: formats.map(format => ({
        quality: format.qualityLabel,
        container: format.container,
        bitrate: format.bitrate,
        url: format.url
      }))
    });

  } catch (error) {
    console.error('Info Error:', error.message);
    res.status(500).json({ 
      error: error.message.includes("Could not extract functions") 
        ? 'YouTube structure changed - please update ytdl-core' 
        : error.message
    });
  }
});

app.get('/api/download', async (req, res) => {
  try {
    const { url, quality } = req.query;
    
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          Cookie: process.env.YOUTUBE_COOKIE || '',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        }
      }
    });

    const format = ytdl.chooseFormat(info.formats, { 
      quality: quality || 'highest',
      filter: 'videoandaudio'
    });

    res.header({
      'Content-Disposition': `attachment; filename="${info.videoDetails.title.replace(/[^\w]/g, '_')}.${format.container}"`,
      'Content-Type': format.mimeType
    });

    ytdl(url, { format }).pipe(res);

  } catch (error) {
    console.error('Download Error:', error.message);
    res.status(500).send(`Download failed: ${error.message}`);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('YTDL Core version:', ytdl.version);
});