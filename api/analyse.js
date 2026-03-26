export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64, mediaType } = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              {
                type: "text",
                text: `You are a professional skin analyst. Analyse this face and return ONLY a JSON object with no markdown:
{
  "skinType": "oily|dry|combination|normal",
  "concerns": ["from: acne, dryness, pigmentation, oiliness, fine lines, sun damage"],
  "overallScore": <1-10>,
  "summary": "<2 friendly sentences about their skin>",
  "zones": {
    "forehead": "<brief note>",
    "cheeks": "<brief note>",
    "nose": "<brief note>",
    "chin": "<brief note>"
  }
}
If not a clear face photo, return valid JSON with a note in summary.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const raw = data.content?.find((c) => c.type === "text")?.text || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Analysis failed" });
  }
}
