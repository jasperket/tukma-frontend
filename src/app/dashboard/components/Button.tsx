import React from "react";

type ButtonProps = {
  children: React.ReactNode;
};

export default function Button({ children }: ButtonProps) {
  return (
    <button className="ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-400/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
      {children}
    </button>
  );
}
