/**
 * Single source of truth for product branding.
 *
 * Downstream forks (HR, Finance, etc.) should only need to edit THIS file to
 * rebrand the app. Nothing else in the codebase should hardcode a product
 * name, tagline, or color — grep for them before adding new UI copy.
 */
export const appConfig = {
  productName: 'Acme Academy',
  tagline: 'The learning portal for everyone at Acme.',
  logo: {
    // Path relative to /public. Swap the file and keep the same path, or
    // change the path here.
    src: '/logo.svg',
    alt: 'Acme Academy logo',
  },
  colors: {
    // HSL channel triples (no `hsl()` wrapper) so they can be interpolated
    // directly into CSS custom properties for both light and dark themes.
    // Teal primary — 30% lightness keeps white text above WCAG AA (4.5:1).
    light: {
      primary: '173 70% 28%',
      primaryForeground: '0 0% 100%',
    },
    dark: {
      primary: '170 60% 55%',
      primaryForeground: '200 50% 10%',
    },
  },
  nav: {
    primary: [
      { label: 'My learning', to: '/' as const },
      { label: 'Course catalog', to: '/courses' as const },
      { label: 'About', to: '/about' as const },
    ],
    // Shown to `learning.managerRoles` (see below).
    manager: [
      { label: 'Manage courses', to: '/manage/courses' as const },
      { label: 'Team progress', to: '/manage/progress' as const },
    ],
    admin: [
      { label: 'Audit log', to: '/admin/audit' as const },
      { label: 'Usage events', to: '/admin/events' as const },
    ],
  },
  // The role required to see the built-in demo admin section (audit log,
  // usage events) and its nav links above. This is the only hardcoded role
  // name in the base template — change it to whatever your vertical's
  // taxonomy calls its top role, or remove the admin section entirely. See
  // README > Roles for the generic RBAC mechanism this plugs into.
  adminRole: 'admin',
  // Roles allowed to upload/download files via `/api/upload` and
  // `/api/files/:key` (see `netlify/functions/upload.mts` /
  // `netlify/functions/files.mts`). Defaults to `[]` ("not configured
  // yet"), which makes both endpoints fail-closed with 403 even when
  // Netlify Identity auth is enabled — these endpoints touch real Netlify Blobs storage,
  // so they never fall back to a guessed role like `adminRole`. Set this to
  // your vertical's own attachment roles, e.g. `['admin', 'recruiter']`.
  // See README > Uploads.
  uploadAllowedRoles: [] as string[],
  // Learning hub copy and permissions. Edit freely when forking — this is
  // content, not code.
  learning: {
    // Roles allowed to create/edit/publish courses and view the team
    // progress report. Every signed-in user can take published courses.
    managerRoles: ['admin', 'hr_admin'] as string[],
    welcomeTitle: 'Welcome back',
    welcomeSubtitle: 'Complete your learning checklist to get started.',
    gettingStarted: [
      'Acme Academy is where every Acme employee learns how we work — from our mission, values, and culture to setting up the systems and tools you’ll use every day.',
      'Each course is a short checklist of lessons. Open the linked resource, work through it, and tick the lesson off. Your progress saves automatically, so you can come back any time.',
    ],
    tips: [
      'Start with lessons marked high priority, then move to medium and low.',
      'Required lessons are marked with an asterisk (*); optional ones deepen your knowledge.',
      'Spread lessons out over your first few weeks — understanding beats speed.',
      'Bookmark resources you’ll want to reference on the job.',
      'Questions? Ask your manager or reach out to the contacts under “Need help?”.',
    ],
    helpContacts: [
      {
        topic: 'Questions about a course',
        contact: 'Acme Academy team',
        detail: 'learning@example.com',
      },
      {
        topic: 'Policies, benefits & your role',
        contact: 'Your manager or People team',
        detail: 'people@example.com',
      },
      { topic: 'Accounts, devices & tool access', contact: 'IT help desk', detail: 'helpdesk@example.com' },
    ],
  },
} as const

export type AppConfig = typeof appConfig
