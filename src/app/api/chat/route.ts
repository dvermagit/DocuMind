// import { configuration, OpenAIApi } from "openai-edge";
// import { openAiStream,streamingTextResponse } from "ai";
// export const runtime = "edge";

// const config = new configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(config);

// export async function POST(req: Request) {
//   try {
//     const { messages } = await req.json();
//     const response = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages,
//       stream: true,
//     });
//     const stream = openAiStream(response);
//     return new streamingTextResponse(stream);
//   } catch (error) {}
// }

// File: /app/api/chat/route.ts (or appropriate server route)
import { generateText, streamText } from "ai";

// import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "@ai-sdk/google";

export const runtime = "edge"; // Optional: if you're using edge runtime like Vercel

// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Convert messages to Gemini format
    // const promptParts = messages.map((msg: any) => ({
    //   role: msg.role === "user" ? "user" : "model",
    //   parts: [{ text: msg.content }],
    // }));

    const result = streamText({
      model: google("gemini-1.5-flash-latest"),
      // prompt: "Invent a new holiday and describe its traditions.",
      system: "You are a helpful assistant.",
      messages,
    });

    for await (const chunk of result.textStream) {
      console.log(chunk);
    }

    // const encoder = new TextEncoder();
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     for await (const chunk of result.stream) {
    //       const text = chunk.text();
    //       controller.enqueue(encoder.encode(text));
    //     }
    //     controller.close();
    //   },
    // });

    // return new Response(stream, {
    //   headers: {
    //     "Content-Type": "text/plain; charset=utf-8",
    //     "Transfer-Encoding": "chunked",
    //   },
    // });

    // console.log full stream response

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Gemini error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
