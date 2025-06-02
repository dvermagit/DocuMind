// old verison
// import AWS from "aws-sdk";
// export async function uploadToS3(file: File) {
//   try {
//     AWS.config.update({
//       accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
//       secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
//     });
//     const s3 = new AWS.S3({
//       params: {
//         Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
//       },
//       region: "Europe (Stockholm) eu-north-1",
//     });

//     const file_key =
//       "uploads/" + Date.now().toString() + file.name.replace("", "-");

//     const params = {
//       Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
//       Key: file_key,
//       Body: file,
//     };

//     const upload = s3
//       .putObject(params)
//       .on("httpUploadProgress", (evt) => {
//         console.log(
//           "uploading to s3...",
//           parseInt(((evt.loaded * 100) / evt.total).toString())
//         ) + "%";
//       })
//       .promise();

//     await upload.then((data) => {
//       console.log("successfully uploaded to S3!", file_key);
//     });

//     return Promise.resolve({
//       file_key,
//       file_name: file.name,
//     });
//   } catch (error) {}
// }

// export function getS3Url(file_key: string) {
//   return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${file_key}`;
// }
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export async function uploadToS3(file: File) {
  try {
    const s3Client = new S3Client({
      region: "eu-north-1", // Europe (Stockholm)
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });

    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

    const params: PutObjectCommandInput = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    };

    // For progress tracking (using @aws-sdk/lib-storage)
    const upload = new Upload({
      client: s3Client,
      params,
    });

    upload.on("httpUploadProgress", (progress) => {
      if (progress.loaded && progress.total) {
        const percentage = Math.round((progress.loaded * 100) / progress.total);
        console.log(`Uploading to S3... ${percentage}%`);
      }
    });

    await upload.done();
    console.log("Successfully uploaded to S3!", file_key);

    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

export function getS3Url(file_key: string) {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${file_key}`;
}
