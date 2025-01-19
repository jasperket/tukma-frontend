"use server";

import { type LoginResponse } from "~/lib/types/auth";
import { type LoginFormValues } from "../components/LogInDialog";
import { type SignUpFormValues } from "../components/SignUpDialog";
import { createSession } from "~/lib/session";
import { redirect } from "next/navigation";

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
    await login(credentials);
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
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid credentials");
      }
      throw new Error("Failed to log in");
    }

    // console.log(response);

    // const { token, expiresIn, username } =
    //   (await response.json()) as LoginResponse;

    // await createSession(username, token, expiresIn);

    console.log("Redirecting to dashboard...");
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
