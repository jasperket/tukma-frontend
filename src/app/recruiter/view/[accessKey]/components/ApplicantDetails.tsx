import { BarChart3, ChevronLeft, FileText, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Applicant, FinishedApplicants, GetApplicants } from "~/app/actions/interview";
import { GetResumeData } from "~/app/actions/resume";
import SkillsRadarChart from "~/app/applicant/components/SkillsRadarChart";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Transcript from "./Transcript";
import Analysis from "./Analysis";

const ApplicantDetails: React.FC<{
  resume: GetResumeData;
  setState: React.Dispatch<React.SetStateAction<string>>; // Adjust the type as needed
}> = ({ resume, setState }) => {
  const [applicantTab, setApplicantTab] = useState<string>("resume");

  return (
    <>
      <Card className="bg-white p-6 shadow-sm">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setState("list")}
          className="mb-4 mr-2 border-[#d2b6aa] bg-[#e8e0d2] text-[#5d4037] hover:bg-[#d2b6aa]"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Applicant List
        </Button>
        <Tabs
          value={applicantTab}
          onValueChange={setApplicantTab}
          className="w-full"
        >
          <TabsList className="w-full rounded-md bg-[#e8e0d2] p-1">
            <TabsTrigger
              value="resume"
              className="flex-1 rounded-sm data-[state=active]:bg-[#8b6f5a] data-[state=active]:text-white"
            >
              <FileText className="mr-2 h-4 w-4" /> Resume Analysis
            </TabsTrigger>
            <TabsTrigger
              value="interview"
              className="flex-1 rounded-sm data-[state=active]:bg-[#8b6f5a] data-[state=active]:text-white"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Interview Transcript
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="flex-1 rounded-sm data-[state=active]:bg-[#8b6f5a] data-[state=active]:text-white"
            >
              <BarChart3 className="mr-2 h-4 w-4" /> Interview Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume">
            <SkillsRadarChart resumeData={resume} />
          </TabsContent>
          <TabsContent value="interview">
            <Transcript user={resume.resume.owner} />
          </TabsContent>
          <TabsContent value="analysis">
            <Analysis resume={resume}/>
          </TabsContent>
        </Tabs>
      </Card>
    </>
  );
};

export default ApplicantDetails;
