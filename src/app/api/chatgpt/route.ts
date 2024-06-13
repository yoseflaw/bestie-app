import { OpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { LLMChain } from "langchain/chains";
import { StreamingTextResponse, LangChainStream } from "ai";
import clerk from "@clerk/clerk-sdk-node";
import { CallbackManager } from "@langchain/core/callbacks/manager"
import { PromptTemplate } from "@langchain/core/prompts";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import MemoryManager from "@/app/utils/memory";
import { rateLimit } from "@/app/utils/rateLimit";
import twilio from "twilio";
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

dotenv.config({ path: `.env.local` });

export async function POST(req: Request) {
  let clerkUserId;
  let user;
  let clerkUserName;
  // const { prompt, isText, userId, userName, messages } = await req.json();
  const { messages } = await req.json();

  user = await currentUser();
  clerkUserId = user?.id;
  clerkUserName = user?.firstName;

  const identifier = req.url + "-" + (clerkUserId || "anonymous");
  const { success } = await rateLimit(identifier);
  if (!success) {
    console.log("INFO: rate limit exceeded");
    return new NextResponse(
      JSON.stringify({ Message: "Hi, the companions can't talk this fast." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // XXX Companion name passed here. Can use as a key to get backstory, chat history etc.
  const name = req.headers.get("name");
  const companionFileName = name + ".txt";

  const prompt = messages[messages.length-1]['content']
  console.log("prompt: ", prompt);
  // if (isText) {
  //   clerkUserId = userId;
  //   clerkUserName = userName;
  // } else {
  // }

  if (!clerkUserId || !!!(await clerk.users.getUser(clerkUserId))) {
    console.log("user not authorized");
    return new NextResponse(
      JSON.stringify({ Message: "User not authorized" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Load character "PREAMBLE" from character file. These are the core personality
  // characteristics that are used in every prompt. Additional background is
  // only included if it matches a similarity comparioson with the current
  // discussion. The PREAMBLE should include a seed conversation whose format will
  // vary by the model using it.
  const fs = require("fs").promises;
  const data = await fs.readFile("companions/" + companionFileName, "utf8");

  // Clunky way to break out PREAMBLE and SEEDCHAT from the character file
  const presplit = data.split("###ENDPREAMBLE###");
  const preamble = presplit[0];
  const seedsplit = presplit[1].split("###ENDSEEDCHAT###");
  const seedchat = seedsplit[0];

  const companionKey = {
    companionName: name!,
    modelName: "chatgpt",
    userId: clerkUserId,
  };
  const memoryManager = await MemoryManager.getInstance();

  const records = await memoryManager.readLatestHistory(companionKey);
  if (records.length === 0) {
    await memoryManager.seedChatHistory(seedchat, "\n\n", companionKey);
  }

  await memoryManager.writeToHistory("Human: " + prompt + "\n", companionKey);
  let recentChatHistory = await memoryManager.readLatestHistory(companionKey);

  // query Pinecone
  const similarDocs = await memoryManager.vectorSearch(
    recentChatHistory,
    companionFileName
  );

  let relevantHistory = "";
  if (!!similarDocs && similarDocs.length !== 0) {
    relevantHistory = similarDocs.map((doc: { pageContent: any; }) => doc.pageContent).join("\n");
  }

  // const { stream, handlers } = LangChainStream();

  // const model = new OpenAI({
  //   streaming: true,
  //   modelName: "gpt-4o",
  //   openAIApiKey: process.env.OPENAI_API_KEY,
  //   // callbacks: [new ConsoleCallbackHandler()],
  //   callbackManager: CallbackManager.fromHandlers(handlers),
  // });
  // model.verbose = true;

  // const replyWithTwilioLimit = isText
  //   ? "You reply within 1000 characters."
  //   : "";

  // const chainPrompt = PromptTemplate.fromTemplate(`
  //   You are ${name} and are currently talking to ${clerkUserName}.

  //   ${preamble}

  // Below are relevant details about ${name}'s past
  // ${relevantHistory}
  
  // Below is a relevant conversation history

  // ${recentChatHistory}`);

  // const chain = new LLMChain({
  //   llm: model,
  //   prompt: chainPrompt,
  // });

  // const result = await chain
  //   .call({
  //     relevantHistory,
  //     recentChatHistory: recentChatHistory,
  //   })
  //   .catch(console.error);


  const systemPrompt = `
  You are ${name} and are currently talking to ${clerkUserName}.

  ${preamble}

  Below are relevant details about ${name}'s past
  ${relevantHistory}

  Below is a relevant conversation history

  ${recentChatHistory}
  `

  console.log(systemPrompt)

  const result = await streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: messages,
    async onFinish({text}) {
      await memoryManager.writeToHistory(
        name + ": " + text + "\n",
        companionKey
      )
    },
  });

  return result.toAIStreamResponse();

  // console.log("result", result);
  // const chatHistoryRecord = await memoryManager.writeToHistory(
  //   result!.text + "\n",
  //   companionKey
  // );
  // console.log("chatHistoryRecord", chatHistoryRecord);
  // if (isText) {
  //   return NextResponse.json(result!.text);
  // }

  // const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  // const accountSid = process.env.TWILIO_ACCOUNT_SID;
  // const twilioClient = twilio(accountSid, twilioAuthToken);
  // twilioClient.messages
  //   .create({
  //       body: result!.text,
  //       from: 'whatsapp:+14155238886',
  //       to: 'whatsapp:+628176670997'
  //   }).catch((err) => {
  //     console.log("WARNING: failed to send WA.", err);
  //   });


  // return new StreamingTextResponse(stream);
}