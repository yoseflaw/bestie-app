import dotenv from "dotenv";

import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

dotenv.config({ path: `.env.local` });

export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private pc: Pinecone;

  public constructor() {
    this.history = Redis.fromEnv();
    this.pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
  }

  public async vectorSearch(
    recentChatHistory: string,
    companionFileName: string
  ) {
    console.log("INFO: using Pinecone for vector search.");
    const pineconeIndex = this.pc.index(process.env.PINECONE_INDEX!);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex }
    );

    const similarDocs = await vectorStore
      .similaritySearch(recentChatHistory, 3, { fileName: companionFileName })
      .catch((err) => {
        console.log("WARNING: failed to get vector search results.", err);
      });
    return similarDocs;
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private generateRedisCompanionKey(companionKey: CompanionKey): string {
    return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
  }

  public async writeToHistory(text: string, companionKey: CompanionKey) {
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrectly");
      return "";
    }

    const key = this.generateRedisCompanionKey(companionKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  public async readLatestHistoryRaw(companionKey: CompanionKey): Promise<string[]> {
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrectly");
      return [];
    }

    const key = this.generateRedisCompanionKey(companionKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    result = result.slice(-30).reverse();
    const recentChats = result.reverse();

    // Ensure all elements in result are strings
    if (recentChats.every(item => typeof item === 'string')) {
      return recentChats as string[];
    } else {
      throw new Error('Invalid data type in result array');
    }
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    const latestHistory = await this.readLatestHistoryRaw(companionKey);
  
    if (latestHistory.length === 0) {
      return "";
    }
  
    return latestHistory.join("\n");
  }  

  public async seedChatHistory(
    seedContent: String,
    delimiter: string = "\n",
    companionKey: CompanionKey
  ) {
    const key = this.generateRedisCompanionKey(companionKey);
    if (await this.history.exists(key)) {
      console.log("User already has chat history");
      return;
    }

    const content = seedContent.split(delimiter);
    let counter = 0;
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}

export default MemoryManager;
