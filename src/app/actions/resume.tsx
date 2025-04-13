"use server";

import { cookies } from "next/headers";

const BASE_URL = "https://backend.tukma.work/api/v1/resume/";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isRecruiter: boolean;
  companyName?: string; // Optional, only present for recruiters
}

interface UploadForJob {
  hash: string;
}

interface CheckResumeStatus {
  result: string;
}

interface KeywordAnalysis {
  similarity_score: number;
  best_matching_ngram: string;
}

type Result = Record<string, KeywordAnalysis>;

export interface GetSimilarityScore {
  hash: string;
  result: Result;
}

interface Resume {
  id: number;
  resumeHash: string;
  results: string; // JSON string of keyword analysis
  owner: User;
}

interface ResumeWithJob {
  id: number;
  resumeHash: string;
  results: string; // JSON string of keyword analysis
  job: Job;
  owner: User;
}

export type ParsedResults = Record<string, KeywordAnalysis>;

interface Job {
  id: number;
  title: string;
  description: string;
  address: string;
  accessKey: string;
  type: string; // e.g., "FULL_TIME"
  shiftType: string; // e.g., "DAY_SHIFT"
  shiftLengthHours: number;
  locationType: string; // e.g., "ON_SITE"
  createdAt: string;
  updatedAt: string;
  owner: User;
}

export interface GetMyApplicationForJob {
  resume: Resume;
  parsedResults: ParsedResults;
  job: Job;
}

export interface CleanUpDuplicates {
  totalResumesProcessed: number; // Total number of resumes processed
  totalDuplicatesRemoved: number; // Total number of duplicates removed
  uniqueCombinationsWithDuplicates: number; // Number of unique combinations that had duplicates
  duplicateCombinations: Array<[number, number, number]>; // Array of tuples representing duplicate combinations
}

export interface GetResumeData {
  resume: ResumeWithJob;
  parsedResults: ParsedResults;
}

export interface GetAllResumeData {
  job: Job;
  resumes: GetResumeData[];
}

export async function uploadForJob(
  file: File,
  accessKey: string,
) {
  try {
    console.log("Uploading for job");
    console.log(file);
    console.log(accessKey);

    // Create a FormData object to send the file and keywords
    const formData = new FormData();
    formData.append("resume", file);

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}upload-for-job/${accessKey}`, {
      method: "POST",
      headers: {
        Cookie: `jwt=${cookie?.value}`,
      },
      body: formData,
      credentials: "include", // Include cookies in the request
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to upload resume");
    }

    // Parse and return the successful response
    const data = (await response.json()) as UploadForJob;
    console.log(data);

    return { success: true, hash: data.hash };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function checkResumeStatus(hash: string) {
  try {
    console.log("Checking resume status");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}status/${hash}`, {
      method: "GET",
      headers: {
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to check resume");
    }

    // Parse and return the successful response
    const data = (await response.json()) as CheckResumeStatus;
    console.log(data);

    return { success: true, data: data.result };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getSimilarityScore(hash: string) {
  try {
    console.log("Checking resume status");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}score/${hash}`, {
      method: "GET",
      headers: {
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch similarity score");
    }

    // Parse and return the successful response
    const data = (await response.json()) as GetSimilarityScore;
    console.log(data);

    return { success: true, data: data };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getJobApplication(accessKey: string) {
  try {
    console.log("Fetching job application");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}my-application/${accessKey}`, {
      method: "GET",
      headers: {
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch job application");
    }

    // Parse and return the successful response
    const data = (await response.json()) as GetMyApplicationForJob;
    console.log(data);

    return { success: true, data: data };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function cleanUpDuplicates() {
  try {
    console.log("Checking resume status");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}cleanup-duplicates`, {
      method: "GET",
      headers: {
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to check resume status");
    }

    // Parse and return the successful response
    const data = (await response.json()) as CleanUpDuplicates;
    console.log(data);

    return { success: true, data: data };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getResumeData(hash: string) {
  try {
    console.log("Fetching resume data status");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}data/${hash}`, {
      method: "GET",
      headers: {
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch resume data");
    }

    // Parse and return the successful response
    const data = (await response.json()) as GetResumeData;
    console.log(data);

    return { success: true, data: data };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getResumeByJob(accessKey: string) {
  try {
    console.log("Fetching all resume data");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}job/${accessKey}`, {
      method: "GET",
      headers: {
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch resume data");
    }

    // Parse and return the successful response
    const data = (await response.json()) as GetAllResumeData;
    console.dir(data, {depth: null});

    return { success: true, data: data };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
