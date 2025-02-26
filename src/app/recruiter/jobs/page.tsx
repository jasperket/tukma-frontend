import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
  return (
    <>
      <div className="p-6"></div>
      <main className="px-6">
        <div>
          <h1 className="font-serif text-5xl font-bold text-text-200">
            Your Jobs
          </h1>
        </div>
        <div className="p-2"></div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search jobs..."
              className="border-text-200 bg-background-950 pl-9 text-text-100 placeholder:text-text-400"
            />
          </div>
          <Button className="bg-primary-300 hover:bg-primary-400">
            Search
          </Button>
        </div>
        <div className="p-2"></div>
        <Link href="/recruiter/jobs/create">
          <Button className="flex items-center gap-2 bg-primary-300 hover:bg-primary-400">
            <Plus className="h-4 w-4" />
            Create a Job
          </Button>
        </Link>
      </main>
    </>
  );
}
