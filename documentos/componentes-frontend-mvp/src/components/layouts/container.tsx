import { HtmlHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = HtmlHTMLAttributes<HTMLDivElement>;

export function Container({ className, ...rest }: ContainerProps) {
  return <div className={cn("container px-4 md:px-6", className)} {...rest} />;
}
