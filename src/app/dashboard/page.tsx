import React from "react";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { LogOutButton } from "./components/LogOutButton";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import MicButton from "./components/MicButton";
import SkillsRadarChart from "./components/SkillsRadarChart";

export default function DashboardPage() {
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
            <Card>
              <CardHeader>
                <CardTitle>Resume Upload</CardTitle>
                <CardDescription>
                  Upload your resume to analyze your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="resume">Choose a file</Label>
                  <Input
                    id="resume"
                    type="file"
                    className="cursor-pointer"
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills Analysis Card */}
            <SkillsRadarChart />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Interview Transcript Card */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Transcript</CardTitle>
                <CardDescription>
                  Real-time transcription of your interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-input h-[400px] rounded-lg border bg-background-950 p-4">
                  <p className="text-muted-foreground text-sm">
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
