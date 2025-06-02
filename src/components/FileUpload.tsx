"use client";
import { useMutation } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { uploadToS3 } from "@/lib/s3";

const FileUpload = () => {
  const { mutate } = useMutation({
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
        alert("File size should be less than 10MB");
        return;
      }

      try {
        const data = await uploadToS3(file);
        console.log(data);
      } catch (error) {
        console.log(error);
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
        <>
          <Inbox className="w-10 h-10 text-blue-500" />
          <p className="mt-2 text-sm text-gray-500 ">Drop PDF here</p>
        </>
      </div>
    </div>
  );
};

export default FileUpload;
