"use client";

import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Search,
  MapPin,
  Clock,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getJobsApplicant,
  GetJobsResponse,
  JobWithKeywords,
} from "../actions/recruiter";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useJobStore } from "~/app/stores/useJobStore";

// Format date to a more readable format
const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return dateString;
  }
};

// Format job type and shift type to be more readable
const formatJobType = (type: string): string => {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function JobsPage() {
  const router = useRouter();
  const setJobInfoData = useJobStore((state) => state.setJobInfoData);
  const [jobData, setJobData] = useState<GetJobsResponse | undefined>();
  const [currentPage, setCurrentPage] = useState<number>(0);

  useEffect(() => {
    const fetchAPI = async () => {
      const response = await getJobsApplicant();
      setJobData(response);
      console.log(response);
    };

    fetchAPI();
  }, []);

  const handlePageChange = async (pageNumber: number) => {
    setCurrentPage(pageNumber);

    const response = await getJobsApplicant(pageNumber, 5);
    setJobData(response);
  };

  const handleViewJob = (object: JobWithKeywords) => {
    setJobInfoData(object);
    router.push(`/applicant/view/${object.job.accessKey}`);
  };

  return (
    <>
      <div className="p-6"></div>
      <main className="px-6">
        <div>
          <h1 className="font-serif text-5xl font-bold text-text-200">
            Available Jobs
          </h1>
        </div>
        <div className="p-2"></div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search jobs..."
              className="border-text-200 bg-background-950 pl-9 text-text-100 placeholder:text-text-400"
            />
          </div>
          <Button className="bg-primary-300 hover:bg-primary-400">
            Search
          </Button>
        </div>
        <div className="p-2"></div>

        {/* Job Listings */}
        <div className="mb-2 space-y-4">
          {jobData !== undefined && jobData.jobs.length > 0 ? (
            jobData.jobs.map((item) => (
              <div
                key={item.job.id}
                className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between lg:flex-row">
                  <div className="flex-grow">
                    <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center">
                      <h2 className="text-xl font-semibold text-[#2d2418]">
                        {item.job.title}
                      </h2>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-[#e9e4d8] px-2 py-1 text-xs text-[#2d2418]">
                          {formatJobType(item.job.type)}
                        </span>
                        <span className="rounded-full bg-[#e9e4d8] px-2 py-1 text-xs text-[#2d2418]">
                          {formatJobType(item.job.shiftType)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center text-sm text-gray-600">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{item.job.address}</span>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {item.keywords.map(
                        (keyword, idx) =>
                          keyword.length > 0 && (
                            <span
                              key={idx}
                              className="rounded-full bg-[#e9e4d8] px-2 py-1 text-xs text-[#2d2418]"
                            >
                              {keyword}
                            </span>
                          ),
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{item.job.shiftLengthHours} hours</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>Created: {formatDate(item.job.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          ID: {item.job.accessKey}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 lg:ml-4 lg:mt-0 lg:flex-col">
                    <button
                      className="flex flex-1 items-center justify-center rounded-md bg-[#e9e4d8] px-3 py-2 text-[#2d2418] transition-colors hover:bg-[#dfd9c9] lg:flex-none"
                      title="View Details"
                      onClick={() => handleViewJob(item)}
                    >
                      <Eye className="mr-2 h-5 w-5 lg:mr-0" />
                      <span className="lg:hidden">View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">No jobs available</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {jobData !== undefined && jobData.pagination.totalPages > 1 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {currentPage * 5 + 1} of{" "}
              {jobData.pagination.totalElements} jobs
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`rounded-md p-2 ${
                  currentPage === 0
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : "bg-[#e9e4d8] text-[#2d2418] hover:bg-[#dfd9c9]"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-sm">
                Page {currentPage + 1} of {jobData.pagination.totalPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!jobData.pagination.hasNextPage}
                className={`rounded-md p-2 ${
                  !jobData.pagination.hasNextPage
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : "bg-[#e9e4d8] text-[#2d2418] hover:bg-[#dfd9c9]"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
