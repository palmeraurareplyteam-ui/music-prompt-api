import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/music-prompt", async (req, res) => {
  const style = req.query.style;
  if (!style) return res.status(400).json({ error: "Missing ?style= parameter" });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `You are an expert AI music prompt engineer for Suno and Udio. Generate optimized prompts for the style: "${style}". Return ONLY valid JSON, no markdown, no extra text: {"style":"${style}","suno_prompt":"detailed suno prompt","udio_prompt":"detailed udio prompt","mood":"one word","bpm_range":"e.g. 130-145","key_instruments":["instrument1","instrument2","instrument3"],"best_for":"short use case description"}`
        }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    console.log("Groq response:", JSON.stringify(data));

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Groq error", raw: data });
    }

    const text = data.choices[0].message.content.trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Failed", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Music Prompt API running on port ${port}`));
