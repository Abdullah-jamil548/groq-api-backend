require('dotenv').config();
const express = require('express');
const transcribeRouter = require('./routes/transcribe');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple health check so you can confirm the server is up from a browser.
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Groq Whisper transcription server is running' });
});

app.use(transcribeRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Groq Whisper backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Transcribe endpoint: http://localhost:${PORT}/api/transcribe`);
});
