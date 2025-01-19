"use client";

import { Button } from "~/components/ui/button";
import { logout } from "~/app/actions/auth";
import { useRouter } from "next/navigation";

export function LogOutButton() {
  const router = useRouter();

  return (
    <Button
      variant={"link"}
      className="text-text-200 hover:text-text-100"
      onClick={async () => {
        const result = await logout();
        if (result.success) {
          router.refresh();
          router.push("/");
        }
      }}
    >
      Log out
    </Button>
  );
}