import { ChevronLeft, Search } from "lucide-react";
import { GetApplicants } from "~/app/actions/interview";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

const applicants = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "nathaniel@applicant.com",
    status: "Finished",
    match: "92%",
    date: "Apr 10, 2025",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "nathaniel@applicant.com",
    status: "Interviewed",
    match: "88%",
    date: "Apr 11, 2025",
  },
  {
    id: "3",
    name: "Jessica Williams",
    email: "nathaniel@applicant.com",
    status: "Scheduled",
    match: "85%",
    date: "Apr 15, 2025",
  },
  {
    id: "4",
    name: "David Rodriguez",
    email: "nathaniel@applicant.com",
    status: "Applied",
    match: "78%",
    date: "Apr 12, 2025",
  },
  {
    id: "5",
    name: "Emily Taylor",
    email: "nathaniel@applicant.com",
    status: "Applied",
    match: "76%",
    date: "Apr 13, 2025",
  },
];

const ViewApplicants: React.FC<{
  applicants: GetApplicants;
  setState: React.Dispatch<React.SetStateAction<string>>; // Adjust the type as needed
}> = ({ applicants, setState }) => {
  return (
    <>
      <Card className="bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState("")}
              className="mr-2 border-[#d2b6aa] bg-[#e8e0d2] text-[#5d4037] hover:bg-[#d2b6aa]"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Job
            </Button>
            <h2 className="text-2xl font-bold text-[#5d4037]">
              Applicants ({applicants.applicants.length})
            </h2>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search applicants..."
              className="border-[#d2b6aa] bg-[#f9f7f5] pl-10"
            />
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between px-2 text-sm text-gray-500">
          <div className="w-1/3">Name</div>
          <div className="w-1/3">Email</div>
          <div className="w-1/4">Interview Status</div>
          <div className="w-1/4">Average Match</div>
        </div>

        <div className="divide-y">
          {applicants.applicants.map((applicant, index) => (
            <div
              key={index}
              className="flex cursor-pointer items-center p-4 hover:bg-[#f9f7f5]"
              // onClick={() => handleApplicantSelect(applicant.id)}
            >
              <div className="flex w-1/3 items-center">
                <span className="font-medium text-[#5d4037]">
                  {applicant.name}
                </span>
              </div>
              <div className="flex w-1/3 items-center">
                <span className="text-sm font-medium text-[#5d4037]">
                  {applicant.email}
                </span>
              </div>
              <div className="w-1/4">
                <Badge
                  className={
                    applicant.is_finished === 1
                      ? "bg-green-100 text-green-800 hover:bg-green-300"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-300"
                  }
                >
                  {applicant.is_finished === 1 && "Finished"}
                  {applicant.is_finished === 0 && "Started"}
                </Badge>
              </div>
              <div className="w-1/4">
                <Badge className="bg-[#e8e0d2] text-[#5d4037]">
                  {/* {applicant.match} */}
                  test
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};

export default ViewApplicants;
