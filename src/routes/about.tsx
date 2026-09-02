import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Database, Fingerprint, Rocket, ShieldCheck, type LucideIcon } from 'lucide-react'
import { appConfig } from '@/config/app'
import { useAppContext } from '@/server/context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  const { authEnabled, demoMode, user } = useAppContext()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">About {appConfig.productName}</h1>
          <Badge variant={demoMode ? 'secondary' : 'outline'}>
            {demoMode ? 'Demo data' : 'Database backed'}
          </Badge>
          <Badge variant={authEnabled ? 'default' : 'outline'}>
            {authEnabled ? 'Identity on' : 'Identity off'}
          </Badge>
        </div>
        <p className="max-w-3xl text-muted-foreground">
          This starter is designed to run immediately, then graduate to real data and Netlify Identity
          when a fork is ready for production.
        </p>
      </div>

      <Alert>
        <Rocket className="size-4" />
        <AlertTitle>Deploy without connecting GitHub</AlertTitle>
        <AlertDescription>
          Use the fixed Netlify button to open Netlify Drop, or deploy from this folder with{' '}
          <code>netlify deploy --build --prod</code>. Both paths avoid GitHub; this repo already has
          the required <code>netlify.toml</code> settings.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          icon={Database}
          title="Demo mode"
          description={
            demoMode
              ? 'The current app is using in-memory records that reset on cold start.'
              : 'The current app is reading and writing through the configured database path.'
          }
        >
          <p>
            <code>DEMO_MODE</code> is the single switch for data source behavior. Leave it unset or set
            to <code>true</code> for demos. Set it to <code>false</code> after provisioning Netlify
            Database and applying migrations.
          </p>
        </InfoCard>

        <InfoCard
          icon={Fingerprint}
          title="Identity"
          description={
            authEnabled
              ? user
                ? `Signed in as ${user.email ?? user.id}.`
                : 'Identity is enabled, but no user is signed in.'
              : 'Identity is disabled, so the app does not require sign-in.'
          }
        >
          <p>
            <code>AUTH_ENABLED</code> is the single switch for real authentication. When enabled,
            Netlify Identity supplies the user session and role metadata.
          </p>
        </InfoCard>

        <InfoCard
          icon={ShieldCheck}
          title="Authorization"
          description="Route guards are for user experience; server functions enforce the boundary."
        >
          <p>
            Mutations and protected reads call <code>requireUser()</code> or <code>requireRole()</code>{' '}
            before touching data, so authorization does not depend on a client-side redirect.
          </p>
        </InfoCard>

        <InfoCard
          icon={Rocket}
          title="Deployment"
          description="Manual deploys work without connecting a Git provider."
        >
          <p>
            For a production deploy from local code, run <code>netlify deploy --build --prod</code>.
            For a dashboard-first manual deploy, open Netlify Drop while signed in and drop this
            project folder so Netlify can run the configured build.
          </p>
        </InfoCard>
      </div>
    </div>
  )
}

type InfoCardProps = {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}

function InfoCard({ icon: Icon, title, description, children }: InfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">{children}</CardContent>
    </Card>
  )
}
