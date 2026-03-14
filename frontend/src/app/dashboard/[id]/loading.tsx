import React from "react";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className ?? ""}`} />
);

const loading = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Nav Skeleton */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Skeleton className="h-4 w-16 rounded-full" />
          <span className="text-gray-200">/</span>
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Hero Card Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-12 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-2.5 w-14 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>

        {/* Package Details Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Skeleton className="h-3 w-28 rounded-full mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-2.5 w-10 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Skeleton className="h-3 w-12 rounded-full mb-5" />
          <div className="relative pl-5 space-y-7">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gray-100" />

            {[1, 2].map((i) => (
              <div key={i} className="relative">
                {/* Dot */}
                <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-gray-200 ring-2 ring-gray-50" />
                <div className="space-y-2">
                  <Skeleton className="h-2.5 w-14 rounded-full" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <div className="flex gap-3 pt-0.5">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Skeleton */}
        <Skeleton className="h-40 w-full rounded-2xl" />

      </main>
    </div>
  );
};

export default loading;