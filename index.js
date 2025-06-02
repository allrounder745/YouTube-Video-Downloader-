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
  let videoURL = req.query.url;

  if (!videoURL) {
    return res.status(400).json({ error: "Missing URL" });
  }

  // Convert youtu.be short URLs to full YouTube URLs
  if (videoURL.includes("youtu.be")) {
    const videoId = videoURL.split("/").pop().split("?")[0];
    videoURL = `https://www.youtube.com/watch?v=${videoId}`;
  }

  if (!ytdl.validateURL(videoURL)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const formats = ytdl.filterFormats(info.formats, "videoandaudio");

    const response = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      formats: formats.map((f) => ({
        quality: f.qualityLabel,
        url: f.url,
        type: f.mimeType.split(";")[0],
      })),
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching video info:", err.message);
    res.status(500).json({ error: "Failed to fetch video info" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
