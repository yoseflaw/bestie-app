"use server";

// server action to allow configuration of LLM from .env.local

import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import MemoryManager from "@/app/utils/memory";
import { Message } from "ai";


export async function getChatHistory(compName: string, userId: string) {
  const companionKey = {
    companionName: compName!,
    modelName: "chatgpt",
    userId: userId,
  };
  const memoryManager = await MemoryManager.getInstance();
  const records = await memoryManager.readLatestHistoryRaw(companionKey);
  return convertChatToMessages(records)
}

export async function getCompanions(userId: string) {
  // const COMPFILE = "./companions/companions.json";
  // var companions = [];
  // // console.log("Loading companion descriptions from "+COMPFILE);
  // var fs = require('fs');
  // const data = fs.readFileSync(COMPFILE);
  // console.log(String(data));
  // // run a parse here to force a server side error if the JSON is improperly formatted
  // // It's much more difficult to debug client side
  // var js = JSON.parse(String(data));
  // return String(data);

  const file = await fs.readFile("./companions/companions.json", 'utf8');
  const data = JSON.parse(file);

  for (const datum of data) {
    datum['chatHistory'] = await getChatHistory(datum.name, userId)
    // datum['chatHistory'] = convertChatToMessages(chatHistory)
  }
  return data
}

function convertChatToMessages(data: string[]): Message[] {
  return data
  .map(item => {
    const splitIndex = item.indexOf(':');
    if (splitIndex !== -1) {
      const speaker = item.slice(0, splitIndex).trim();
      const message = item.slice(splitIndex + 1).trim();
      if (message.length > 0) {
        const chatMessage: Message = {
          id: uuidv4(),
          role: speaker === 'Human' ? 'user' : 'assistant',
          content: message
        }
        return chatMessage
      }
    }
    return null;
  })
  .filter((item): item is Message => item !== null);
}