import React from "react";
import { format } from "date-fns";
import { Search, MapPin, Clock, Calendar, Eye } from "lucide-react";
import { JobWithKeywords } from "../../actions/recruiter";

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

interface JobCardProps {
  job: JobWithKeywords;
  onViewJob: (job: JobWithKeywords) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onViewJob }) => {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between lg:flex-row">
        <div className="flex-grow">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center">
            <h2 className="text-xl font-semibold text-[#2d2418]">
              {job.job.title}
            </h2>
            <div className="flex gap-2">
              <span className="rounded-full bg-[#e9e4d8] px-2 py-1 text-xs text-[#2d2418]">
                {formatJobType(job.job.type)}
              </span>
              <span className="rounded-full bg-[#e9e4d8] px-2 py-1 text-xs text-[#2d2418]">
                {formatJobType(job.job.shiftType)}
              </span>
            </div>
          </div>

          <div className="mb-3 flex items-center text-sm text-gray-600">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{job.job.address}</span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {job.keywords.map(
              (keyword, idx) =>
                keyword.length > 0 && (
                  <span
                    key={idx}
                    className="rounded-full bg-[#e9e4d8] px-2 py-1 text-xs text-[#2d2418]"
                  >
                    {keyword}
                  </span>
                )
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{job.job.shiftLengthHours} hours</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              <span>Created: {formatDate(job.job.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                ID: {job.job.accessKey}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 lg:ml-4 lg:mt-0 lg:flex-col">
          <button
            className="flex flex-1 items-center justify-center rounded-md bg-[#e9e4d8] px-3 py-2 text-[#2d2418] transition-colors hover:bg-[#dfd9c9] lg:flex-none"
            title="View Details"
            onClick={() => onViewJob(job)}
          >
            <Eye className="mr-2 h-5 w-5 lg:mr-0" />
            <span className="lg:hidden">View</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
