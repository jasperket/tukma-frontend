"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Code,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import {
  getCommunicationResults,
  getTechnicalResults,
  type CommunicationResultsResponse,
  type TechnicalResultsResponse,
  type TechnicalResult,
} from "~/app/actions/interview";

export default function InterviewResultsPage() {
  const [accessKey, setAccessKey] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("communication");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [commResults, setCommResults] = useState<
    CommunicationResultsResponse | undefined
  >(undefined);
  const [techResults, setTechResults] = useState<
    TechnicalResultsResponse | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract the access key from the URL
    const key = window.location.pathname.split("/")[3];

    async function fetchResults() {
      setIsLoading(true);
      setError(null);

      if (!key) {
        setError("No access key found. Please try again or contact support.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch both results in parallel
        const [commResponse, techResponse] = await Promise.all([
          getCommunicationResults(key),
          getTechnicalResults(key),
        ]);

        if (commResponse.success) {
          setCommResults(commResponse.data);
        } else {
          console.error(
            "Failed to fetch communication results:",
            commResponse.error,
          );
        }
        if (techResponse.success) {
          setTechResults(techResponse.data);
        } else {
          console.error(
            "Failed to fetch technical results:",
            techResponse.error,
          );
        }

        // Show error if both failed
        if (!commResponse.success && !techResponse.success) {
          setError("Failed to load interview results. Please try again later.");
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, []);

  // Format date string to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Convert score to percentage
  const toPercentage = (score: number) => {
    return Math.round(score * 10); // Scores are out of 10
  };

  // Get color class based on score (red for low, yellow for medium, green for high)
  const getScoreColorClass = (score: number) => {
    const percentage = toPercentage(score);
    if (percentage < 60) return "text-red-600 bg-red-100";
    if (percentage < 80) return "text-amber-600 bg-amber-100";
    return "text-green-600 bg-green-100";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8b6e4e] border-t-transparent"></div>
          <span className="ml-3 text-lg text-[#3c3022]">
            Loading your results...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-red-700">{error}</h2>
          <p className="mb-4 text-red-600">
            We couldn&apos;t load your interview results. This might be because
            the interview is not yet complete or there was an error processing
            your results.
          </p>
          <Link href={`/applicant/view/${accessKey}`}>
            <Button variant="ghost" className="mx-auto">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const noResultsAvailable = !commResults && !techResults;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/applicant/view/${accessKey}`}>
          <Button
            variant={"ghost"}
            className="ml-[-1rem] text-[#3c3022] hover:bg-[#e6e0cf]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Details
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3c3022]">Interview Results</h1>
        <p className="mt-2 text-[#6b5d4c]">
          Review your interview performance and feedback from our AI evaluation
          system.
        </p>
      </div>

      {noResultsAvailable ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h2 className="mb-2 text-xl font-semibold text-amber-700">
            No Results Available Yet
          </h2>
          <p className="mb-4 text-amber-600">
            Your interview results are not available yet. This might be because
            the interview is not yet complete or your responses are still being
            evaluated.
          </p>
          <p className="text-amber-600">
            Please check back later or contact support if you believe this is an
            error.
          </p>
        </div>
      ) : (
        <Tabs
          defaultValue={activeTab}
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="mb-6 grid w-full grid-cols-2 bg-[#f5f2ea]">
            <TabsTrigger
              value="communication"
              disabled={!commResults}
              className="data-[state=active]:bg-[#8b6e4e] data-[state=active]:text-white"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Communication Skills
            </TabsTrigger>
            <TabsTrigger
              value="technical"
              disabled={!techResults}
              className="data-[state=active]:bg-[#8b6e4e] data-[state=active]:text-white"
            >
              <Code className="mr-2 h-4 w-4" />
              Technical Skills
            </TabsTrigger>
          </TabsList>

          {/* Communication Results Tab */}
          <TabsContent value="communication">
            {commResults && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-[#3c3022]">
                        Communication Assessment
                      </CardTitle>
                      <div
                        className={`rounded-full px-4 py-1 font-bold ${getScoreColorClass(commResults.overallScore)}`}
                      >
                        {toPercentage(commResults.overallScore)}%
                      </div>
                    </div>
                    <CardDescription>
                      Evaluated on {formatDate(commResults.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 rounded-lg bg-[#f8f7f4] p-5">
                      <h3 className="mb-3 flex items-center text-lg font-medium text-[#3c3022]">
                        <Activity className="mr-2 h-5 w-5 text-[#8b6e4e]" />
                        Overall Score: {commResults.overallScore.toFixed(2)}/10.00
                      </h3>
                      <div className="h-4 w-full overflow-hidden rounded-full bg-[#e6e0cf]">
                        <div
                          className="h-full bg-[#8b6e4e]"
                          style={{
                            width: `${toPercentage(commResults.overallScore)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-lg border border-[#e6e0cf] p-5">
                        <h3 className="mb-3 text-lg font-medium text-[#3c3022]">
                          Strengths
                        </h3>
                        <ul className="list-disc pl-5 text-[#6b5d4c]">
                          {commResults.strengths
                            .split(".. ")
                            .map((strength, index) => (
                              <li key={index}>{strength.replace(/\./g, "")}</li>
                            ))}
                        </ul>
                      </div>

                      <div className="rounded-lg border border-[#e6e0cf] p-5">
                        <h3 className="mb-3 text-lg font-medium text-[#3c3022]">
                          Areas for Improvement
                        </h3>
                        <ul className="list-disc pl-5 text-[#6b5d4c]">
                          {commResults.areasForImprovement
                            .split(".. ")
                            .map((area, index) => (
                              <li key={index}>{area.replace(/\./g, "")}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Technical Results Tab */}
          <TabsContent value="technical">
            {techResults && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-[#3c3022]">
                        Technical Assessment
                      </CardTitle>
                      <div
                        className={`rounded-full px-4 py-1 font-bold ${getScoreColorClass(techResults.overallScore)}`}
                      >
                        {toPercentage(techResults.overallScore)}%
                      </div>
                    </div>
                    <CardDescription>
                      {techResults.technicalResults.length} technical questions
                      evaluated
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 rounded-lg bg-[#f8f7f4] p-5">
                      <h3 className="mb-3 flex items-center text-lg font-medium text-[#3c3022]">
                        <Activity className="mr-2 h-5 w-5 text-[#8b6e4e]" />
                        Overall Score: {techResults.overallScore.toFixed(2)}/10.00
                      </h3>
                      <div className="h-4 w-full overflow-hidden rounded-full bg-[#e6e0cf]">
                        <div
                          className="h-full bg-[#8b6e4e]"
                          style={{ width: `${techResults.overallScore * 10}%` }}
                        ></div>
                      </div>
                    </div>

                    {techResults.technicalResults.length > 0 ? (
                      <div className="space-y-6">
                        {techResults.technicalResults.map(
                          (result: TechnicalResult, index: number) => (
                            <div
                              key={result.id}
                              className="rounded-lg border border-[#e6e0cf] p-5"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-[#3c3022]">
                                  Question {index + 1}
                                </h3>
                                <div
                                  className={`rounded-full px-3 py-1 text-sm font-medium ${getScoreColorClass(result.score)}`}
                                >
                                  Score: {result.score.toFixed(2)}/10.00
                                </div>
                              </div>
                              <div className="mb-4 rounded-lg bg-[#f5f2ea] p-4">
                                <p className="font-medium text-[#3c3022]">
                                  {result.questionText}
                                </p>
                              </div>
                              <div className="mb-4">
                                <h4 className="mb-2 font-medium text-[#3c3022]">
                                  Your Answer:
                                </h4>
                                <p className="rounded-lg bg-white p-3 text-[#6b5d4c]">
                                  {result.answerText}
                                </p>
                              </div>
                              <div className="mb-4">
                                <h4 className="mb-2 font-medium text-[#3c3022]">
                                  Feedback:
                                </h4>
                                <p className="rounded-lg bg-[#e6e0cf] p-3 text-[#6b5d4c]">
                                  {result.feedback}
                                </p>
                              </div>
                              {result.errors && (
                                <div>
                                  <h4 className="mb-2 font-medium text-[#3c3022]">
                                    Areas to Improve:
                                  </h4>
                                  <p className="rounded-lg bg-[#f8e7e7] p-3 text-[#9b4d4d]">
                                    {result.errors}
                                  </p>
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-[#e6e0cf] p-5 text-center">
                        <p className="text-[#6b5d4c]">
                          No technical questions were evaluated.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
