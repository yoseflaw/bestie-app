"use client";

import {Fragment, useEffect, useState, useRef} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Message } from "ai"
import { useChat } from "ai/react";
import {ChatBlock, responseToChatBlocks} from "@/components/ChatBlock";
import MessageForm from '@/components/ui/messageform'
import ChatMessage from '@/components/ui/chatmessage'
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { getChatMessages } from "./actions";
import { setClerkApiKey } from "@clerk/clerk-sdk-node";

var last_name = "";

export default function QAModal({
  open,
  setOpen,
  example,
  userId,
  userImageUrl,
}: {
  open: boolean;
  setOpen: any;
  example: any;
  userId: any;
  userImageUrl: string;
}) {
  const [clientExample, setClientExample] = useState(example);
  useEffect(() => {
    if (!example) {
      setClientExample({
        llm: "",
        name: "",
      });
    } else {
      setClientExample(example);
    }
  }, [example]);

  const { 
    isLoading,
    stop,
    messages, 
    setMessages, 
    input,
    setInput,
    handleInputChange, 
    handleSubmit 
  } = useChat({
    api: "/api/" + clientExample.llm,
    headers: { name: clientExample.name }
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleClose = () => {
    setInput("");
    setMessages([])
    stop();
    setOpen(false);
  };

  if (!clientExample) {
    console.log("ERROR: no companion selected");
    return null;
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-950 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:p-6 w-full max-w-3xl">
                <div className="flex flex-col">
                  <h3 className="text-medium font-medium text-white">
                    {example.name}
                  </h3>
                  <dl className="flex flex-grow flex-col justify-between">
                    <h4 className="text-sm font-medium text-slate-400">
                      {isLoading? "typing...": "online"}
                    </h4>
                  </dl>
                </div>
                <div className="h-[80vh]">
                  <div ref={chatContainerRef} className="flex flex-col gap-4 h-full overflow-y-auto pb-20">
                    {messages.map(m => (
                      <ChatMessage
                        key={m.id}
                        role={m.role}
                        content={m.content}
                        compImageUrl={example.imageUrl}
                        userImageUrl={userImageUrl}
                      />
                    ))}
                  </div>
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800">
                    <MessageForm
                      input={input}
                      isLoading={isLoading}
                      handleInputChange={handleInputChange}
                      handleSubmit={handleSubmit}
                    />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
