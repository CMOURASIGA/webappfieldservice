"use client";

interface LoaderProps {
  children?: string;
}

export default function Loader({ children }: LoaderProps) {
  return (
    <div className="flex flex-row items-center">
      <div
        className="
          w-5 h-5 
          border-2 border-gray-300 border-t-gray-600 
          rounded-full 
          animate-spin 
          mr-2
        "
      ></div>
      {children && <div>{children}</div>}
    </div>
  );
}
