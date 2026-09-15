import { Link } from '@tanstack/react-router'
import { Button, NotFoundState } from '@netlify-labs/app-pack-ui'

/** Used as the router's `defaultNotFoundComponent`. */
export function NotFound() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <NotFoundState
        action={
          <Button asChild size="sm">
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
