import { useEffect, useState } from 'react'
import {
  login,
  signup,
  logout,
  oauthLogin,
  getSettings,
  handleAuthCallback,
  type AuthProvider,
  type Settings,
} from '@netlify/identity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { useSubmission } from '@/lib/submission'

/**
 * Runs `handleAuthCallback()` once on mount to process OAuth redirects,
 * email confirmations, password recovery, and invite links. Only meaningful
 * when auth is enabled; call unconditionally from `__root.tsx` — it no-ops
 * when there's no auth hash to process.
 */
export function useAuthCallback(authEnabled: boolean) {
  useEffect(() => {
    if (!authEnabled) return
    handleAuthCallback()
      .then((result) => {
        if (!result) return
        if (result.type === 'invite' || result.type === 'recovery') {
          // A downstream fork can route these to a dedicated
          // set-password screen; the starter just lands on the dashboard.
          window.location.href = '/'
          return
        }
        if (result.type === 'oauth' || result.type === 'confirmation' || result.type === 'email_change') {
          window.location.href = '/'
        }
      })
      .catch(() => {
        // No auth hash present, or the token was invalid — nothing to do.
      })
  }, [authEnabled])
}

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await logout()
        window.location.href = '/login'
      }}
    >
      Log out
    </Button>
  )
}

const PROVIDER_LABELS: Record<AuthProvider, string> = {
  google: 'Google',
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
  facebook: 'Facebook',
  email: 'Email',
}

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => setSettings(null))
  }, [])

  const { state, run } = useSubmission(async () => {
    const user = mode === 'login' ? await login(email, password) : await signup(email, password)
    // Full reload (not router navigate): the auth session lives in
    // cookies/localStorage that the router's client-side state doesn't
    // know about, so a real navigation is required to pick it up.
    window.location.href = '/'
    return user
  })

  const oauthProviders = settings
    ? (Object.keys(settings.providers) as Array<AuthProvider>).filter(
        (p) => p !== 'email' && settings.providers[p],
      )
    : []

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">{mode === 'login' ? 'Log in' : 'Create an account'}</h1>
        <p className="text-sm text-muted-foreground">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          run()
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {state.status === 'error' ? <FieldError>{state.error}</FieldError> : null}
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={state.status === 'submitting'}>
          {state.status === 'submitting' ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </Button>
      </form>

      {oauthProviders.length > 0 ? (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <Separator className="flex-1" />
          </div>
          <div className="grid gap-2">
            {oauthProviders.map((provider) => (
              <Button key={provider} type="button" variant="outline" onClick={() => oauthLogin(provider)}>
                {PROVIDER_LABELS[provider]}
              </Button>
            ))}
          </div>
        </>
      ) : null}

      <FieldDescription className="text-center">
        Local dev tip: Identity doesn't work outside a Netlify deploy. Set{' '}
        <code>
          AUTH_DEV_USER='{'{'}"email":"you@example.com","roles":["admin"]{'}'}'
        </code>{' '}
        instead.
      </FieldDescription>
    </div>
  )
}
