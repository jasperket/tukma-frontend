"use server";

import { cookies } from "next/headers";

export async function getUserType() {
    const cookieStore = await cookies();
    return cookieStore.get("userType")?.value;
}