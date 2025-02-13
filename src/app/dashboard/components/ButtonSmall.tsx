import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
};

export default function Button({ children, isActive, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isActive ? "bg-primary-400 text-white" : "bg-background-800 text-slate-600"}`}
    >
      {children}
    </button>
  );
}
