import React, { useState } from "react";
import useSWRMutation from "swr/mutation";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface ResumeUploadResponse {
  hash: string;
}

interface ResumeUploadError {
  error: string;
}

async function uploadResume(
  url: string,
  { arg }: { arg: FormData },
): Promise<ResumeUploadResponse> {
  const response = await fetch("https://ai.tukma.work/api/v1/resume-service", {
    method: "POST",
    body: arg,
    credentials: "include",
  });

  console.log("Response:", response);

  const data = (await response.json()) as
    | ResumeUploadResponse
    | ResumeUploadError;

  if (!response.ok) {
    throw new Error("error" in data ? data.error : "Failed to upload resume");
  }

  if (!("hash" in data)) {
    throw new Error("Invalid response format");
  }

  return data;
}

interface ResumeUploadProps {
  onUploadSuccess: (hash: string) => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const { trigger, isMutating } = useSWRMutation<
    ResumeUploadResponse,
    Error,
    string,
    FormData
  >("/api/resume", uploadResume);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.target);
    const file = formData.get("resume") as File | null;
    const keywords = formData.get("keywords") as string;

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported");
      return;
    }

    if (!keywords.trim()) {
      setError("Please enter at least one keyword");
      return;
    }

    // Split keywords and add them to FormData
    const keywordArray = keywords.split(", ").filter((k) => k.trim());
    keywordArray.forEach((keyword) => {
      console.log(keyword);
      formData.append("keyword", keyword.trim());
    });

    try {
      const result = await trigger(formData);
      onUploadSuccess(result.hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload resume");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-text-100">Resume Upload</CardTitle>
        <CardDescription className="text-text-400">
          Upload your resume to analyze your skills
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="keywords" className="text-text-200">
              Keywords
            </Label>
            <Input
              id="keywords"
              name="keywords"
              type="text"
              placeholder="java, python, javascript"
              className="border-background-800 bg-background-950 text-text-100 placeholder:text-text-400"
              disabled={isMutating}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="resume" className="text-text-200">
              Choose a file
            </Label>
            <Input
              id="resume"
              name="resume"
              type="file"
              className="cursor-pointer border-background-800 bg-background-950 text-text-100"
              accept=".pdf"
              disabled={isMutating}
            />
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="border-primary-300/20 bg-primary-300/10 text-primary-300"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-primary-300 text-background-950 hover:bg-primary-400"
            disabled={isMutating}
          >
            {isMutating ? (
              <div className="flex items-center gap-2">
                <span className="loader h-4 w-4"></span>
              </div>
            ) : (
              "Upload Resume"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
