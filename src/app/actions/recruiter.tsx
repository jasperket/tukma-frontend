"use server";

import { cookies } from "next/headers";

const BASE_URL = "https://backend.tukma.work/api/v1/jobs/";

export interface CreateJobFormValues {
  jobTitle: string;
  jobDescription: string;
  jobAddress: string;
  jobType: string;
  shiftType: string;
  shiftLengthHours: number;
  locationType: string;
  keywords: string;
  behavioralQuestions?: string[];
  technicalQuestions?: string[];
}

export interface Job {
  id: number;
  owner: User;
  description: string;
  title: string;
  address: string;
  accessKey: string;
  type: string;
  shiftType: string;
  shiftLengthHours: number;
  createdAt: string;
  updatedAt: string;
  locationType: string;
}

export interface Owner {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  recruiter: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isRecruiter: boolean;
  companyName: string;
}

export interface UserAlt {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  isRecruiter: boolean;
}

export interface JobPaginated {
  id: number;
  owner: User;
  description: string;
  title: string;
  address: string;
  accessKey: string;
  type: string;
  shiftType: string;
  shiftLengthHours: number;
  createdAt: string;
  updatedAt: string;
  locationType: string;
}

export interface JobWithKeywords {
  job: JobPaginated;
  keywords: string[];
}

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface GetJobsResponse {
  jobs: JobWithKeywords[];
  pagination: Pagination;
}

export interface JobSearchResult {
  job: Job;
  keywords: string[];
  relevanceScore: number;
}

interface CreateJobResponse {
  id: number;
  owner: UserAlt;
  description: string;
  title: string;
  address: string;
  accessKey: string;
  type: string;
  shiftType: string;
  shiftLengthHours: number;
  createdAt: string;
  updatedAt: string;
  keywords: string[];
}

export interface JobSearchResponse {
  jobs: JobSearchResult[];
  pagination: Pagination;
}

export interface Question {
  id: number;
  questionText: string;
  type: "TECHNICAL" | "BEHAVIORAL";
  createdAt: string;
  updatedAt: string;
}

