const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const ACCESS_KEY = process.env.ACCESS_KEY || "akaki";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/convert", (req, res) => {
  const { url, key } = req.body;

  if (key !== ACCESS_KEY) {
    return res.status(403).send("არასწორი პაროლი");
  }

  if (!url) {
    return res.status(400).send("No URL provided");
  }

  const output = `audio-${Date.now()}.mp3`;
  const cmd = `yt-dlp -x --audio-format mp3 -o "${output}" "${url}"`;

  exec(cmd, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Conversion failed");
    }

    res.download(output, "converted.mp3", () => {
      fs.unlink(output, () => {});
    });
  });
});

app.listen(3000, () => {
  console.log("==============================");
  console.log(" MP3 Converter Server Running ");
  console.log(" http://localhost:3000 ");
  console.log("==============================");
});
