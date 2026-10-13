import type { ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CircleCheck, CircleHelp, GraduationCap, ListChecks, type LucideIcon } from 'lucide-react'
import { appConfig } from '@/config/app'
import { useAppContext } from '@/server/context'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'app-packs-ui'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: `About · ${appConfig.productName}` }] }),
  component: AboutPage,
})

function AboutPage() {
  const { demoMode } = useAppContext()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">About {appConfig.productName}</h1>
          {demoMode ? <Badge variant="secondary">Sample data</Badge> : null}
        </div>
        <p className="max-w-3xl text-muted-foreground">
          {appConfig.productName} is Acme’s learning portal for every employee — whatever your team or role.
          It’s where you get to know how we work and get set up with the tools you need to do your best work.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          icon={GraduationCap}
          title="Courses for everyone"
          description="Short, practical courses on the things every Acme employee needs to know."
        >
          <p>Start with our mission, values, and culture, then set up your workspace and essential tools.</p>
        </InfoCard>

        <InfoCard
          icon={ListChecks}
          title="Learn at your own pace"
          description="Each course is a checklist of lessons with an estimated time and priority."
        >
          <p>Work through high-priority lessons first. You don’t need to finish everything in one sitting.</p>
        </InfoCard>

        <InfoCard
          icon={CircleCheck}
          title="Your progress is saved"
          description="Tick off lessons as you go and pick up right where you left off."
        >
          <p>Your dashboard shows what’s in progress, what’s next, and what you’ve completed.</p>
        </InfoCard>

        <InfoCard
          icon={CircleHelp}
          title="Help when you need it"
          description="Not sure about something? You’re never on your own."
        >
          <ul className="space-y-1">
            {appConfig.learning.helpContacts.map((c) => (
              <li key={c.topic}>
                <span className="font-medium text-foreground">{c.topic}:</span>{' '}
                <a href={`mailto:${c.detail}`} className="text-primary underline-offset-4 hover:underline">
                  {c.contact}
                </a>
              </li>
            ))}
          </ul>
        </InfoCard>
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link to="/">Go to my learning</Link>
        </Button>
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
          <div
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
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
