const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("YouTube Downloader API is running.");
});

app.get("/video-info", async (req, res) => {
  const videoURL = req.query.url;
  if (!videoURL || !ytdl.validateURL(videoURL)) {
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const formats = ytdl.filterFormats(info.formats, "videoandaudio");

    const response = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      formats: formats.map(f => ({
        quality: f.qualityLabel,
        url: f.url,
        type: f.mimeType.split(";")[0]
      }))
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch video info" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
