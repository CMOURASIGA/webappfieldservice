export default function HomeCardSkeleton() {
  return (
    <div className="h-44 w-full md:w-1/5  rounded-xl border border-gray-200 animate-pulse bg-white py-10 flex flex-col items-center justify-content-center shadow-sm">
      <div className="h-10 w-1/3 mx-auto rounded-md bg-gray-200 mb-4 " />
      <div className="h-5 w-2/3 mx-auto rounded-md bg-gray-200 mb-2" />
    </div>
  );
}
