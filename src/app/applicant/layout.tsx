import { LogOutButton } from "~/app/applicant/components/LogOutButton";
import logo from "../../../public/logo.png";
import Image from "next/image";

export default function ApplicantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="bg-primary-300 pt-1"></div>
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between pt-8">
          <Image src={logo} alt="Tukma Logo" className="h-12 w-auto" />
          <div>
            <LogOutButton />
          </div>
        </header>
        {children}
      </div>
    </>
  );
}
