import { createStart } from '@tanstack/react-start'

// Global TanStack Start configuration hook. Empty for now — this is the
// documented place to register global request middleware (e.g. logging,
// request-scoped context) as the app grows. See:
// https://tanstack.com/start/latest/docs/framework/react/middleware
export const startInstance = createStart(() => {
  return {}
})
