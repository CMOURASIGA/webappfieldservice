interface IHeadingProps {
  title: string;
}

export function Heading({ title }: IHeadingProps) {
  return (
    <h2 className="text-lg text-[#00247d] font-semibold mb-4">
      {title}
    </h2>
  );
}