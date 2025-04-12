"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
  Legend,
} from "recharts";
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
import {
  GetResumeData,
  GetSimilarityScore,
  ParsedResults,
} from "~/app/actions/resume";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";

// Empty data for the radar chart
const skillsData = [
  { skill: "Technical Skills", value: 100 },
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

interface SkillsRadarChartProps {
  resumeData: GetResumeData;
  similarity: GetSimilarityScore;
}

interface TransformedResult {
  skill_name: string;
  similarity_score: number;
  ngram: string;
}

const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({
  resumeData,
  similarity,
}) => {
  const [result, setResult] = useState<TransformedResult[]>(
    transformParsedResults(resumeData.parsedResults),
  );

  function transformParsedResults(data: ParsedResults) {
    return Object.keys(data)
      .map((skill_name) => {
        // Remove unwanted characters ([, ], ") from the skill_name
        const cleanedSkillName = skill_name.replace(/[\[\]"]/g, "");
        return {
          skill_name: cleanedSkillName,
          similarity_score: data[skill_name]!.similarity_score,
          ngram: data[skill_name]!.best_matching_ngram,
        };
      })
      .sort((a, b) => b.similarity_score - a.similarity_score); // Sort by similarity_score in descending order
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Resume Analysis Result</h1>

      <div className="mb-4 text-center">
        <h3 className="mb-2 text-xl font-medium text-[#4a3f35]">
          Skills Analysis
        </h3>
        <p className="text-[#8b5d3b]">
          Resume analyzed against job requirements
        </p>
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-square max-h-[350px] w-full"
      >
        <RadarChart data={result}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent nameKey="skill_name" />}
          />
          <PolarAngleAxis dataKey="skill_name" />
          <PolarGrid />
          <Radar
            dataKey="similarity_score"
            fill="var(--color-value)"
            fillOpacity={0.6}
            dot={{
              r: 4,
              fillOpacity: 1,
            }}
          />
        </RadarChart>
      </ChartContainer>

      <div className="mt-8 space-y-4 mb-4">
        {result.map(({ skill_name, similarity_score, ngram }, index) => {
          const scorePercentage = Math.round(similarity_score * 100);
          return (
            <div
              key={skill_name}
              className="flex items-center justify-between rounded-md bg-[#f8f6f1] p-3"
            >
              <div>
                <span className="font-medium capitalize">{skill_name}</span>
              </div>
              <Badge className="bg-[#e9e5d9] text-[#4a3f35] hover:bg-[#e0dbd0]">
                {scorePercentage}% match
              </Badge>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SkillsRadarChart;
