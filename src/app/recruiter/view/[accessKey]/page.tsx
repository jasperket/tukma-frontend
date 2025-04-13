"use client";

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  User,
  MessageSquare,
  Code,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import {
  getJobDetails,
  getJobQuestions,
  JobWithKeywords,
  Question,
} from "~/app/actions/recruiter";
import { useEffect, useState } from "react";
import JobDetail from "./components/JobDetails";
import { useJobStore } from "~/app/stores/useJobStore";

export default function JobDetailsPage() {
  const [jobData, setJobData] = useState<JobWithKeywords>();
  const [questions, setQuestions] = useState<Question[]>();
  const setJobInfoData = useJobStore((state) => state.setJobInfoData);
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
        const [jobRes, questionsRes] = await Promise.all([
          getJobDetails(getAccessKey()),
          getJobQuestions(getAccessKey()),
        ]);

        if (!jobRes.success || !questionsRes.success) {
          setError("Failed to load job details");
          return;
        }

        setJobData(jobRes.job);
        setQuestions(questionsRes.data);
        setJobInfoData(jobRes.job!);
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
    <JobDetail
      jobData={jobData}
      questions={questions!}
      setState={setState}
      getAccessKey={getAccessKey}
    />
  );
}
