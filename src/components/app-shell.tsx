import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ExternalLink, Rocket } from 'lucide-react'
import { appConfig } from '@/config/app'
import { useAppContext } from '@/server/context'
import { ModeToggle } from '@/components/mode-toggle'
import { LogoutButton } from '@/auth/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * App-wide chrome: header, nav, and content container. Reads branding from
 * `src/config/app.ts` only — never hardcode a product name here.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { authEnabled, demoMode, user } = useAppContext()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src={appConfig.logo.src} alt={appConfig.logo.alt} className="size-6" />
            <span className="hidden sm:inline">{appConfig.productName}</span>
          </Link>

          <nav className="flex items-center gap-3 text-sm text-muted-foreground sm:gap-4">
            {appConfig.nav.primary.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="hover:text-foreground [&.active]:font-medium [&.active]:text-foreground"
                activeProps={{ className: 'active' }}
              >
                {item.label}
              </Link>
            ))}
            {authEnabled && user?.roles?.includes('admin')
              ? appConfig.nav.admin.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="hover:text-foreground [&.active]:font-medium [&.active]:text-foreground"
                    activeProps={{ className: 'active' }}
                  >
                    {item.label}
                  </Link>
                ))
              : null}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {demoMode ? (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Demo mode
              </Badge>
            ) : null}
            <ModeToggle />
            {authEnabled ? (
              user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
                  <LogoutButton />
                </div>
              ) : (
                <Link to="/login" className="text-sm font-medium hover:underline">
                  Log in
                </Link>
              )
            ) : null}
          </div>
        </div>
      </header>

      <main className={cn('mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-36')}>{children}</main>
      <NetlifyDeployCard />
    </div>
  )
}

function NetlifyDeployCard() {
  return (
    <Card className="fixed right-4 bottom-4 z-50 w-[calc(100vw-2rem)] max-w-xs shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <CardContent className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Rocket className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Deploy to Netlify</p>
          <p className="text-xs text-muted-foreground">No GitHub required.</p>
        </div>
        <Button asChild size="sm">
          <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer">
            Deploy
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
