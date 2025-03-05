import { LogOutButton } from "~/app/applicant/components/LogOutButton";
import Image from "next/image";

export default function RecruiterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="bg-primary-300 pt-1"></div>
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between pt-8">
          <Image
            src={"/logo.png"}
            alt="Tukma Logo"
            width={990}
            height={245}
            className="h-8 w-auto"
          />
          <div>
            <LogOutButton />
          </div>
        </header>
        {children}
      </div>
    </>
  );
}
