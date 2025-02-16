"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

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
    color: "#684331",
  },
} satisfies ChartConfig;

export default function SkillsRadarChart() {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle className="text-xl text-text-100">Skills Analysis</CardTitle>
        <CardDescription className="text-text-400">
          Upload a resume to see the skill profile
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[350px] w-full"
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
    </Card>
  );
}
