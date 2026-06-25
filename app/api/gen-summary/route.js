import { GoogleGenAI } from "@google/genai";

/**
 * Next.js API Route Handler
 * Handles AI analysis requests by interfacing with the Gemini API.
 * Includes built-in retry mechanisms and structured error handling.
 * 
 * @param {Request} req - The incoming Next.js request object containing the prompt in JSON.
 * @returns {Promise<Response>} JSON response with the generated text or a structured error code.
 */
export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Missing API key" }, { status: 500 });
    }

    // Initialize the Google GenAI SDK client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    /**
     * Helper function to handle API calls with an exponential/static retry mechanism.
     * Specifically handles Service Unavailable (503) errors by retrying after a timeout.
     * 
     * @param {number} retries - Number of remaining retry attempts (defaults to 2).
     * @returns {Promise<object>} The raw response object from the Gemini model.
     */

    async function generateWithRetry(retries = 2) {
      try {
        //Due to using a free AI tool,
        // we may need to switch between versions for things to work as expected.
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

    // Return the successfully generated text
    return Response.json({
      text: response.text,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    // Smart error handling for rate limiting
    if (error.status === 429) {
      return Response.json(
        { error: "QUOTA_EXCEEDED" },
        { status: 429 }
      );
    }

    // Structured Error Handling for client/UI feedback

    // Handle persistent Model Overload/Service Unavailable errors
    if (error.status === 503) {
      return Response.json(
        { error: "MODEL_BUSY" },
        { status: 503 }
      );
    }

    // Fallback error code for any unhandled internal server exceptions
    return Response.json(
      { error: "AI_ERROR" },
      { status: 500 }
    );
  }
}