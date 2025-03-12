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

// Format job type and shift type for display
const formatJobType = (type: string) => {
  return type
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatShiftType = (type: string) => {
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
  const [uploaded, setIsUploaded] = useState<boolean>(false);
  const [accessKey, setAccessKey] = useState<string>("");

  const handleApply = () => {
    router.push(`/applicant/apply/${jobData?.job.accessKey}`);
  };

  useEffect(() => {
    async function fetchData() {
      const accessKey = window.location.href.split("/").pop();
      setAccessKey(accessKey!);
      const response = await getJobDetails(accessKey!);
      if (response.success) {
        setJobInfoData(response.job!);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  async function uploadFile() {

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
            <PDFUpload isUploaded={uploaded} setIsUploaded={setIsUploaded}/>

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
                disabled={!uploaded}
                className="flex-1 border-[#8b6e4e] bg-[#8b6e4e] text-white hover:bg-[#6d563d]"
                onClick={() => handleApply()}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
