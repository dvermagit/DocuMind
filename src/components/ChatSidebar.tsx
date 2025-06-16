"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "./ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import SubscriptionButton from "./SubscriptionButton";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSidebar = ({ chats, chatId, isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-gray-800 ">
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>

      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn(
                "rounded-lg p-3 text-slate-300 flex items-center gap-2",
                {
                  " bg-blue-500 text-white  ": chat.id === chatId,
                  "hover:text-white": chat.id !== chatId,
                }
              )}
            >
              <MessageCircle />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="flex tems-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <Link href="/" className="hover:text-white">
            Source
          </Link>
        </div>
        {/* Stripe Button */}
        <SubscriptionButton isPro={isPro} />
        {/* <Button
          className="mt-2 text-white bg-slate-700"
          disabled={loading}
          onClick={handleSubscription}
        >
          Upgrade To Pro!
        </Button> */}
      </div>
    </div>
  );
};

export default ChatSidebar;
