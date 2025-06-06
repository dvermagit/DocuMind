import React from "react";

interface PDFViewerProps {
  pdf_url: string;
}
const PDFViewer = ({ pdf_url }: PDFViewerProps) => {
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
      className="w-full h-full"
    ></iframe>
  );
};

export default PDFViewer;
