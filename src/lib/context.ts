import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbedding } from "./embeddings";
import { convertToAscii } from "./utils";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  const pinecone = new Pinecone({
    apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
  });

  const index = await pinecone.index("documind-ai");

  try {
    const namespaceValue = convertToAscii(fileKey);
    // const queryResult = await index.query({
    //   topK: 5,
    //   vector: embeddings,  // Correct property name
    //   includeMetadata: true,
    //   namespace
    // });
    // return queryResult.matches || [];
    // const namespace = convertToAscii(fileKey);
    const queryResult = await index.namespace("default").query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbedding(query);
  console.log({ queryEmbeddings });
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (matches) => matches.score && matches.score > 0.5
  );

  console.log({ qualifyingDocs });
  type Metadata = {
    text: string;
    pageNumber: number;
  };

  const docs = qualifyingDocs.map((match) => {
    console.log(match.metadata);
    return (match.metadata as Metadata).text;
  });

  console.log({ docs });
  return docs.join("\n").substring(0, 3000);
}
