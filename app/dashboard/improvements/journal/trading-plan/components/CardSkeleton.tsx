import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CardSkeleton() {
  return (
    <Card className="w-full min-w-fit max-w-[300px] overflow-hidden">
      <CardContent className="p-2">
        <div className="pl-4">
          <Skeleton className="h-4 w-24 mb-2" />
        </div>
        <div className="pl-4 pt-1 pr-4">
          <Skeleton className="h-8 w-40 mb-2" />
        </div>
        <div className="pl-4">
          <Skeleton className="h-8 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

