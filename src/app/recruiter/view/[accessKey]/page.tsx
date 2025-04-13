"use client";

import {
  getJobDetails,
  getJobQuestions,
  JobWithKeywords,
  Question,
} from "~/app/actions/recruiter";
import { useEffect, useState } from "react";
import JobDetail from "./components/JobDetails";
import { useJobStore } from "~/app/stores/useJobStore";
import ViewApplicants from "./components/ApplicantView";
import { GetApplicants, getInterviewApplicants } from "~/app/actions/interview";
import { GetAllResumeData, getResumeByJob, GetResumeData } from "~/app/actions/resume";

export default function JobDetailsPage() {
  const setJobInfoData = useJobStore((state) => state.setJobInfoData);
  const [jobData, setJobData] = useState<JobWithKeywords>();
  const [questions, setQuestions] = useState<Question[]>();
  const [applicants, setApplicants] = useState<GetApplicants>();
  const [resume, setResume] = useState<GetAllResumeData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [state, setState] = useState<string>("");
  const [error, setError] = useState<string>("");

  function getAccessKey() {
    return window.location.href.split("/").pop()!;
  }

  useEffect(() => {
    // Function to fetch job details and questions concurrently
    const fetchData = async () => {
      try {
        const [jobRes, questionsRes, applicantsRes, resumeRes] = await Promise.all([
          getJobDetails(getAccessKey()),
          getJobQuestions(getAccessKey()),
          getInterviewApplicants(getAccessKey()),
          getResumeByJob(getAccessKey()),
        ]);

        if (
          !jobRes.success ||
          !questionsRes.success ||
          !applicantsRes.success ||
          !resumeRes.success 
        ) {
          setError("Failed to load job details");
          return;
        }

        setJobData(jobRes.job);
        setQuestions(questionsRes.data);
        setJobInfoData(jobRes.job!);
        setApplicants(applicantsRes.data);
        setResume(resumeRes.data);
      } catch (err) {
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-center text-lg">Loading...</p>
        </div>
      </main>
    );
  }

  if (error || !jobData) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-center text-lg text-red-500">
            {error || "Failed to load job details"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {state === "" && (
        <JobDetail
          jobData={jobData}
          questions={questions!}
          setState={setState}
          getAccessKey={getAccessKey}
        />
      )}
      {state === "list" && (
        <ViewApplicants applicants={applicants!} setState={setState} />
      )}
    </main>
  );
}
