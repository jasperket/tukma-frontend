"use client";

import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getJobsApplicant,
  GetJobsResponse,
  getSearchJob,
  JobSearchResponse,
  JobWithKeywords,
} from "../actions/recruiter";
import { useRouter } from "next/navigation";
import { useJobStore } from "~/app/stores/useJobStore";
import JobCard from "./components/JobCard";
import Pagination from "./components/Pagination";

export default function JobsPage() {
  const router = useRouter();
  const setJobInfoData = useJobStore((state) => state.setJobInfoData);
  const [jobData, setJobData] = useState<GetJobsResponse | undefined>();
  const [searchData, setSearchData] = useState<JobSearchResponse | undefined>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    const fetchAPI = async () => {
      const response = await getJobsApplicant();
      setJobData(response);
      console.log(response);
    };

    fetchAPI();
  }, []);

  useEffect(() => {
    if (inputValue.length === 0) {
      setSearchData(undefined);
      setCurrentPage(0);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      (async () => {
        const response = await getSearchJob(currentPage, 10, inputValue);
        setCurrentPage(0);
        setSearchData(response);
      })();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  const handlePageChange = async (pageNumber: number) => {
    setCurrentPage(pageNumber);

    const response = await getJobsApplicant(pageNumber, 10);
    setJobData(response);
  };

  const handleSearchPageChange = async (pageNumber: number) => {
    setCurrentPage(pageNumber);

    const response = await getSearchJob(pageNumber, 10, inputValue);
    setSearchData(response);
  };

  const handleViewJob = (object: JobWithKeywords) => {
    setJobInfoData(object);
    router.push(`/applicant/view/${object.job.accessKey}`);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
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
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="p-2"></div>

        {/* Job Listings */}
        <div className="mb-2 space-y-4">
          {searchData?.jobs.map((item) => (
            <JobCard
              key={item.job.id}
              job={{ job: item.job, keywords: item.keywords }}
              onViewJob={handleViewJob}
            />
          ))}
          {searchData?.jobs.length === 0 && (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">No jobs found</p>
            </div>
          )}
          {!searchData &&
            jobData?.jobs.map((item) => (
              <JobCard
                key={item.job.id}
                job={{ job: item.job, keywords: item.keywords }}
                onViewJob={handleViewJob}
              />
            ))}
          {!searchData && jobData?.jobs.length === 0 && (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">No jobs found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {searchData === undefined && jobData !== undefined && (
          <Pagination
            currentPage={currentPage}
            pagination={jobData?.pagination}
            handlePageChange={handlePageChange}
          />
        )}
        {searchData !== undefined && (
          <Pagination
            currentPage={currentPage}
            pagination={searchData.pagination}
            handlePageChange={handleSearchPageChange}
          />
        )}
      </main>
    </>
  );
}
