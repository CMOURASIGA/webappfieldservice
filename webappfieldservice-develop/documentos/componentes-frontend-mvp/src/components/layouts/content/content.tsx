type ContentProps = {
  children: React.ReactNode;
};

export function Content({ children }: ContentProps) {
  return (
    <div
      data-testid="content-component"
      className="lg:w-2/3 md:w-2/2 w-full mx-auto"
    >
      {children}
    </div>
  );
}
