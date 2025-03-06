import { create } from "zustand";
import { JobWithKeywords } from "../actions/recruiter";

type JobStore = {
  jobData: JobWithKeywords | null;
  setJobInfoData: (data: JobWithKeywords) => void;
};

export const useJobStore = create<JobStore>((set) => ({
  jobData: null,
  setJobInfoData: (data) => set({ jobData: data }),
}));