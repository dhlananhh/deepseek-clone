import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";

interface OpenMenuState {
  id: string | number;
  open: boolean;
}

interface ChatLabelProps {
  openMenu: OpenMenuState;
  setOpenMenu: Dispatch<SetStateAction<OpenMenuState>>;
  id: string;
  name: string;
}

const ChatLabel: React.FC<ChatLabelProps> = ({
  openMenu,
  setOpenMenu,
  id,
  name,
}) => {
  const { fetchUsersChats, chats, setSelectedChat } = useAppContext();

  const selectChat = () => {
    const chatData = chats.find((chat) => chat._id === id);
    if (chatData) {
      setSelectedChat(chatData);
    }
    console.log(chatData);
  };

  const renameHandler = async () => {
    try {
      const newName = prompt("Enter new name");
      if (!newName || newName.trim() === "") return;

      const { data } = await axios.post<{ success: boolean; message: string }>(
        "/api/chat/rename",
        {
          chatId: id,
          name: newName,
        }
      );

      if (data.success) {
        fetchUsersChats();
        setOpenMenu({ id: 0, open: false });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred during rename.");
      }
    }
  };

  const deleteHandler = async () => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this chat?"
      );
      if (!confirmDelete) return;

      const { data } = await axios.post<{ success: boolean; message: string }>(
        "/api/chat/delete",
        { chatId: id }
      );

      if (data.success) {
        fetchUsersChats();
        setOpenMenu({ id: 0, open: false });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred during delete.");
      }
    }
  };

  return (
    <div
      onClick={ selectChat }
      className="flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer"
    >
      <p className="group-hover:max-w-5/6 truncate">{ name }</p>
      <div
        onClick={ (e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          setOpenMenu((prev) => ({
            id: id,
            open: prev.id === id ? !prev.open : true,
          }));
        } }
        className="group relative flex items-center justify-center h-6 w-6 aspect-square hover:bg-black/80 rounded-lg"
      >
        <Image
          src={ assets.three_dots as string }
          alt="three dots"
          width={ 16 }
          height={ 16 }
          className={ `w-4 ${openMenu.id === id && openMenu.open ? "" : "hidden"
            } group-hover:block` }
        />
        <div
          className={ `absolute ${openMenu.id === id && openMenu.open ? "block" : "hidden"
            } -right-36 top-6 bg-gray-700 rounded-xl w-max p-2 z-10` }
        >
          <div
            onClick={ renameHandler }
            className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            <Image
              src={ assets.pencil_icon as string }
              alt="pencil icon"
              className="w-4"
              width={ 16 }
              height={ 16 }
            />
            <p>Rename</p>
          </div>
          <div
            onClick={ deleteHandler }
            className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            <Image
              src={ assets.delete_icon as string }
              alt="delete icon"
              className="w-4"
              width={ 16 }
              height={ 16 }
            />
            <p>Delete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLabel;
