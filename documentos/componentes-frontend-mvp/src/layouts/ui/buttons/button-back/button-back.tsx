"use client";
import ArrowLeftIcon from "../../icons/arrow-left";
import { useRouter } from "next/navigation";

export function ButtonBack() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      type="button"
      className="flex flex-col items-center justify-center text-center relative px-2 py-2 text-[#00247d]
             bg-white rounded-lg border border-gray-200 
              hover:text-gray-900 shadow-xs 
               hover:bg-gray-200"
    >
      <ArrowLeftIcon />
    </button>
  );
}
