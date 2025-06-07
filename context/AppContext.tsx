"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import toast from "react-hot-toast";

// Define the structure of a message
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

// Define the structure of a chat
export interface Chat {
  _id: string;
  name: string;
  messages: Message[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface AppContextType {
  user: UserResource | null | undefined;
  chats: Chat[];
  setChats: Dispatch<SetStateAction<Chat[]>>;
  selectedChat: Chat | null;
  setSelectedChat: Dispatch<SetStateAction<Chat | null>>;
  fetchUsersChats: () => Promise<void>;
  createNewChat: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [ chats, setChats ] = useState<Chat[]>([]);
  const [ selectedChat, setSelectedChat ] = useState<Chat | null>(null);

  const createNewChat = async (): Promise<void> => {
    try {
      if (!user) return;

      const token = await getToken();
      if (!token) {
        toast.error("Authentication token not found.");
        return;
      }

      await axios.post(
        "/api/chat/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchUsersChats();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred while creating a chat.");
      }
    }
  };

  const fetchUsersChats = async (): Promise<void> => {
    try {
      if (!user) return;
      const token = await getToken();
      if (!token) {
        toast.error("Authentication token not found for fetching chats.");
        return;
      }

      const { data } = await axios.get<{ success: boolean; data?: Chat[]; message?: string }>(
        "/api/chat/get",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success && data.data) {
        const sortedChats = [ ...data.data ].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setChats(sortedChats);

        if (sortedChats.length === 0) {
          createNewChat().then(() => fetchUsersChats());
        } else {
          setSelectedChat(sortedChats[ 0 ]);
        }
      } else {
        toast.error(data.message || "Failed to fetch chats.");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn("Unauthorized access while fetching chats.");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred while fetching chats.");
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [ user ]);

  const value: AppContextType = {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  };

  return (
    <AppContext.Provider value={ value }>
      { children }
    </AppContext.Provider>
  );
};
