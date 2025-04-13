import { JobWithKeywords, Question } from "~/app/actions/recruiter";

const JobDetail: React.FC<{
  jobData: JobWithKeywords;
  questions: Question[];
  setState: React.Dispatch<React.SetStateAction<string>>; // Adjust the type as needed
}> = ({ jobData, questions, setState }) => {
  return (
    <>
    </>
  );
};