"use client";

import { assets } from "@/assets/assets";
import MessageComponent from "@/components/Message";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import { Message, useAppContext } from "@/context/AppContext";
import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [ expand, setExpand ] = useState<boolean>(false);
  const [ messages, setMessages ] = useState<Message[]>([]);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const { selectedChat } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat && selectedChat.messages) {
      setMessages(selectedChat.messages);
    } else {
      setMessages([]);
    }
  }, [ selectedChat ]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [ messages ]);

  const getAssetSrc = (assetKey: keyof typeof assets): string | StaticImageData => {
    return assets[ assetKey ];
  }

  return (
    <div>
      <div className="flex h-screen">
        <Sidebar expand={ expand } setExpand={ setExpand } />
        <div className="flex-1 flex flex-col items-center justify-between px-4 pb-8 bg-[#292a2d] text-white relative">
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full z-10">
            <Image
              onClick={ () => setExpand((prev) => !prev) }
              className={ `rotate-180 cursor-pointer ${expand ? 'hidden' : ''}` }
              src={ getAssetSrc('menu_icon') }
              alt="menu icon"
              width={ 24 } height={ 24 }
            />
            <p className="font-semibold text-lg">
              { selectedChat?.name && expand ? selectedChat.name : !expand ? "DeepSeek" : "" }
            </p>

            <Image
              className="opacity-70"
              src={ getAssetSrc('chat_icon') }
              alt="chat icon"
              width={ 24 } height={ 24 }
            />
          </div>

          { messages.length === 0 ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <Image
                  src={ getAssetSrc('logo_icon') }
                  alt="logo icon"
                  className="h-16 w-16"
                  width={ 64 } height={ 64 }
                />
                <p className="text-2xl font-medium">Hi, I&apos;m DeepSeek</p>
              </div>
              <p className="text-sm mt-2 text-gray-400">How can I help you today?</p>
            </div>
          ) : (
            <div
              ref={ containerRef }
              className="relative flex flex-col items-center justify-start w-full mt-16 md:mt-10 pt-4 pb-4 max-h-full overflow-y-auto"
            >
              <p className="fixed top-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:relative md:top-auto border border-transparent hover:border-gray-500/50 py-1 px-2 rounded-lg font-semibold mb-6 z-10 bg-[#292a2d]">
                { selectedChat?.name || "Chat" }
              </p>
              { messages.map((msg, index) => (
                <MessageComponent
                  key={ `${msg.timestamp}-${index}` }
                  role={ msg.role }
                  content={ msg.content }
                />
              )) }
              { isLoading && (
                <div className="flex gap-4 max-w-3xl w-full py-3 items-center">
                  <Image
                    className="h-9 w-9 p-1 border border-white/15 rounded-full"
                    src={ getAssetSrc('logo_icon') }
                    alt="Logo"
                    width={ 36 } height={ 36 }
                  />
                  <div className="loader flex justify-center items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                      style={ { animationDelay: '0.2s' } }></div>
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                      style={ { animationDelay: '0.4s' } }></div>
                  </div>
                </div>
              ) }
            </div>
          ) }
        </div>

        {/* Prompt Box Area */ }
        <div className="w-full flex flex-col items-center">
          <PromptBox isLoading={ isLoading } setIsLoading={ setIsLoading } />
          <p className="text-xs mt-2 text-gray-500">
            AI-generated, for reference only
          </p>
        </div>
      </div>
    </div>
  );
}
