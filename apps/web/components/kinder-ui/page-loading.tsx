import { Skeleton } from '@kit/ui/skeleton';

export function PageLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-56 rounded-xl" />
        <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-28 rounded-xl" key={index} />
        ))}
      </div>

      <Skeleton className="h-12 w-full max-w-md rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export function TableLoading({ rows = 6 }: { rows?: number }) {
  return (
    <div className="kinder-data-table overflow-hidden p-1">
      <div className="flex flex-col gap-0">
        <Skeleton className="mx-4 mt-4 h-10 rounded-xl" />
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton className="mx-4 my-2 h-12 rounded-xl" key={index} />
        ))}
      </div>
    </div>
  );
}
