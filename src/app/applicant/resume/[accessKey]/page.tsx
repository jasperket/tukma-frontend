"use client";

import { useEffect, useState } from "react";
import {
  checkResumeStatus,
  GetResumeData,
  getResumeData,
  GetSimilarityScore,
  getSimilarityScore,
} from "~/app/actions/resume";
import { checkSurveyCompletion } from "~/app/actions/survey";
import SkillsRadarChart from "../../components/SkillsRadarChart";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JobDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");
  const [resume, setResume] = useState<GetResumeData | null>(null);
  const [similarity, setSimilarity] = useState<GetSimilarityScore | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  useEffect(() => {
    const hash = window.location.href.split("/").pop();

    async function checkStatus() {
      const response = await checkResumeStatus(hash!);

      if (response.success) {
        setStatus(response.data!);
        setLoading(false);
      }

      if (response.data == "Item exists, result processing.") {
        setStatus(
          "The resume is currently being analyzed. Please return in 5 hours, as this will take some time.",
        );
      }

      if (response.data == "Item exists, result ready.") {
        setStatus("Fetching resume analysis result. Please wait");
      } else {
        return;
      }

      const similarity = await getSimilarityScore(hash!);
      const resumeData = await getResumeData(hash!);
      setResume(resumeData.data!);
      setSimilarity(similarity.data!);
    }

    checkStatus();
  }, []);

  function handleBackward() {
    router.back();
  }

  async function handleForward() {
    // Set loading state
    setIsNavigating(true);

    try {
      // Check if the user has completed the system usability survey
      const surveyStatus = await checkSurveyCompletion();

      if (surveyStatus.success && surveyStatus.data?.isComplete) {
        // User has completed the survey, direct to results
        router.push(
          `/applicant/interview/${resume?.resume.job.accessKey}/results`,
        );
      }

      // User has not completed the survey, direct to interview
      router.push(`/applicant/interview/${resume?.resume.job.accessKey}`);
    } catch (error) {
      console.error("Error checking survey completion:", error);
      // If there's an error, default to the interview path
      router.push(`/applicant/interview/${resume?.resume.job.accessKey}`);
    } finally {
      // Reset loading state - though this might not execute due to navigation
      setIsNavigating(false);
    }
  }

  return (
    <>
      <main className="mx-auto max-w-screen-lg px-4 py-8">
        <div className="mb-6">
          <Link href="/applicant">
            <Button
              variant="ghost"
              className="ml-[-1rem] text-[#3c3022] hover:bg-[#e6e0cf]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Job Postings
            </Button>
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          {loading && <p>Loading...</p>}
          {!resume && status.length > 0 && (
            <div>
              <p>{status}</p>
            </div>
          )}

          {resume && (
            <>
              <SkillsRadarChart resumeData={resume} />

              <div className="flex gap-4 border-t border-[#e6e0cf] pt-4">
                <Button
                  variant="outline"
                  className="w-full flex-1 border-[#d9d0b8] bg-[#e6e0cf] text-[#3c3022] hover:bg-[#d9d0b8] hover:text-[#3c3022]"
                  onClick={() => handleBackward()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> View Job
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 border-[#8b6e4e] bg-[#8b6e4e] text-white hover:bg-[#6d563d]"
                  onClick={() => handleForward()}
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Loading...
                    </>
                  ) : (
                    "Interview"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
