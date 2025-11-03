import type { ReactNode } from 'react';

interface SectionSkeletonProps {
  children: ReactNode;
  className?: string;
}

function SectionSkeleton({ children, className = "" }: SectionSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 pt-12 h-auto">
      <div className="container max-w-5xl mx-auto px-4 text-center pb-8">
        <div className="h-12 md:h-16 lg:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 mx-auto w-3/4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 mx-auto max-w-3xl"></div>
        <div className="flex justify-center items-center gap-4">
          <div className="flex -space-x-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-zinc-800"
              />
            ))}
          </div>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolSkeleton() {
  return (
    <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
      <div className="container max-w-5xl mx-auto px-4 mb-10">
        <div className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Input Area */}
            <div className="flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 w-1/3"></div>
              <div className="w-full h-48 md:h-64 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
            </div>
            {/* Output Area */}
            <div className="flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 w-1/3"></div>
              <div className="w-full h-48 md:h-64 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentSectionSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 mx-auto w-1/2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 mx-auto max-w-3xl"></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-lg">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  HeroSkeleton,
  ToolSkeleton,
  ContentSectionSkeleton,
  SectionSkeleton,
};