import { Skeleton } from "@/components/ui/skeleton"

export function FormEditSkeleton() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header Mirror */}
            <div className="px-6 py-8 space-y-3 bg-white border-b">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Form Mirror */}
            <div className="px-6 py-8">
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                            <Skeleton className="h-11 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function EventFormSkeleton() {
    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">
            {/* Header Mirror */}
            <div className="px-6 py-10 space-y-3 bg-white border-b">
                <Skeleton className="h-12 w-1/3 min-w-[300px]" />
                <Skeleton className="h-4 w-1/2 max-w-[500px]" />
            </div>

            {/* Tabs Mirror */}
            <div className="px-6 py-8">
                <div className="flex gap-2 border-b border-zinc-200 mb--px">
                     <Skeleton className="h-10 w-40 rounded-t-lg rounded-b-none" />
                     <Skeleton className="h-10 w-40 rounded-t-lg rounded-b-none bg-zinc-100" />
                     <Skeleton className="h-10 w-40 rounded-t-lg rounded-b-none bg-zinc-100" />
                </div>

                <div className="bg-white border-x border-b rounded-b-xl p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        <div className="md:col-span-8 space-y-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-14 w-full" />
                        </div>
                        <div className="md:col-span-4 space-y-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-14 w-full" />
                        </div>

                        <div className="md:col-span-4 space-y-3">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                        <div className="md:col-span-4 space-y-3">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                        <div className="md:col-span-4 space-y-3">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-11 w-full" />
                        </div>

                        <div className="md:col-span-12 space-y-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <Skeleton className="h-12 w-40" />
                    </div>
                </div>
            </div>
        </div>
    )
}
