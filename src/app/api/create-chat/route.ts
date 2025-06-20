// import { db } from "@/lib/db";
// import { chats } from "@/lib/db/schema";
// import { loadS3IntoPinecone } from "@/lib/pinecone";
// import { getS3Url } from "@/lib/s3";
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function POST(req: Request, res: Response) {
//   const { userId } = await auth();
//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//   try {
//     const body = await req.json();
//     const { file_key, file_name } = body;
//     console.log(file_key, file_name);
//     await loadS3IntoPinecone(file_key);
//     const chat_id = await db
//       .insert(chats)
//       .values({
//         fileKey: file_key,
//         pdfName: file_name,
//         pdfUrl: getS3Url(file_key),
//         userId,
//       })
//       .returning({
//         insertedId: chats.id,
//       });

//     return NextResponse.json(
//       { chat_id: chat_id[0].insertedId },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const authData = await auth();
  const userId = authData?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { file_key, file_name } = await req.json();

    console.log("Received:", { file_key, file_name });

    await loadS3IntoPinecone(file_key);

    const insertedRows = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
      })
      .returning({ insertedId: chats.id });

    const insertedId = insertedRows.at(0)?.insertedId;

    return NextResponse.json({ chat_id: insertedId }, { status: 200 });
  } catch (error) {
    console.error("Error inserting chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
