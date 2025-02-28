"use server";

import { cookies } from "next/headers";
import type { Job } from "../dashboard/components/Employer";

const BASE_URL = "https://backend.tukma.work/api/v1/jobs/";

export interface CreateJobFormValues {
  jobTitle: string;
  jobDescription: string;
  jobType: string;
  shiftType: string;
  shiftLengthHours: number;
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
    const json: Job[] = (await response.json()) as Job[];
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
        title: data.jobTitle,
        description: data.jobDescription,
        type: data.jobType,
        shiftType: data.shiftType,
        shiftLengthHours: data.shiftLengthHours,
      }),
    });

    console.log(response);

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const json = (await response.json()) as Job;
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

export async function deleteJob(accessKey: string) {
  try {
    console.log("Deleting job.");

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
