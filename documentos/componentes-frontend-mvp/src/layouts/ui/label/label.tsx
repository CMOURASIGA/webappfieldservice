import Link from "next/link";
import React from "react";

export type LabelProps = {
  label: string;
  value?: string | null | React.ReactElement;
  url?: string;
};

const Label: React.FC<LabelProps> = ({ label, value, url }) => {
  return (
    <div key={label}>
      <div className="text-primary text-sm font-bold leading-4 mb-2">
        {label}
      </div>
      <div className="flex flex-row gap-2 items-center justify-start text-gray-900 font-medium text-sm">
        {value ?? "-"}
        {url && (
          <Link href={url} data-testid="external-link-icon">
            <svg
              xmlns="http:www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Label;