export async function fetchJobs() {
  try {
    console.log("Fetching jobs...");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}get-jobs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const json: GetJobsResponse = (await response.json()) as GetJobsResponse;
    console.log(json);

    return json;
  } catch (error) {
    console.error("Failed to fetch jobs: ", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function createJob(data: CreateJobFormValues) {
  try {
    console.log("Creating job...");

    // Transform keywords to array
    const keywords: string[] = data.keywords
      .replace(/, /g, ",")
      .split(",")
      .filter((k) => k.trim() !== "");

    const new_data = {
      title: data.jobTitle,
      description: data.jobDescription,
      address: data.jobAddress,
      type: data.jobType,
      shiftType: data.shiftType,
      shiftLengthHours: data.shiftLengthHours,
      locationType: data.locationType,
      keywords: keywords,
    };

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");

    // First, create the job
    const response = await fetch(`${BASE_URL}create-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include",
      body: JSON.stringify(new_data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error creating job! status: ${response.status}`);
    }

    // Parse the JSON response for the created job
    const jobResponse = (await response.json()) as CreateJobResponse;
    console.log("Job created:", jobResponse);

    // Add behavioral questions if provided
    if (data.behavioralQuestions && data.behavioralQuestions.length > 0) {
      const filteredBehavioralQuestions = data.behavioralQuestions.filter(
        (q) => q.trim() !== "",
      );

      if (filteredBehavioralQuestions.length > 0) {
        await addQuestions(
          jobResponse.accessKey,
          filteredBehavioralQuestions,
          "BEHAVIORAL",
        );
      }
    }

    // Add technical questions if provided
    if (data.technicalQuestions && data.technicalQuestions.length > 0) {
      const filteredTechnicalQuestions = data.technicalQuestions.filter(
        (q) => q.trim() !== "",
      );

      if (filteredTechnicalQuestions.length > 0) {
        await addQuestions(
          jobResponse.accessKey,
          filteredTechnicalQuestions,
          "TECHNICAL",
        );
      }
    }

    return { success: true, job: jobResponse };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Function to delete all questions for a job
async function deleteAllQuestions(accessKey: string) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");

    const response = await fetch(`${BASE_URL}questions/${accessKey}/all`, {
      method: "DELETE",
      headers: {
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok && response.status !== 404) {
      // 404 is acceptable if no questions exist
      throw new Error(
        `HTTP error deleting questions! status: ${response.status}`,
      );
    }

    console.log("All questions deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting questions:", error);
    throw error;
  }
}

// Function to get all questions for a job
export async function getJobQuestions(accessKey: string) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");

    const response = await fetch(`${BASE_URL}questions/${accessKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { behavioral: [], technical: [] };
      }
      throw new Error(
        `HTTP error getting questions! status: ${response.status}`,
      );
    }

    const questions = (await response.json()) as Question[];

    // Separate questions by type
    const behavioral = questions
      .filter((q) => q.type === "BEHAVIORAL")
      .map((q) => q.questionText);
    const technical = questions
      .filter((q) => q.type === "TECHNICAL")
      .map((q) => q.questionText);

    return { behavioral, technical };
  } catch (error) {
    console.error("Error getting questions:", error);
    return { behavioral: [], technical: [] };
  }
}

// Helper function to add questions to a job
async function addQuestions(
  accessKey: string,
  questions: string[],
  type: "BEHAVIORAL" | "TECHNICAL",
) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");

    const response = await fetch(`${BASE_URL}questions/${accessKey}/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include",
      body: JSON.stringify({
        questions: questions,
        type: type,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error adding ${type} questions! status: ${response.status}`,
      );
    }

    // Add explicit type to avoid 'any' assignment
    const result = (await response.json()) as Question[];
    console.log(`${type} questions added:`, result);

    return result;
  } catch (error) {
    console.error(`Error adding ${type} questions:`, error);
    throw error;
  }
}

export async function deleteJob(accessKey: string) {
  try {
    console.log("Deleting job.");
    console.log(accessKey);

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}delete-job/${accessKey}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

    console.log(response);

    if (response.status === 204 || response.ok) {
      console.log("Request successful");

      return { success: true };
    } else {
      // Handle all other errors (status codes outside 200-299)
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getJobsRecruiter(
  page = 0,
  size = 10,
): Promise<GetJobsResponse> {
  const url = `get-jobs-owner?page=${page}&size=${size}`;

  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(BASE_URL + url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetJobsResponse = (await response.json()) as GetJobsResponse;
    return data;
  } catch (error) {
    console.error("Error fetching paginated jobs:", error);
    throw error;
  }
}

export async function getJobsApplicant(
  page = 0,
  size = 10,
): Promise<GetJobsResponse> {
  const url = `get-all-jobs?page=${page}&size=${size}`;

  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(BASE_URL + url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Explicitly type the response to avoid `any`
    const data: GetJobsResponse = (await response.json()) as GetJobsResponse;
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching all jobs:", error);
    throw error;
  }
}

export async function editJob(data: CreateJobFormValues, accessKey: string) {
  try {
    console.log("Editing job...");

    // Transform keywords to array
    const keywords: string[] = data.keywords
      .replace(/, /g, ",")
      .split(",")
      .filter((k) => k.trim() !== "");

    const new_data = {
      title: data.jobTitle,
      description: data.jobDescription,
      address: data.jobAddress,
      type: data.jobType,
      shiftType: data.shiftType,
      shiftLengthHours: data.shiftLengthHours,
      locationType: data.locationType,
      keywords: keywords,
    };

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}edit-job/${accessKey}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
      body: JSON.stringify(new_data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const json = (await response.json()) as JobWithKeywords;
    console.log(json);

    // Delete existing questions and add new ones if provided
    if (data.behavioralQuestions?.length || data.technicalQuestions?.length) {
      try {
        // First delete all existing questions
        await deleteAllQuestions(accessKey);

        // Add behavioral questions if provided
        if (data.behavioralQuestions && data.behavioralQuestions.length > 0) {
          const filteredBehavioralQuestions = data.behavioralQuestions.filter(
            (q) => q.trim() !== "",
          );

          if (filteredBehavioralQuestions.length > 0) {
            await addQuestions(
              accessKey,
              filteredBehavioralQuestions,
              "BEHAVIORAL",
            );
          }
        }

        // Add technical questions if provided
        if (data.technicalQuestions && data.technicalQuestions.length > 0) {
          const filteredTechnicalQuestions = data.technicalQuestions.filter(
            (q) => q.trim() !== "",
          );

          if (filteredTechnicalQuestions.length > 0) {
            await addQuestions(
              accessKey,
              filteredTechnicalQuestions,
              "TECHNICAL",
            );
          }
        }
      } catch (error) {
        console.error("Error updating questions:", error);
        // Continue with the job update even if there's an error with questions
      }
    }

    return { success: true, job: json };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getJobDetails(accessKey: string) {
  try {
    console.log("Fetching job details");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}get-job-details/${accessKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const json = (await response.json()) as JobWithKeywords;
    console.log(json);

    return { success: true, job: json };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getSearchJob(
  page = 0,
  size = 10,
  query: string,
): Promise<JobSearchResponse> {
  const url = `search?query=${query}&page=${page}&size=${size}`;

  try {
    const response = await fetch(BASE_URL + url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Explicitly type the response to avoid `any`
    const data: JobSearchResponse =
      (await response.json()) as JobSearchResponse;
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching all jobs:", error);
    throw error;
  }
}
