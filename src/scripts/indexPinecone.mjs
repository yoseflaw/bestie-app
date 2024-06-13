// Major ref: https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/pinecone
// import { PineconeClient } from "@pinecone-database/pinecone";
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from "dotenv";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { CharacterTextSplitter } from "langchain/text_splitter";
import fs from "fs";
import path from "path";

dotenv.config({ path: `.env.local` });

const fileNames = fs.readdirSync("companions");
const splitter = new CharacterTextSplitter({
  separator: " ",
  chunkSize: 200,
  chunkOverlap: 50, //TODO: adjust both chunk size and chunk overlap later
});

const langchainDocs = await Promise.all(
  fileNames.map(async (fileName) => {
    if (fileName.endsWith(".txt")) {
      const filePath = path.join("companions", fileName);
      const fileContent = fs.readFileSync(filePath, "utf8");
      // get the last section in the doc for background info
      const lastSection = fileContent.split("###ENDSEEDCHAT###").slice(-1)[0];
      const splitDocs = await splitter.createDocuments([lastSection]);
      return splitDocs.map((doc) => {
        return new Document({
          metadata: { fileName },
          pageContent: doc.pageContent,
        });
      });
    }
  })
);

// const client = new PineconeClient();
// await client.init({
//   apiKey: process.env.PINECONE_API_KEY,
//   environment: process.env.PINECONE_ENVIRONMENT,
// });
// const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});
const pineconeIndex = pc.index(process.env.PINECONE_INDEX);

await PineconeStore.fromDocuments(
  langchainDocs.flat().filter((doc) => doc !== undefined),
  new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
  {
    pineconeIndex,
  }
);
