export function Skeleton({ className = '' }) {
  return <div className={`uiSkeleton ${className}`} aria-hidden="true" />
}

export function PageSkeleton() {
  return <div className="uiPageSkeleton" aria-label="Loading">
    <Skeleton className="uiSkeleton--title" />
    <div className="uiSkeletonGrid">
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
    <Skeleton className="uiSkeleton--panel" />
  </div>
}
