"use server";

import { cookies } from "next/headers";

const BASE_URL = "https://backend.tukma.work/api/v1/survey";

export interface Question {
  id: number;
  questionText: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: number;
  question: Question;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    isRecruiter: boolean;
  };
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  message: string;
  answers: Answer[];
}

export interface SusScoreResponse {
  susScore: number;
  interpretation: string;
  answeredQuestions: number;
  possibleMax: number;
}

export interface SurveyCompletionStatus {
  isComplete: boolean;
  answeredQuestions: number;
  requiredQuestions: number;
  remainingQuestions: number;
}

// Fetch all survey questions
export async function getAllQuestions() {
  try {
    console.log("Fetching all survey questions");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const questions = (await response.json()) as Question[];
    return { success: true, data: questions };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch survey questions:", error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Submit multiple answers (for complete survey)
export async function submitSurvey(
  answers: { questionId: number; score: number }[],
) {
  try {
    console.log("Submitting survey");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    console.log("--- Server Action submitSurvey ---");
    console.log("JWT Cookie Value Found:", cookie?.value ? "Yes" : "No");
    // Optional: Log the actual value in dev, but be careful in production logs
    // console.log("Actual JWT:", cookie?.value);
    console.log("Request Body:", JSON.stringify({ answers }));
    console.log("Target URL:", `${BASE_URL}/answers/submit-survey`);
    console.log("---------------------------------");
    const response = await fetch(`${BASE_URL}/answers/submit-survey`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include",
      body: JSON.stringify({ answers }),
    });

    console.log(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = (await response.json()) as SurveyResponse;
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to submit survey:", error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Get SUS score for the current user
export async function getSusScore() {
  try {
    console.log("Fetching SUS score");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}/answers/sus-score`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = (await response.json()) as SusScoreResponse;
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch SUS score:", error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Check if the current user has completed the SUS survey
export async function checkSurveyCompletion() {
  try {
    console.log("Checking survey completion status");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}/answers/check-survey-completion`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = (await response.json()) as SurveyCompletionStatus;
    console.log(result);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to check survey completion:", error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
