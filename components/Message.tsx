import { assets } from "@/assets/assets";
import Image, { StaticImageData } from "next/image";
import React, { useEffect } from "react";
import Markdown from "react-markdown";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import toast from "react-hot-toast";

interface MessageProps {
  role: "user" | "assistant" | "system";
  content: string;
}

const MessageComponent: React.FC<MessageProps> = ({ role, content }) => {
  const copyMessage = () => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [ content ]);

  const getAssetSrc = (assetKey: keyof typeof assets): string | StaticImageData => {
    return assets[ assetKey ];
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div
        className={ `flex flex-col w-full mb-8
          ${role === "user" && "items-end"}` }
      >
        <div
          className={ `group relative flex max-w-2xl py-3 rounded-xl
            ${role === "user" ? "bg-[#414158] px-5" : "gap-3"}` }
        >
          <div
            className={ `opacity-0 group-hover:opacity-100 absolute
              ${role === "user" ? "-left-16 top-2.5" : "left-9 -bottom-6"}
              transition-all` }
          >
            <div className="flex items-center gap-2 opacity-70">
              { role === "user" ? (
                <>
                  <Image
                    onClick={ copyMessage }
                    src={ getAssetSrc('copy_icon') }
                    alt="copy icon"
                    className="w-4 cursor-pointer"
                    width={ 16 } height={ 16 }
                  />
                  <Image
                    src={ getAssetSrc('pencil_icon') }
                    alt="pencil icon"
                    className="w-4.5 cursor-pointer"
                    width={ 18 } height={ 18 }
                  />
                </>
              ) : (
                <>
                  <Image
                    onClick={ copyMessage }
                    src={ getAssetSrc('copy_icon') }
                    alt="copy icon"
                    className="w-4.5 cursor-pointer"
                    width={ 18 } height={ 18 }
                  />
                  <Image
                    src={ getAssetSrc('regenerate_icon') }
                    alt="regenerate icon"
                    className="w-4 cursor-pointer"
                    width={ 16 } height={ 16 }
                  />
                  <Image
                    src={ getAssetSrc('like_icon') }
                    alt="like icon"
                    className="w-4 cursor-pointer"
                    width={ 16 } height={ 16 }
                  />
                  <Image
                    src={ getAssetSrc('dislike_icon') }
                    alt="dislike icon"
                    className="w-4 cursor-pointer"
                    width={ 16 } height={ 16 }
                  />
                </>
              ) }
            </div>
          </div>
          { role === "user" ? (
            <span className="text-white/90">{ content }</span>
          ) : (
            <>
              <Image
                src={ getAssetSrc('logo_icon') }
                alt="logo icon"
                className="w-9 h-9 p-1 border border-white/15 rounded-full"
                width={ 36 } height={ 36 }
              />
              <div className="space-y-4 w-full overflow-x-auto">
                <Markdown>{ content }</Markdown>
              </div>
            </>
          ) }
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
