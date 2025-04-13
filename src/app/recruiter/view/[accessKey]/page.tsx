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

// Format job type and shift type for display
const formatJobType = (type: string) => {
  if (!type) return "";

  return type
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatShiftType = (type: string) => {
  if (!type) return "";

  return type
    .split("_")
    .map((word) => word.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()))
    .join(" ");
};

// Format date for display
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

export default function JobDetailsPage() {
  const [jobData, setJobData] = useState<JobWithKeywords>();
  const [questions, setQuestions] = useState<Question[]>();
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

  const { job, keywords } = jobData;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="space-y-6">
          {/* Job header */}
          <div className="border-b border-[#e6e0cf] pb-4">
            <h1 className="mb-3 text-3xl font-bold text-[#3c3022]">
              {job.title}
            </h1>

            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="bg-[#e6e0cf] text-[#3c3022] hover:bg-[#d9d0b8]">
                {formatJobType(job.type)}
              </Badge>
              <Badge className="bg-[#e6e0cf] text-[#3c3022] hover:bg-[#d9d0b8]">
                {formatShiftType(job.shiftType)}
              </Badge>
            </div>

            <div className="flex items-start gap-2 text-[#3c3022]">
              <MapPin className="mt-0.5 h-5 w-5 text-[#8b6e4e]" />
              <span>{job.address}</span>
            </div>
          </div>

          {/* Job details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#3c3022]">
                Job Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#8b6e4e]" />
                  <span className="text-[#3c3022]">
                    <span className="font-medium">Shift Length:</span>{" "}
                    {job.shiftLengthHours} hours
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#8b6e4e]" />
                  <span className="text-[#3c3022]">
                    <span className="font-medium">Posted by:</span>{" "}
                    {job.owner.firstName} {job.owner.lastName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#8b6e4e]" />
                  <span className="text-[#3c3022]">
                    <span className="font-medium">Created:</span>{" "}
                    {formatDate(job.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#8b6e4e]" />
                  <span className="text-[#3c3022]">
                    <span className="font-medium">Updated:</span>{" "}
                    {formatDate(job.updatedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#8b6e4e]" />
                  <span className="text-[#3c3022]">
                    <span className="font-medium">Job ID:</span> {job.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#3c3022]">
                Access Information
              </h2>

              <div className="rounded-md bg-[#e6e0cf] p-4">
                <div className="mb-2 font-medium text-[#3c3022]">
                  Access Key:
                </div>
                <div className="break-all rounded bg-white p-3 font-mono text-sm">
                  {job.accessKey}
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium text-[#3c3022]">Keywords:</div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map(
                    (keyword: string, index: number) =>
                      keyword.length > 0 && (
                        <Badge
                          key={index}
                          className="bg-[#e6e0cf] text-[#3c3022] hover:bg-[#d9d0b8]"
                        >
                          {keyword}
                        </Badge>
                      ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job description */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[#3c3022]">
              Description
            </h2>
            <div className="rounded-md bg-[#e6e0cf] p-4">
              <div className="rounded-md bg-white p-4">
                <p className="whitespace-pre-line text-[#3c3022]">
                  {job.description}
                </p>
              </div>
            </div>
          </div>

          {/* Behavioral Questions */}
          {questions && questions.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-[#3c3022]">
                <MessageSquare className="h-5 w-5 text-[#8b6e4e]" />
                Behavioral Questions
              </h2>
              <div className="rounded-md bg-[#e6e0cf] p-4">
                <div className="space-y-3">
                  {questions
                    .filter((q) => q.type === "BEHAVIORAL")
                    .map((question, index) => (
                      <div
                        key={`behavioral-${index}`}
                        className="rounded-md bg-white p-3"
                      >
                        <p className="text-[#3c3022]">
                          {index + 1}. {question.questionText}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Technical Questions */}
          {questions && questions.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-[#3c3022]">
                <Code className="h-5 w-5 text-[#8b6e4e]" />
                Technical Questions
              </h2>
              <div className="rounded-md bg-[#e6e0cf] p-4">
                <div className="space-y-3">
                  {questions
                    .filter((q) => q.type === "TECHNICAL")
                    .map((question, index) => (
                      <div
                        key={`technical-${index}`}
                        className="rounded-md bg-white p-3"
                      >
                        <p className="text-[#3c3022]">
                          {index + 1}. {question.questionText}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 border-t border-[#e6e0cf] pt-4">
            <Link href="/recruiter" className="flex-1">
              <Button
                variant="outline"
                className="h-12 border-[#d9d0b8] bg-[#e6e0cf] px-6 py-2 text-[#3c3022] hover:bg-[#d9d0b8] hover:text-[#3c3022]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
              </Button>
            </Link>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="h-12 border-[#8b6e4e] bg-[#8b6e4e] px-6 py-2 text-white hover:bg-[#6d563d]"
                onClick={() => setState("view")}
              >
                View Applicants
              </Button>
              <Link
                href={`/recruiter/edit/${getAccessKey()}`}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="h-12 border-[#8b6e4e] bg-[#8b6e4e] px-6 py-2 text-white hover:bg-[#6d563d]"
                >
                  Edit Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
