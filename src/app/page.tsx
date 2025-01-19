import Image from "next/image";
import logo from "../../public/logo.png";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <>
      <div className="bg-primary-300 pt-1"></div>
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between pt-8">
          <Image src={logo} alt="Tukma Logo" className="h-12 w-auto" />
          <div>
            <Button className="bg-primary-300 hover:bg-primary-400">
              Log in
            </Button>
            <Button variant={"link"}>Sign up</Button>
          </div>
        </header>
        <main className="flex min-h-[700px] flex-col items-center justify-center text-center">
          <h1 className="text-text-100 font-serif text-6xl font-bold">
            We make work <span className="text-primary-300">work</span>.
          </h1>
          <div className="p-2"></div>
          <p className="max-w-prose text-lg">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates
            recusandae aperiam expedita odio nemo mollitia quod ducimus eaque
            quisquam quos reprehenderit dignissimos veritatis necessitatibus,
            laudantium illum dolorum quidem consequatur deserunt?
          </p>
        </main>
      </div>
    </>
  );
}
