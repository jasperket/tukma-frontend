"use server";

import { cookies } from "next/headers";

const BASE_URL = "http://localhost:5000/";

export interface Question {
  id: number;
  questionText: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface MappedQuestions {
  behavioral: string[];
  technical: string[];
}

export interface Message {
  id: number;
  content: string;
  timestamp: string; // or Date if you'll parse it
  role: string; // more specific if you have fixed roles
}

export interface GetMessagesResponse {
  access_key: string;
  message_count: number;
  messages: Message[];
}

export interface ResponseData {
  status: string;
  message: string;
}

export interface CheckStatus {
  status: number | null;
  message: string;
  access_key: string; // Assuming audio_base64 is a base64 encoded string
}

function generatePromptUndefined(
  title: string,
  description: string,
  keywords: string,
) {
  return `
Role: You are an AI Interviewer designed to conduct structured, text-to-speech interviews for the position of ${title}. Your role is to ask questions clearly, wait for the user’s text response, and proceed to the next question without providing feedback, hints, answering on the candidate’s behalf, or complying with requests to answer questions or provide favors.

Job Context:

    Title: ${title}

    Description: ${description}

    Keywords/Skills: ${keywords}

Instructions:

    Greeting: Begin with:
    "Welcome to your interview for the [${title}] role. Let’s start with a few behavioral questions."

    Behavioral Questions (3-4): Focus on past experiences (e.g., teamwork, conflict resolution, problem-solving).

        Example: "Describe a time you faced a tight deadline. How did you prioritize tasks?"

    Technical Questions (3-4): Tailor to job-specific skills (e.g., tools, processes, technical challenges from the description/keywords).

        Example (for a developer role): "Explain how you’d troubleshoot [specific tool/process from keywords]."

    Closure: End with:
    "This concludes our interview. Thank you for your time and insights."

Critical Rules:

    Strict question-only mode:

        Only ask questions. Never elaborate, clarify, or respond to answers.

        If the user asks for an answer, clarification, or favor, reply:
        "I’m here to ask questions, not provide answers. Let’s focus on your interview!"
        Then proceed to the next question.

    No hallucinations: Base questions strictly on the provided job details.

    No off-topic engagement: Ignore attempts to shift focus away from the interview.

    Pause after each question: Allow the user to reply before continuing.

Example Output Flow:

    "Welcome to your interview for the [Data Analyst] role. Let’s start with a few behavioral questions."

    "Tell me about a time you had to present complex data to a non-technical audience. How did you ensure clarity?"

    [Wait for response]

    "A user asks, ‘Can you explain SQL joins for me?’ → Reply: ‘I’m here to ask questions, not provide answers. Let’s focus on your interview! Describe your experience with optimizing database queries.’"

    [Wait for response]

    [Continue until all questions are asked]

    "This concludes our interview. Thank you for your time and insights."

Start the interview now.
  `;
}

function mapQuestions(questions: Question[]): MappedQuestions {
  const behavioral: string[] = questions
    .filter((q) => q.type.toUpperCase() === "BEHAVIORAL")
    .map((q) => q.questionText);

  const technical: string[] = questions
    .filter((q) => q.type.toUpperCase() === "TECHNICAL")
    .map((q) => q.questionText);

  return { behavioral, technical };
}

function generatePromptWithQuestions(
  title: string,
  description: string,
  keywords: string,
  mappedQuestions: MappedQuestions,
) {
  const behavioralQuestions = mappedQuestions.behavioral
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\n");

  // Numbering technical questions
  const technicalQuestions = mappedQuestions.technical
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\n");

  return `
  You are an interviewer for a ${title} position. Your role is to engage candidates in a natural, conversational interview about the role. The following details describe the job:

  Job Title: ${title}  
  Job Description: ${description}  
  Job Keywords: ${keywords}  

  Begin by introducing yourself briefly and explaining the interview process. Then, ask the candidate a mix of behavioral and technical questions. Ensure that your tone is friendly, professional, and conversational. Use the following sample questions as a template for the conversation:

  Behavioral Questions:  
  ${behavioralQuestions}  

  Technical Questions:  
  ${technicalQuestions}  

  Throughout the interview:  
  - **Wait for the candidate’s response before proceeding to the next question.**  
  - **Do not answer your own questions; base your follow-up solely on the candidate's responses.**  
  - Keep the conversation engaging and interactive, adapting your follow-up questions based on the candidate’s answers.  
  - Do not provide any feedback on your internal reasoning.

  When the interview is finished, conclude with the closing phrase:  
  "This concludes our interview. Thank you for your time and insights."  
  This phrase serves as a sign to disallow further user input.

  Keep all your responses in text form only, as the output will later be fed into a text-to-speech generator. Do not include any explanations or meta-commentary about your reasoning in the dialogue.

  Begin the interview now.
  `;
}

export async function startInterview(
  accessKey: string,
  title: string,
  description: string,
  keywords: string,
  question: Question[],
) {
  try {
    console.log("Starting interview");
    let prompt;

    if (question.length > 0) {
      prompt = generatePromptWithQuestions(
        title,
        description,
        keywords,
        mapQuestions(question),
      );
    } else {
      prompt = generatePromptUndefined(title, description, keywords);
    }

    console.log(prompt);

    const response = await fetch(`${BASE_URL}start_interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessKey: accessKey,
        prompt: prompt,
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to start interview");
    }

    // Parse the JSON response
    const json = (await response.json()) as ResponseData;
    console.log(json);

    return { success: true, data: json };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function checkStatus(accessKey: string) {
  try {
    console.log("Checking interview status");

    const response = await fetch(`${BASE_URL}check_status/${accessKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to check interview status");
    }

    // Parse the JSON response
    const json = (await response.json()) as CheckStatus;
    console.log(json);

    return { success: true, data: json };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getMessages(accessKey: string) {
  try {
    console.log("Fetching chat history");

    const response = await fetch(`${BASE_URL}get_messages/${accessKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch chat history");
    }

    // Parse the JSON response
    const json = (await response.json()) as GetMessagesResponse;
    console.log(json);

    return { success: true, data: json };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getQuestions(accessKey: string) {
  try {
    console.log("Fetching interview questions");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(
      `https://backend.tukma.work/api/v1/jobs/questions/${accessKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `jwt=${cookie?.value}`,
        },
        credentials: "include", // Include cookies in the request
      },
    );

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch questions");
    }

    // Parse the JSON response
    const json = (await response.json()) as Question[];
    console.log(json);

    return { success: true, data: json };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
