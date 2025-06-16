"use client";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { uploadToS3 } from "@/lib/s3";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate, status } = useMutation({
    mutationFn: async ([file_key, file_name]: [
      file_key: string,
      file_name: string
    ]) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        //bigger than 10MB
        toast.error("File size should be less than 10MB");
        alert("File size should be less than 10MB");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data.file_key || !data.file_name) {
          toast.error("Error uploading file to S3");
          return;
        }
        mutate([data.file_key, data.file_name], {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created successfully");
            router.push(`/chat/${chat_id}`);
            // toast.success(data.message);
          },
          onError: (error) => {
            toast.error("Error creating chat");
            console.log(error);
          },
        });
        console.log(data);
      } catch (error) {
        console.log(error);
        toast.error("Error creating chat");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer py-8 flex items-center justify-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || status === "pending" ? (
          <>
            {/* Loading state */}
            <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-gray-500 ">Spelling tea to AI...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-gray-500 ">Drop PDF here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
