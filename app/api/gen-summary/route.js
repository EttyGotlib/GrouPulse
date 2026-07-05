import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Missing API key" }, { status: 500 });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // פונקציית retry
    async function generateWithRetry(retries = 2) {
      try {
        return await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        }); // OR
              //const response = await ai.models.generateContent({
              //model: "gemini-2.5-flash",
              //OR model "gemini-flash-latest"
              //contents: prompt,
              // });
      } catch (err) {
        if (err.status === 503 && retries > 0) {
          await new Promise(r => setTimeout(r, 1000));
          return generateWithRetry(retries - 1);
        }
        throw err;
       }
    }

    const response = await generateWithRetry();

    return Response.json({
      text: response.text,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    // 💥 טיפול חכם בשגיאות
    if (error.status === 429) {
      return Response.json(
        { error: "QUOTA_EXCEEDED" },
        { status: 429 }
      );
    }

    if (error.status === 503) {
      return Response.json(
        { error: "MODEL_BUSY" },
        { status: 503 }
      );
    }

    return Response.json(
      { error: "AI_ERROR" },
      { status: 500 }
    );
  }
}