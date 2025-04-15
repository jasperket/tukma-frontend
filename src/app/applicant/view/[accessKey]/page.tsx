"use client";

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useJobStore } from "~/app/stores/useJobStore";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getJobDetails, JobWithKeywords } from "~/app/actions/recruiter";
import PDFUpload from "../../components/PDFUpload";
import {
  getJobApplication,
  GetMyApplicationForJob,
  uploadForJob,
} from "~/app/actions/resume";
import { interviewStatus } from "~/app/actions/interview";
import { checkSurveyCompletion } from "~/app/actions/survey";

// Format job type and shift type for display
const formatJobType = (type: string) => {
  // Add null/undefined check
  if (!type) return "";

  return type
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatShiftType = (type: string) => {
  // Add null/undefined check
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
  const router = useRouter();
  const jobData = useJobStore((state) => state.jobData);
  const setJobInfoData = useJobStore((state) => state.setJobInfoData);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploaded, setIsUploaded] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>();
  const [application, setApplication] = useState<GetMyApplicationForJob | null>(
    null,
  );
  const [hasInterview, setHasInterview] = useState<boolean>(false);
  const [surveyCompleted, setSurveyCompleted] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      const accessKey = window.location.href.split("/").pop();

      const response = await getJobDetails(accessKey!);
      if (response.success) {
        setJobInfoData(response.job!);
      }

      const applicationData = await getJobApplication(accessKey!);
      if (applicationData.success) {
        setApplication(applicationData.data!);

        // Check if user has already completed an interview
        if (applicationData.data) {
          try {
            // Log the application data structure
            console.log("Application data:", applicationData.data);

            // Get user details
            // The owner can be accessed either from the resume or directly depending on the API response
            const owner = applicationData.data.resume.owner;
            const name = owner.firstName + " " + owner.lastName;
            const email = owner.username; // Assuming username is email

            const interviewStatusData = await interviewStatus(
              accessKey!,
              name,
              email,
            );
            console.log("Interview status:", interviewStatusData?.data?.status);
            if (
              interviewStatusData.success &&
              (interviewStatusData?.data?.status === "finished" ||
                interviewStatusData?.data?.status === "COMPLETED")
            ) {
              setHasInterview(true);

              // If interview is completed, check if survey is completed
              const surveyStatus = await checkSurveyCompletion();
              console.log("Survey status:", surveyStatus);
              if (surveyStatus.success && surveyStatus?.data?.isComplete) {
                setSurveyCompleted(true);
              }
            }
          } catch (error) {
            console.error("Error checking interview status:", error);
          }
        }
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  async function uploadFile() {
    setUploading(true);

    if (application !== null) {
      setUploading(false);
      if (hasInterview) {
        if (surveyCompleted) {
          // If has application, completed interview, and completed survey
          router.push(`/applicant/interview/${jobData?.job.accessKey}/results`);
        } else {
          // If has application, completed interview, but no survey
          router.push(`/applicant/interview/${jobData?.job.accessKey}`);
        }
      } else {
        // If has application but no interview yet
        router.push(`/applicant/interview/${jobData?.job.accessKey}`);
      }
      return;
    }

    if (!file) {
      setUploading(false);
      console.error("No file selected.");
      return; // Exit early if no file is selected
    }

    if (!jobData?.keywords || !Array.isArray(jobData.keywords)) {
      setUploading(false);
      console.error("Invalid or missing keywords.");
      return; // Exit early if keywords are invalid or missing
    }

    if (!jobData?.job?.accessKey) {
      setUploading(false);
      console.error("Invalid or missing access key.");
      return; // Exit early if access key is invalid or missing
    }

    const response = await uploadForJob(file, jobData?.job.accessKey);

    if (response.success) {
      console.log("Resume uploaded successfully. Hash:", response.hash);
      // After successful upload, redirect to interview page instead of resume view
      router.push(`/applicant/interview/${jobData?.job.accessKey}`);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        {jobData === null && !loading && <p>Invalid access key</p>}
        {loading && jobData === null && <p>Loading...</p>}
        {jobData !== null && (
          <div className="space-y-6">
            {/* Job header */}
            <div className="border-b border-[#e6e0cf] pb-4">
              <h1 className="mb-3 text-3xl font-bold text-[#3c3022]">
                {jobData.job.title}
              </h1>

              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-[#e6e0cf] text-[#3c3022] hover:bg-[#d9d0b8]">
                  {formatJobType(jobData.job.type)}
                </Badge>
                <Badge className="bg-[#e6e0cf] text-[#3c3022] hover:bg-[#d9d0b8]">
                  {formatShiftType(jobData.job.shiftType)}
                </Badge>
              </div>

              <div className="flex items-start gap-2 text-[#3c3022]">
                <MapPin className="mt-0.5 h-5 w-5 text-[#8b6e4e]" />
                <span>{jobData.job.address}</span>
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
                      {jobData.job.shiftLengthHours} hours
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#8b6e4e]" />
                    <span className="text-[#3c3022]">
                      <span className="font-medium">Posted by:</span>{" "}
                      {jobData.job.owner.firstName} {jobData.job.owner.lastName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#8b6e4e]" />
                    <span className="text-[#3c3022]">
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(jobData.job.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#8b6e4e]" />
                    <span className="text-[#3c3022]">
                      <span className="font-medium">Updated:</span>{" "}
                      {formatDate(jobData.job.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#8b6e4e]" />
                    <span className="text-[#3c3022]">
                      <span className="font-medium">Job ID:</span>{" "}
                      {jobData.job.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium text-[#3c3022]">Keywords:</div>
                  <div className="flex flex-wrap gap-2">
                    {jobData.keywords.map(
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
                    {jobData.job.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e6e0cf]"></div>
            <PDFUpload
              file={file}
              setFile={setFile}
              isUploaded={uploaded}
              setIsUploaded={setIsUploaded}
              application={application}
              loading={loading}
            />

            {/* Action buttons */}
            <div className="flex gap-4 border-t border-[#e6e0cf] pt-4">
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-[#d9d0b8] bg-[#e6e0cf] text-[#3c3022] hover:bg-[#d9d0b8] hover:text-[#3c3022]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
                </Button>
              </Link>
              <Button
                variant="outline"
                disabled={
                  loading || uploading || (!uploaded && application === null)
                }
                className="flex-1 border-[#8b6e4e] bg-[#8b6e4e] text-white hover:bg-[#6d563d]"
                onClick={() => uploadFile()}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Loading
                  </>
                ) : uploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {application !== null ? "Loading..." : "Uploading..."}
                  </>
                ) : application === null ? (
                  "Apply"
                ) : hasInterview ? (
                  surveyCompleted ? (
                    "View Results"
                  ) : (
                    "Continue Interview"
                  )
                ) : (
                  "Start Interview"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
