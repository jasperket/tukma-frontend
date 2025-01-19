import Image from "next/image";
import logo from "../../../public/logo.png";

export default function DashboardPage() {
  return (
    <>
      <div className="bg-primary-300 pt-1"></div>
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between pt-8">
          <Image src={logo} alt="Tukma Logo" className="h-12 w-auto" />
          <div></div>
        </header>
        <main className="flex min-h-[700px] flex-col items-center justify-center text-center">
          <h1 className="text-text-100 font-serif text-6xl font-bold">
            You are logged in!.
          </h1>
        </main>
      </div>
    </>
  );
}
