import Image from "next/image";
import logo from "../../public/logo.png";
import AuthDialog from "./components/AuthDialog";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <>
      <div className="bg-primary-300 pt-1"></div>

      {/* Header - full width sticky */}
      <header className="sticky top-0 z-50 bg-background-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Image src={logo} alt="Tukma Logo" className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <AuthDialog defaultTab="login">
              <Button className="bg-primary-300 hover:bg-primary-400">
                Log in
              </Button>
            </AuthDialog>
            <AuthDialog defaultTab="signup">
              <Button
                variant="link"
                className="text-text-200 hover:text-text-100"
              >
                Sign up
              </Button>
            </AuthDialog>
          </div>
        </div>
      </header>

      {/* Hero - constrained width */}
      <div className="mx-auto max-w-7xl">
        <main>
          <section className="flex min-h-screen items-center justify-center px-6 text-center">
            <div className="mx-auto max-w-4xl">
              <h1 className="font-serif text-6xl font-bold leading-tight text-text-100 md:text-7xl lg:text-8xl">
                We make work <span className="text-primary-300">work</span>.
              </h1>
              <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-text-200 md:text-2xl">
                Tukma revolutionizes talent acquisition with AI-powered
                interviewing and resume analysis. Match the right candidates
                with the right opportunities.
              </p>
              <div className="mt-12 flex justify-center">
                <AuthDialog defaultTab="signup">
                  <Button
                    size="lg"
                    className="bg-primary-300 px-8 py-4 text-lg text-white hover:bg-primary-400"
                  >
                    Get Started Free
                  </Button>
                </AuthDialog>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Features Section - full width dark background */}
      <section className="flex min-h-screen items-center bg-background-50">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center font-serif text-4xl font-bold text-text-900 md:text-5xl">
            The Future of Recruitment
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-300">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-text-900">
                AI-Powered Interviews
              </h3>
              <p className="leading-relaxed text-text-800">
                Intelligent interviewing system that adapts to each candidate,
                asking relevant questions and providing unbiased assessments.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-300">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-text-900">
                Resume Analysis
              </h3>
              <p className="leading-relaxed text-text-800">
                Advanced parsing and matching algorithms that identify the best
                candidates based on skills, experience, and cultural fit.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-300">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-text-900">
                Better Outcomes
              </h3>
              <p className="leading-relaxed text-text-800">
                Reduce time-to-hire by 60%, eliminate unconscious bias, and
                improve candidate satisfaction with our streamlined process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - light background */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 font-serif text-4xl font-bold text-text-100 md:text-5xl">
            Ready to Transform Your Hiring?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-text-200">
            Use Tukma to find better candidates faster. Start your free trial
            today.
          </p>
          <div className="flex justify-center">
            <AuthDialog defaultTab="signup">
              <Button
                size="lg"
                className="bg-primary-300 px-8 py-4 text-lg text-white hover:bg-primary-400"
              >
                Try now!
              </Button>
            </AuthDialog>
          </div>
        </div>
      </section>

      {/* Footer - constrained width */}
      <div className="mx-auto max-w-7xl">
        <footer className="border-t border-background-200 px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <Image src={logo} alt="Tukma Logo" className="h-6 w-auto" />
                <p className="mt-2 text-text-300">
                  The future of recruitment is here.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
