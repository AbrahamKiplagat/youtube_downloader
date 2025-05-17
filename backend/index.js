const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();

app.use(cors());
app.use(express.json());

// Fetch video info endpoint
app.post('/api/info', async (req, res) => {
  try {
    const { url } = req.body;
    const info = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      formats: formats.map((format) => ({
        quality: format.qualityLabel,
        url: format.url,
      })),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Invalid URL or video unavailable' });
  }
});

// Download video endpoint
app.get('/api/download', async (req, res) => {
  const { url, quality } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality });
    res.header('Content-Disposition', `attachment; filename="video.mp4"`);
    ytdl(url, { format }).pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Download failed');
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));