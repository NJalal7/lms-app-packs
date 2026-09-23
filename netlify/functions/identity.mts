import type { UserSignupHandler } from '@netlify/functions'
import { getDefaultRole, getAllowedSignupDomain } from '../../src/config/flags'

/**
 * Netlify Identity signup event hook. Assigns `DEFAULT_ROLE` to every new
 * user's `app_metadata.roles` at signup time, so a vertical never has to
 * manually assign a starting role to every signup from the Identity
 * dashboard. Also enforces `ALLOWED_SIGNUP_DOMAIN`, if set — see
 * `getAllowedSignupDomain()` (`src/config/flags.ts`) for why that check is
 * optional rather than fail-loud like `DEFAULT_ROLE`.
 *
 * Role membership always lives in `app_metadata` (never `user_metadata`) —
 * `user_metadata` is user-editable via the Identity API, so a role stored
 * there would be a privilege-escalation hole. This hook only ever touches
 * `appMetadata` (the camelCase field name in this event payload, which maps
 * to `app_metadata` in the Identity API).
 *
 * Throws (via `getDefaultRole()`) if `DEFAULT_ROLE` isn't configured, which
 * fails the signup loudly rather than silently assigning a made-up role
 * name. See README > Roles.
 */
const userSignup: UserSignupHandler = (event) => {
  const allowedDomain = getAllowedSignupDomain()
  if (allowedDomain) {
    const emailDomain = event.user.email?.split('@')[1]?.toLowerCase()
    if (emailDomain !== allowedDomain) {
      return event.deny()
    }
  }

  const role = getDefaultRole()
  return {
    user: {
      ...event.user,
      appMetadata: { ...event.user.appMetadata, roles: [role] },
    },
  }
}

export default { userSignup }
