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

import { Message, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { getContext } from "@/lib/context";
import { chats } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { messages as _messages } from "@/lib/db/schema";
// export const runtime = "edge"; // Optional: if you're using edge runtime like Vercel

// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    // console.log("req")

    const { messages, chatId } = await req.json();

    console.log("messages", messages);
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    console.log("chatId:", chatId);
    console.log("DB result for chats:", _chats);
    if (!_chats || _chats.length === 0 || !_chats[0]?.fileKey) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    console.log("chats", _chats);
    // const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1]; // the last message is query itself by the user
    console.log("lastMessage", lastMessage);
    const context = await getContext(lastMessage.content);
    // const context = await getContext(lastMessage.content,fileKey);

    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    async function onStart() {
      //save user message in db
      await db.insert(_messages).values({
        chatId,
        content: lastMessage.content,
        role: "user",
      });
    }

    await onStart();

    // async function onCompletion(completion) {
    //   //save ai message in db
    //   await db.insert(_messages).values({
    //     chatId,
    //     content: completion,
    //     role: "system",
    //   });
    // }
    // await onCompletion()
    const result = streamText({
      model: google("gemini-1.5-flash-latest"),
      // prompt: "Invent a new holiday and describe its traditions.",
      system: "You are a helpful assistant.",
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      onFinish: async (completion) => {
        //save ai message in db
        const content = completion.text; // extract the text from the completion object
        await db.insert(_messages).values({
          chatId,
          content,
          role: "system",
        });
      },
    });

    for await (const chunk of result.textStream) {
      console.log(chunk);
    }

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Gemini error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
