"use client";

import { cn } from "@/lib/utils";
import { useSmartBack } from "@/hooks/use-smart-back";
import ArrowLeftIcon from "../../icons/arrow-left";
import { useRouter } from "next/navigation";

type ButtonBackProps = {
  url?: string;
  /** Só mostra voltar se a entrada foi pelo link da agenda (sessionStorage). */
  gateFromAgenda?: boolean;
  className?: string;
};

export function ButtonBack({
  url,
  gateFromAgenda = false,
  className,
}: ButtonBackProps) {
  const router = useRouter();
  const { goBackSafe, canGoBack } = useSmartBack(
    gateFromAgenda ? { gateFromAgenda: true } : undefined,
  );

  if (!url && !canGoBack) return null;

  const handleClick = () => {
    if (url) {
      router.push(url);
    } else {
      goBackSafe();
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={cn(
        "flex flex-col items-center justify-center text-center relative px-2 py-2 text-[#00247d] bg-white rounded-lg border border-gray-200 hover:text-gray-900 shadow-xs hover:bg-gray-200",
        className,
      )}
    >
      <ArrowLeftIcon />
    </button>
  );
}
