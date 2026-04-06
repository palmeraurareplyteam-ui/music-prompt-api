import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/music-prompt", async (req, res) => {
  const style = req.query.style;
  if (!style) return res.status(400).json({ error: "Missing ?style= parameter. Try: phonk, lofi, dark trap, hyperpop, cinematic" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are an expert AI music prompt engineer for Suno and Udio. Generate optimized prompts for the style: "${style}". Return ONLY valid JSON, no markdown, no extra text:
{"style":"${style}","suno_prompt":"detailed suno prompt","udio_prompt":"detailed udio prompt","mood":"one word","bpm_range":"e.g. 130-145","key_instruments":["instrument1","instrument2","instrument3"],"best_for":"short use case description"}`
        }]
      })
    });

    const data = await response.json();
    
    if (!data.content || !data.content[0]) {
      return res.status(500).json({ error: "API error", details: data });
    }

    const text = data.content[0].text.trim();
    const result = JSON.parse(text);
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Failed to generate prompt", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Music Prompt API running on port ${port}`));
