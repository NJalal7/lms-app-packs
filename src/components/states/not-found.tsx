import { Link } from '@tanstack/react-router'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/states/empty-state'

/** Used as the router's `defaultNotFoundComponent`. */
export function NotFound() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you're looking for doesn't exist or was moved."
        action={
          <Button asChild size="sm">
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
