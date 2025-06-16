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

// import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
// // PineconeRecord is used instead of Vector
// import { downloadFromS3 } from "./s3-server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { Document } from "@langchain/core/documents";
// import { getEmbedding } from "./embeddings";
// import md5 from "md5";

// // Initialize Pinecone client (no environment needed)
// const pinecone = new Pinecone({
//   apiKey: process.env.PINECONE_API_KEY!, // API key is sufficient
// });

// export const getPineconeClient = () => {
//   return pinecone;
// };

// type PDFPage = {
//   pageContent: string;
//   metadata: {
//     loc: { pageNumber: number };
//   };
// };

// export async function loadS3IntoPinecone(fileKey: string) {
//   // 1. obtain the pdf -> download and read from pdf
//   console.log("downloading s3 into file system");
//   const file_name = await downloadFromS3(fileKey);
//   if (!file_name) {
//     throw new Error("could not download file from s3");
//   }
//   const loader = new PDFLoader(file_name);
//   const pages = (await loader.load()) as PDFPage[];

//   // 2. split and segment the pages
//   const documents = await Promise.all(pages.map((pages) => prepareDocuments));

//   // 3. vectorise and embedindividual documents
//   const vectors = await Promise.all(documents.flat().map(embedDocument));
//   // const vectors = await Promise.all(documents.flat().map((doc) => embedDocument(doc)));
// }

// // 3.function
// async function embedDocument(doc: Document): Promise<PineconeRecord> {
//   try {
//     const embeddings = await getEmbedding(doc.pageContent);
//     const hash = md5(doc.pageContent);

//     return {
//       id: hash,
//       values: embeddings,
//       metadata: {
//         text: doc.metadata.text,
//         pageNumber: doc.metadata.pageNumber,
//       },
//     };
//   } catch (error) {
//     console.error("Error embedding document:", error);
//     throw error;
//   }
// }

// // 2.functions
// export const truncateStringByBytes = (str: string, bytes: number) => {
//   const enc = new TextEncoder();
//   return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
// };

// async function prepareDocuments(
//   page: PDFPage,
//   splitter: RecursiveCharacterTextSplitter
// ) {
//   let { pageContent, metadata } = page;
//   pageContent = pageContent.replace(/\n/g, " ");

//   // Create a document with metadata
//   const doc = new Document({
//     pageContent,
//     metadata: {
//       pageNumber: metadata.loc.pageNumber,
//       text: truncateStringByBytes(pageContent, 36000),
//     },
//   });

//   // Split the document
//   const docs = await splitter.splitDocuments([doc]);
//   return docs;
// }

import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
// // PineconeRecord is used instead of Vector
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { getEmbedding } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
});

export const getPineconeClient = async () => {
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
  console.log("Downloading from S3...");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("Could not download file from S3");
  }

  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. Initialize text splitter with appropriate chunk size
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  // 3. Process and split documents
  const documents = await Promise.all(
    pages.map((page) => prepareDocument(page, splitter))
  );

  // console.log(documents);
  // console.log(documents.flat());
  // 4. vectorise and embedindividual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // // // 5. upload to pinecone
  // const client = getPineconeClient();
  // const pineconeIndex = pinecone.Index("process.env.PINECONE_INDEX_NAME!");
  // 5. Get Pinecone index
  const pineconeIndex = pinecone.index("documind-ai");

  // 6. Upsert vectors to Pinecone
  console.log("Inserting vectors into Pinecone...");
  const namespace = convertToAscii(fileKey);

  const chunks: PineconeRecord[] = vectors.map((vector) => ({
    ...vector,
    metadata: { namespace, text: documents.flat()[0].pageContent },
  }));

  console.log({ chunks, vectors });

  pineconeIndex.namespace("default").upsert(chunks);

  return documents[0];
}

// 3. functions
async function embedDocument(doc: Document): Promise<PineconeRecord> {
  try {
    const embeddings = await getEmbedding(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    };
  } catch (error) {
    console.error("Error embedding document:", error);
    throw error;
  }
}

// 2. functions
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(
  page: PDFPage,
  splitter: RecursiveCharacterTextSplitter
): Promise<Document[]> {
  const { pageContent: originalPageContent, metadata } = page;
  const modifiedPageContent = originalPageContent.replace(/\n/g, " ");

  const doc = new Document({
    pageContent: modifiedPageContent,
    metadata: {
      pageNumber: metadata.loc.pageNumber,
      text: truncateStringByBytes(modifiedPageContent, 36000),
    },
  });
  return splitter.splitDocuments([doc]);
}
