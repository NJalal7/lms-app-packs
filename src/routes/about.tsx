import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Database, Fingerprint, Rocket, ShieldCheck, type LucideIcon } from 'lucide-react'
import { appConfig } from '@/config/app'
import { useAppContext } from '@/server/context'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'app-packs-ui'

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
            {demoMode ? 'Sample data' : 'Live data'}
          </Badge>
          <Badge variant={authEnabled ? 'primary' : 'outline'}>
            {authEnabled ? 'Identity on' : 'Identity off'}
          </Badge>
        </div>
        <p className="max-w-3xl text-muted-foreground">
          This app works right out of the box with sample data. When you're ready to go live, it can
          connect to a real database and require people to sign in.
        </p>
      </div>

      <Alert>
        <Rocket className="size-4" />
        <AlertTitle>Publish without connecting GitHub</AlertTitle>
        <AlertDescription>
          Use the Deploy button to publish this app to Netlify — no GitHub account or code experience
          needed.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          icon={Database}
          title="Sample data"
          description={
            demoMode
              ? "You're currently viewing sample data that resets each time the app restarts."
              : "You're currently viewing real, saved data from a connected database."
          }
        >
          <p>
            Sample mode is great for trying things out — nothing you do here is saved permanently.
            Connecting a real database is a one-time setup step your developer can turn on when
            you're ready to keep real records.
          </p>
        </InfoCard>

        <InfoCard
          icon={Fingerprint}
          title="Identity"
          description={
            authEnabled
              ? user
                ? `Signed in as ${user.email ?? user.id}.`
                : "Identity is turned on, but nobody's signed in right now."
              : "Identity isn't turned on for this app yet."
          }
        >
          <p>
            When your developer turns on Identity, people will need an account to use this app, and you
            can control what each person is allowed to do.
          </p>
        </InfoCard>

        <InfoCard
          icon={ShieldCheck}
          title="Permissions"
          description="Screens hide options you're not allowed to use, but the real check happens behind the scenes too."
        >
          <p>
            Every action is double-checked on the server, not just hidden from view — so permissions
            can't be bypassed by changing what's shown on screen.
          </p>
        </InfoCard>

        <InfoCard
          icon={Rocket}
          title="Publishing"
          description="You can publish this app any time, without setting up GitHub."
        >
          <p>Use the Deploy button to publish your changes — no code experience needed.</p>
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
