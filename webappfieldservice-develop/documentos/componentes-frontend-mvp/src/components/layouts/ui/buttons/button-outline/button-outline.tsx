export function ButtonOutline(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      type="button"
      className="flex flex-row items-center gap-2 relative px-3 py-2 text-[#00247d]
             bg-white rounded-lg border border-gray-200 
              hover:text-gray-900 shadow-sm transition-all
               hover:bg-gray-200 text-xs font-medium"
      {...props}
    />
  );
}
