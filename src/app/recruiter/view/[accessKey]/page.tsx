"use client";

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { JobWithKeywords } from "~/app/actions/recruiter";
import { Button } from "~/components/ui/button";
import { useJobStore } from "../../page";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";

interface JobDetailsPageProps {
  jobData: JobWithKeywords;
}

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
  const jobData = useJobStore((state) => state.jobData);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        {jobData === null && <div>No data</div>}
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
                <h2 className="text-xl font-semibold text-[#3c3022]">
                  Access Information
                </h2>

                <div className="rounded-md bg-[#e6e0cf] p-4">
                  <div className="mb-2 font-medium text-[#3c3022]">
                    Access Key:
                  </div>
                  <div className="break-all rounded bg-white p-3 font-mono text-sm">
                    {jobData.job.accessKey}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-[#3c3022]">Keywords:</div>
                  <div className="flex flex-wrap gap-2">
                    {jobData.keywords.map((keyword: string, index: number) => (
                      <Badge
                        key={index}
                        className="bg-[#e6e0cf] text-[#3c3022] hover:bg-[#d9d0b8]"
                      >
                        {keyword}
                      </Badge>
                    ))}
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

            {/* Action buttons */}
            <div className="flex gap-4 border-t border-[#e6e0cf] pt-4">
              <Link href="/recruiter" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-[#d9d0b8] bg-[#e6e0cf] text-[#3c3022] hover:bg-[#d9d0b8] hover:text-[#3c3022]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex-1 border-[#8b6e4e] bg-[#8b6e4e] text-white hover:bg-[#6d563d]"
              >
                Edit Job
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
