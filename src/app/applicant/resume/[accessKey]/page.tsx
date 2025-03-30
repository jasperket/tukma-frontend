"use client";

import { useEffect, useState } from "react";
import {
  checkResumeStatus,
  GetResumeData,
  getResumeData,
  GetSimilarityScore,
  getSimilarityScore,
} from "~/app/actions/resume";
import SkillsRadarChart from "../../components/SkillsRadarChart";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JobDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");
  const [resume, setResume] = useState<GetResumeData | null>(null);
  const [similarity, setSimilarity] = useState<GetSimilarityScore | null>(null);

  useEffect(() => {
    const hash = window.location.href.split("/").pop();

    async function checkStatus() {
      const response = await checkResumeStatus(hash!);

      if (response.success) {
        setStatus(response.data!);
        setLoading(false);
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

  function handleForward() {
    router.push(`/applicant/interview/${resume?.resume.job.accessKey}`);
  }

  return (
    <>
      <main className="mx-auto max-w-screen-lg px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {loading && <p>Loading...</p>}
          {!resume && status.length > 0 && <p>{status}</p>}

          {resume && (
            <>
              <SkillsRadarChart resumeData={resume} similarity={similarity!} />

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
                >
                  Interview
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
