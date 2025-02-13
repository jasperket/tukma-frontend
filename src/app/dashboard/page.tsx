"use client";

import React, { useEffect, useState } from "react";
import ApplicantPage from "./components/Applicant";
import EmployerPage from "./components/Employer";

export default function DashboardPage() {
  const [isRecruiter, setIsRecruiter] = useState<boolean | null>(null);

  useEffect(() => {
    const isRecruiter = localStorage.getItem("isRecruiter") === "true";
    setIsRecruiter(isRecruiter);
  }, []);

  return (
    <>
      {isRecruiter === false && <ApplicantPage />}
      {isRecruiter === true && <EmployerPage />}
      {isRecruiter === null && <div>Loading...</div>}
    </>
  );
}
