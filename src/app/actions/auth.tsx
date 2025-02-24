"use server";

import { cookies } from "next/headers";
import { deleteSession } from "../lib/session";
import {
  type SignUpFormValues,
  type LoginFormValues,
} from "../components/AuthDialog";

interface UserDetails {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  recruiter: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}

interface UserDetailsWrapper {
  userDetails: UserDetails;
}

const BASE_URL = "https://backend.tukma.work";

export async function signup(data: SignUpFormValues) {
  try {
    console.log("Signing up...");
    const response = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        applicant: data.applicant,
      }),
    });

    console.log(response);

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("User already exists");
      }
      throw new Error("Failed to sign up");
    }

    const credentials = { email: data.email, password: data.password };
    return await login(credentials);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function login(data: LoginFormValues) {
  try {
    console.log("Logging in...");
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid credentials");
      }
      throw new Error("Failed to log in");
    }

    // Get the JWT from the Set-Cookie header
    const cookieStore = await cookies();
    const setCookieHeader = response.headers.get("set-cookie");
    console.log("Set-Cookie header:", setCookieHeader);

    if (setCookieHeader) {
      // Find the jwt cookie
      const jwtCookie = setCookieHeader
        .split(", ")
        .find((cookie) => cookie.startsWith("jwt="));

      if (jwtCookie) {
        // Parse out the JWT value and attributes
        const [cookieValue, ...cookieAttributes] = jwtCookie.split("; ");
        const jwt = cookieValue!.split("=")[1];

        console.log("Found JWT:", jwt);
        console.log("Cookie attributes:", cookieAttributes);

        // Set the cookie using Next.js
        cookieStore.set("jwt", jwt!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 86400,
        });
      }
    }

    checkUser();

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.log("Login error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function logout() {
  try {
    console.log("Logging out...");
    await deleteSession();
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function checkUser() {
  try {
    console.log("Checking user status...");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}/api/v1/auth/user-status`, {
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
    const json = (await response.json()) as UserDetailsWrapper;
    const isRecruiter = json.userDetails.recruiter;

    console.log("User details:", json);

    // Store the user type in a cookie
    cookieStore.set("userType", isRecruiter ? "recruiter" : "applicant", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 24 hours
    });

    return isRecruiter;
  } catch (error) {
    console.error("Failed to check user status: ", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
