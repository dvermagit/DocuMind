import FileUpload from "@/components/FileUpload";
import SubscriptionButton from "@/components/SubscriptionButton";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { ArrowRightIcon, LogInIcon } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  // const isAuth = !!userId;
  const isPro = await checkSubscription();
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col justify-center items-center">
          <div className="flex items-center justify-center">
            <h1 className="mr-3 text-5xl font-semibold ">
              AI Chat with any PDF
            </h1>
            <div className="flex items-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
          <div className="flex mt-2 ">
            {userId && firstChat && (
              <Link href={`/chat/${firstChat.id}`}>
                <Button>
                  Go to Chats <ArrowRightIcon />
                </Button>
              </Link>
            )}
            <div className="ml-2">
              <SubscriptionButton isPro={isPro} />
            </div>
          </div>
          <p className=" max-w-xl text-center mt-1 text-lg text-neutral-600">
            Join millions of students,researchers and professionals online to
            <span className="pl-1">
              instantly answer questions and understand research with AI
            </span>
          </p>
          <div className="mt-1 w-full ">
            {userId ? (
              <FileUpload />
            ) : (
              <div className="flex items-center justify-center">
                <Link href="/sign-in">
                  <Button>
                    Login to get started! <LogInIcon />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// Docdrift – “Converse with your documents. No scrolling, just asking.”
