import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function StrategyAreaSkeleton() {
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="p-4 flex-shrink-0">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-grow overflow-hidden">
        <div className="h-[calc(100vh-8rem)] p-4 space-y-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

