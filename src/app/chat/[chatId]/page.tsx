import ChatSidebar from "@/components/ChatSidebar";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

interface ChatPageProps {
  params: { chatId: string };
}
export default async function ChatPage({ params: { chatId } }: ChatPageProps) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }
  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs">
          <ChatSidebar chats={_chats} chatId={parseInt(chatId)} />
        </div>

        {/* pdf viewer */}
        <div className="max-h-screen p-4 overflow-scroll flex-[5]">
          {/* <PDFViewer/> */}
        </div>

        {/* chat component */}
        <div className="flex-[3] border-l-4 border-gray-200">
          {/* <ChatComponent/> */}
        </div>
      </div>
    </div>
  );
}
