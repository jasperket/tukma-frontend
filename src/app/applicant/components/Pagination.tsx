import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "~/app/actions/recruiter";

interface PaginationProps {
  pagination: Pagination;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage,
  handlePageChange,
}) => {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {currentPage * 10 + 1} of {pagination.totalElements} jobs
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
            Page {currentPage + 1} of {pagination.totalPages}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!((currentPage + 1) * 10 < pagination.totalElements)}
            className={`rounded-md p-2 ${
              !((currentPage + 1) * 10 < pagination.totalElements)
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-[#e9e4d8] text-[#2d2418] hover:bg-[#dfd9c9]"
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Pagination;
