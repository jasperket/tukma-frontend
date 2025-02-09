"use client";

import React from "react";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { LogOutButton } from "./components/LogOutButton";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Mic, MicOff } from "lucide-react";
import { useMicVAD } from "@ricky0123/vad-react";
import { uploadAudio } from "../actions/applicant";
import { cn } from "~/lib/utils";

// Empty data for the radar chart
const skillsData = [
  { skill: "Technical Skills", value: 0 },
  { skill: "Communication", value: 0 },
  { skill: "Leadership", value: 0 },
  { skill: "Problem Solving", value: 0 },
  { skill: "Teamwork", value: 0 },
  { skill: "Project Management", value: 0 },
];

const chartConfig = {
  value: {
    label: "Skill Level",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const vad = useMicVAD({
    startOnLoad: false,
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
            <Card>
              <CardHeader className="items-center">
                <CardTitle>Skills Analysis</CardTitle>
                <CardDescription>
                  Upload your resume to see your skills profile
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[350px]"
                >
                  <RadarChart data={skillsData}>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent nameKey="skill" />}
                    />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarGrid />
                    <Radar
                      dataKey="value"
                      fill="var(--color-value)"
                      fillOpacity={0.6}
                      dot={{
                        r: 4,
                        fillOpacity: 1,
                      }}
                    />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-muted-foreground flex items-center justify-center text-sm">
                No resume analyzed yet
              </CardFooter>
            </Card>
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
                  <Button
                    size="lg"
                    variant={vad.listening ? "destructive" : "default"}
                    className={cn(
                      "h-16 w-16 rounded-full p-0",
                      !vad.listening && "bg-primary-400 hover:bg-primary-500",
                    )}
                    onClick={() => vad.toggle()}
                  >
                    {vad.listening ? (
                      <Mic className="h-6 w-6" />
                    ) : (
                      <MicOff className="h-6 w-6" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
