import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function UserSetupsListSkeleton() {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle><Skeleton className="h-12 w-52" /></CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto pr-2 space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-1/3" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <Skeleton className="h-4 w-1/4 mt-2" />
              <div className="mt-2 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

