import { Inter } from "next/font/google";
import "./globals.css";
import "./prism.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: [ "latin" ],
});

export const metadata = {
  title: "DeepSeek",
  description: "Full Stack Project",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="en">
          <body className={ `${inter.className} antialiased bg-[#292a2d]` }>
            <Toaster
              toastOptions={ {
                success: { style: { background: "black", color: "white" } },
                error: { style: { background: "black", color: "white" } },
              } }
            />
            { children }
          </body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}
