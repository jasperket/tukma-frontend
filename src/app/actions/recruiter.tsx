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

    // transforming keywords to array
    const keywords: string[] = data.keywords.replace(/, /g, ",").split(",");
    const new_data = {
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      jobAddress: data.jobAddress,
      jobType: data.jobType,
      shiftType: data.shiftType,
      shiftLengthHours: data.shiftLengthHours,
      locationType: data.locationType,
      keywords: keywords,
    };

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}create-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
      body: JSON.stringify({
        title: new_data.jobTitle,
        description: new_data.jobDescription,
        address: new_data.jobAddress,
        type: new_data.jobType,
        shiftType: new_data.shiftType,
        shiftLengthHours: new_data.shiftLengthHours,
        locationType: new_data.locationType,
        keywords: new_data.keywords,
      }),
    });

    console.log(response);

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const json = (await response.json()) as CreateJobResponse;
    console.log(json);

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

    // transforming keywords to array
    const keywords: string[] = data.keywords.replace(/, /g, ",").split(",");
    const new_data = {
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      jobAddress: data.jobAddress,
      jobType: data.jobType,
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
      body: JSON.stringify({
        title: new_data.jobTitle,
        description: new_data.jobDescription,
        address: new_data.jobAddress,
        type: new_data.jobType,
        shiftType: new_data.shiftType,
        shiftLengthHours: new_data.shiftLengthHours,
        locationType: new_data.locationType,
        keywords: new_data.keywords,
      }),
    });

    console.log(response);

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

    console.log(response);

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
    const data: JobSearchResponse = (await response.json()) as JobSearchResponse;
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching all jobs:", error);
    throw error;
  }
}
