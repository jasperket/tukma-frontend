"use client";

import React, { useState } from "react";
import Image from "next/image";
import logo from "../../../../public/logo.png";
import { LogOutButton } from "./LogOutButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import MicButton from "./MicButton";
import SkillsRadarChart from "./SkillsRadarChart";
import ResumeUpload from "./ResumeUpload";

export default function ApplicantPage() {
  const [resumeHash, setResumeHash] = useState<string | null>(null);

  const handleUploadSuccess = (hash: string) => {
    setResumeHash(hash);
    console.log("Resume uploaded successfully, hash:", hash);
  };

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

        <main className="grid grid-cols-2 gap-6 p-4">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Resume Upload Card */}
            <ResumeUpload onUploadSuccess={handleUploadSuccess} />

            {/* Skills Analysis Card */}
            <SkillsRadarChart />
          </div>

          {/* Right Column */}
          <div className="flex items-center space-y-6">
            {/* Interview Transcript Card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl text-text-100">
                  Interview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-lg border border-background-800 bg-background-950 p-4">
                  <p className="text-sm text-text-400">
                    Start the interview to see the transcript
                  </p>
                </div>
                <div className="flex items-center justify-center pt-4">
                  <MicButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
