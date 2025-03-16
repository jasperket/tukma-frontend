"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, FileText, Check, X, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { GetMyApplicationForJob } from "~/app/actions/resume";

interface PDFUploadProps {
  label?: string;
  description?: string;
  maxSizeMB?: number;
  isUploaded?: boolean;
  file: File | null | undefined;
  application: GetMyApplicationForJob | null;
  loading: boolean;
  setFile: (file: File | null) => void;
  onFileUpload?: (file: File) => void;
  setIsUploaded: (uploaded: boolean) => void;
}

export default function PDFUpload({
  label = "Upload Resume",
  description = "Please upload your resume in PDF format",
  maxSizeMB = 5,
  isUploaded,
  file,
  application,
  loading,
  setFile,
  onFileUpload,
  setIsUploaded,
}: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile?: File) => {
    setError(null);

    if (!selectedFile) {
      return;
    }

    // Check file type
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are accepted");
      return;
    }

    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    simulateUpload(selectedFile);
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setIsUploaded(false);

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setIsUploaded(true);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }, 1500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setIsUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-semibold text-[#4A3C2B]">
        Upload Documents
      </h2>

      <div className="rounded-md bg-[#f5f2ea] p-6">
        <div
          className={cn(
            "rounded-md border-2 border-dashed p-6 transition-colors",
            isDragging ? "border-[#8B6E4E] bg-[#ece7dc]" : "border-[#d1c7b7]",
            isUploaded ? "bg-[#ece7dc]" : "",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Upload className="mb-4 h-12 w-12 text-[#8B6E4E]" />
              <h3 className="mb-2 text-lg font-medium text-[#4A3C2B]">
                {label}
              </h3>
              <p className="mb-4 text-center text-[#6b5d4c]">{description}</p>
              <p className="mb-4 text-sm text-[#8B6E4E]">
                Drag and drop your file here, or click to browse
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#8B6E4E] text-white hover:bg-[#6b5d4c]"
                disabled={loading ? true : application !== null ? true : false}
              >
                {application !== null ? "You have already uploaded" : "Browse Files"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-md bg-[#e6dfd3]">
                  <FileText className="h-6 w-6 text-[#8B6E4E]" />
                </div>
                <div>
                  <p className="font-medium text-[#4A3C2B]">{file.name}</p>
                  <p className="text-sm text-[#6b5d4c]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {isUploading && (
                  <div className="mr-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8B6E4E] border-t-transparent"></div>
                  </div>
                )}
                {isUploaded && (
                  <div className="mr-4 flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="text-[#8B6E4E] hover:bg-[#e6dfd3] hover:text-[#6b5d4c]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-2 flex items-center text-red-600">
            <AlertCircle className="mr-2 h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm text-[#6b5d4c]">
            <span className="font-medium">Accepted file types:</span> PDF only
          </p>
          <p className="text-sm text-[#6b5d4c]">
            <span className="font-medium">Maximum file size:</span> {maxSizeMB}
            MB
          </p>
        </div>
      </div>
    </div>
  );
}
