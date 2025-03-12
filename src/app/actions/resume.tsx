import { cookies } from "next/headers";

const BASE_URL = "https://backend.tukma.work/api/v1/resume/";

export async function uploadForJob(file: File, accessKey: string) {
  try {
    console.log("Uploading for job");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}upload-for-job/${accessKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${cookie?.value}`,
      },
      credentials: "include", // Include cookies in the request
    });

  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}