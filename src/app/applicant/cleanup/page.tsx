"use client";

import { useEffect, useState } from "react";
import { CleanUpDuplicates, cleanUpDuplicates } from "~/app/actions/resume";

export default function CleanUp() {
  const [result, setResult] = useState<CleanUpDuplicates | null>(null);

  useEffect(() => {
    async function cleanUp() {
      const response = await cleanUpDuplicates();

      if (response.success) {
        setResult(response.data!);
      }
    }

    cleanUp();
  }, []);

  return <>{result && <div>{JSON.stringify(result)}</div>}</>;
}
