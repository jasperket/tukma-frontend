import "server-only";
import { cookies } from "next/headers";

export async function createSession(
  username: string,
  token: string,
  expiresIn: number,
) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  const cookieStore = await cookies();

  cookieStore.set("username", username, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("username");
  cookieStore.delete("token");
}
