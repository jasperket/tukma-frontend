"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { logout } from "~/app/actions/auth";
import { useRouter } from "next/navigation";

export function LogOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await logout();
      if (result.success) {
        localStorage.clear();
        router.refresh();
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isLoading && <span className="loader h-8 w-auto"></span>}
      <Button
        variant="link"
        className="text-text-200 hover:text-text-100"
        onClick={handleLogout}
        disabled={isLoading}
      >
        Log out
      </Button>
    </div>
  );
}
