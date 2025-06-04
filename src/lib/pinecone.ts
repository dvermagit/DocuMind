// import { PineconeClient } from "@pinecone-database/pinecone";
// import { downloadFromS3 } from "./s3-server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// let pinecone: PineconeClient | null = null;

// export const getPineconeClient = async () => {
//   if (!pinecone) {
//     pinecone = new PineconeClient();
//     await pinecone.init({
//       environment: process.env.PINECONE_ENVIRONMENT!,
//       apiKey: process.env.PINECONE_API_KEY!,
//     });
//   }
//   return pinecone;
// };

// export async function loadS3IntoPinecone(fileKey: string) {
//   // obtain the pdf -> download and read from pdf
//   console.log("downloading s3 into file system");
//   const file_name = await downloadFromS3(fileKey);
//   if (!file_name) {
//     throw new Error("could not download file from s3");
//   }
//   const loader = new PDFLoader(file_name);
//   console.log
// }

import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

// Initialize Pinecone client (no environment needed)
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!, // API key is sufficient
});

export const getPineconeClient = () => {
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> download and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download file from s3");
  }
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pages
  const docs = await Promise.all(pages.map((pages) => prepareDocuments));

  //vectorise and embedindividual documents
}

// 2.functions
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocuments(
  page: PDFPage,
  splitter: RecursiveCharacterTextSplitter
) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, " ");

  // Create a document with metadata
  const doc = new Document({
    pageContent,
    metadata: {
      pageNumber: metadata.loc.pageNumber,
      text: truncateStringByBytes(pageContent, 36000),
    },
  });

  // Split the document
  const docs = await splitter.splitDocuments([doc]);
  return docs;
}
