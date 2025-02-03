"use client";

import Image from "next/image";
import logo from "../../../public/logo.png";
import { LogOutButton } from "./components/LogOutButton";
import Button from "./components/Button";
import { UploadIcon } from "lucide-react";
import { Card } from "~/components/ui/card";
import { useMicVAD } from "@ricky0123/vad-react";
import { uploadAudio } from "../actions/applicant";

export default function DashboardPage() {
  const vad = useMicVAD({
    onSpeechEnd: (audio) => {
      uploadAudio(audio);
      console.log("User stopped talking");
    },
  });

  return (
    <>
      <div className="bg-primary-300 pt-1"></div>
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between pt-8">
          <Image src={logo} alt="Tukma Logo" className="h-12 w-auto" />
          <div>
            <LogOutButton />
          </div>
        </header>
        <main className="space-y-6 p-4">
          <Card>
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Upload Resume
              </h3>
            </div>
            <div className="p-6 pt-0">
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8">
                <UploadIcon className="h-8 w-8 opacity-75" />
                <Button>Select PDF File</Button>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                AI Interview
              </h3>
            </div>
            <div className="p-6 pt-0">
              <div className="flex h-40 flex-col items-center justify-center rounded-lg bg-background-900">
                <div className="relative h-8 w-8">
                  {/* <div className="relative"> */}
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75"></div>
                  <div className="absolute inset-0 rounded-full bg-red-500"></div>
                  {/* <div id="wave">
                    <div className="wave0"></div>
                    <div className="wave1"></div>
                    <div className="wave2"></div>
                    <div className="wave3"></div>
                    <div className="wave4"></div>
                    <div className="wave5"></div>
                    <div className="wave6"></div>
                  </div> */}
                </div>
                <p className="pt-4 text-sm text-text-300">
                  Recording your response...
                </p>
                <p className="pt-4 text-sm text-text-300">
                  {vad.userSpeaking && "User is speaking"}
                </p>
                {/* <p className="pt-4 text-sm text-text-300">AI is speaking...</p> */}
              </div>
            </div>
          </Card>
        </main>
      </div>
    </>
  );
}
