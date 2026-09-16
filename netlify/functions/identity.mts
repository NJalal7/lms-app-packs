import type { UserSignupHandler } from '@netlify/functions'
import { getDefaultRole } from '../../src/config/flags'

/**
 * Netlify Identity signup event hook. Assigns `DEFAULT_ROLE` to every new
 * user's `app_metadata.roles` at signup time, so a vertical never has to
 * manually assign a starting role to every signup from the Identity
 * dashboard.
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
  const role = getDefaultRole()
  return {
    user: {
      ...event.user,
      appMetadata: { ...event.user.appMetadata, roles: [role] },
    },
  }
}

export default { userSignup }
