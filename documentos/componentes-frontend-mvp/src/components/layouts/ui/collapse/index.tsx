import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@cnc-ti/layout-basic";
export interface CollapseProps {
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  defaultActive?: boolean;
  onChange?: (active: boolean) => void;
}
const CustomCollapse: React.FC<CollapseProps> = ({
  title,
  children,
  defaultActive = false,
}) => {
  const [open, setOpen] = useState(defaultActive);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
      <div className="text-center lg:text-left w-full flex justify-between">
        {title}
        <CollapsibleTrigger asChild>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            id="chevron-down"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`inline-block transition-transform duration-300 cursor-pointer ease-in-out text-gray-300  ${
              open ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent
        className="w-full"
        style={{ paddingTop: 12, width: "100%" }}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
export default CustomCollapse;
