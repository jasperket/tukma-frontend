import { ChevronLeft, Search } from "lucide-react";
import {
  Applicant,
  FinishedApplicants,
  GetApplicants,
} from "~/app/actions/interview";
import {
  GetAllResumeData,
  GetResumeData,
  ParsedResults,
} from "~/app/actions/resume";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

const ViewApplicants: React.FC<{
  finishedApplicants: FinishedApplicants;
  applicants: GetApplicants;
  resumeData: GetAllResumeData;
  setState: React.Dispatch<React.SetStateAction<string>>; // Adjust the type as needed
  setResume: React.Dispatch<React.SetStateAction<GetResumeData | undefined>>; // Adjust the type as needed
}> = ({
  applicants,
  finishedApplicants,
  setState,
  resumeData,
  setResume,
}) => {
  function getHighMatchAverage(parsedResults: ParsedResults) {
    const highScores = Object.values(parsedResults).map(
      (item) => item.similarity_score,
    );

    if (highScores.length === 0) return 0; // avoid divide by zero

    const average =
      highScores.reduce((sum, score) => sum + score, 0) / highScores.length;
    return (average * 100).toFixed(1); // return as percentage with 1 decimal
  }

  function handleSelect(resume: GetResumeData) {
    setResume(resume);
    setState("view");
  }

  return (
    <>
      <Card className="bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-[#5d4037]">
          Applicants ({resumeData.resumes.length})
        </h2>
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
          <div className="w-1/4">Average Similarity</div>
        </div>

        <div className="divide-y">
          {resumeData.resumes.map((resume, index) => {
            const owner = resume.resume.owner;
            const average = getHighMatchAverage(resume.parsedResults);
            const name = owner.firstName + " " + owner.lastName;
            const isFinished = finishedApplicants.finished_interviews.find(
              (info) => info.email === owner.username,
            );
            const isStarted = applicants.applicants.find(
              (info) => info.email === owner.username,
            );

            return (
              <div
                key={index}
                className="flex cursor-pointer items-center p-4 hover:bg-[#f9f7f5]"
                onClick={() => handleSelect(resume)}
              >
                <div className="flex w-1/3 items-center">
                  <span className="font-medium text-[#5d4037]">{name}</span>
                </div>
                <div className="flex w-1/3 items-center">
                  <span className="text-sm font-medium text-[#5d4037]">
                    {owner.username}
                  </span>
                </div>
                <div className="w-1/4">
                  <Badge
                    className={
                      isFinished
                        ? "bg-green-100 text-green-800 hover:bg-green-300"
                        : isStarted
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-300"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-300"
                    }
                  >
                    {isFinished && "Finished"}
                    {!isFinished && isStarted && "Started"}
                    {!isFinished && !isStarted && "Uninitialized"}
                  </Badge>
                </div>
                <div className="w-1/4">
                  <Badge className="bg-[#e8e0d2] text-[#5d4037] hover:bg-[#dad2c5]">
                    {average ? average + "%" : "Not found"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
};

export default ViewApplicants;
