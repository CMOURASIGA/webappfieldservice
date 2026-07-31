import { Button } from "@cnc-ti/layout-basic";
import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

type ButtonLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const ButtonLink = ({ href, label, icon, ...rest }: ButtonLinkProps) => {
  return (
    <Button
      className="h-44 w-full md:w-1/5 text-wrap hover:text-blue-800"
      variant="outline"
      {...rest}
    >
      <Link
        className="p-0 flex flex-col items-center justify-content-center"
        href={href}
      >
        {icon && <i className={`fa-solid ${icon} fa-4x mb-2`} />}
        <h1 className="text-sm font-bold w-full text-black">{label}</h1>
      </Link>
    </Button>
  );
};
