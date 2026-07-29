// Receives recorded audio and forwards it to Groq's Whisper API.
// Keeps GROQ_API_KEY on the server, off any client device.

const express = require('express');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file received (expected field name "audio")' });
  }

  try {
    // Read the whole file into memory and use native FormData/Blob.
    // The 'form-data' npm package does not stream reliably with Node's
    // built-in fetch (undici) and causes Groq to see a truncated body.
    const fileBuffer = fs.readFileSync(req.file.path);
    const blob = new Blob([fileBuffer]);

    const form = new FormData();
    form.append('file', blob, req.file.originalname || 'audio.wav');
    form.append('model', 'whisper-large-v3');
    form.append('language', req.body.language || 'ur');
    form.append('response_format', 'json');

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: form,
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq API error ${groqRes.status}: ${errText}`);
    }

    const data = await groqRes.json();
    res.json({ text: data.text || '' });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

module.exports = router;
