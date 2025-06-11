// import { Configuration, OpenAIApi } from "openai";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(config);

// export async function getEmbedding(text: string) {
//   try {
//     const response = await openai.createEmbedding({
//       model: "text-embedding-ada-002",
//       input: text.replace(/\n/g, " "),
//     });

//     const result = await response.json();
//     return result.data[0].embedding as number[];
//   } catch (error) {
//     console.log("error calling embedding api", error);
//     throw error;
//   }
// }

// import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
// import { TaskType } from './path/to/task-type';

// const genAI = new GoogleGenerativeAI(
//   process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? ""
// );

// or

// const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
// if (!apiKey) {
//   throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY environment variable is not set");
// }

// const genAI = new GoogleGenerativeAI(apiKey);

// export async function getEmbedding(text: string) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "embedding-001" });

//     const result = await model.embedContent({
//       content: {
//         parts: [{ text: text.replace(/\n/g, " ") }],
//         role: "user",
//       },
//       taskType: "RETRIEVAL_DOCUMENT" as TaskType, // or "RETRIEVAL_QUERY" depending on use case
//     });

//     return result.embedding.values as number[];
//   } catch (error) {
//     console.log("error calling embedding api", error);
//     throw error;
//   }
// }

import { google } from "@ai-sdk/google";

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const model = google.textEmbeddingModel("text-embedding-004", {
      taskType: "RETRIEVAL_DOCUMENT",
    });

    const result = await model.doEmbed({
      values: [text],
    });

    return result.embeddings[0]; // each embedding is already number[]
  } catch (error) {
    console.log("error calling embedding api", error);
    throw error;
  }
}
