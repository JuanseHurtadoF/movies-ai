export const MoviesSkeleton = () => {
  return (
    <div className="flex gap-2 rounded-md overflow-hidden">
      <div className="w-full grid grid-cols-2 gap-2">
        <div className="w-full rounded-md bg-slate-200 text-sm min-h-24"></div>
        <div className="w-full rounded-md bg-slate-200 text-sm min-h-24"></div>
      </div>
    </div>
  )
}
