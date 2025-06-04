// import { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
// import fs from "fs";

// export async function downloadFromS3(file_key: string, file_name: string) {
//   try {
//     const s3Client = new S3Client({
//       region: "eu-north-1", // Europe (Stockholm)
//       credentials: {
//         accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
//         secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
//       },
//     });
//     const params: PutObjectCommandInput = {
//       Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
//       Key: file_key,
//     };

//     const response = await s3Client.send(command);

//     const obj = await s3Client.getObject(params).promise();
//     const file_name = "/tmp/pdf-${Date.now()}.pdf";
//     fs.writeFileSync(file_name, obj.Body as Buffer);
//     return file_name;
//   } catch (error) {}
// }

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { WriteStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";

export async function downloadFromS3(
  file_key: string
): Promise<string | undefined> {
  try {
    const s3Client = new S3Client({
      region: "eu-north-1", // Europe (Stockholm)
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("Empty response body from S3");
    }

    // Create a temporary file path
    const file_name = `/tmp/pdf-${Date.now()}.pdf`;
    const fileStream = createWriteStream(file_name);

    // AWS SDK v3 returns a ReadableStream for the Body
    await pipeline(response.Body as NodeJS.ReadableStream, fileStream);

    return file_name;
  } catch (error) {
    console.error("Error downloading from S3:", error);
    return undefined;
  }
}
