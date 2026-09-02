import type { Config, Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { getUser } from '@netlify/identity'
import { isAuthEnabled } from '../../src/config/flags'

export default async (req: Request, context: Context) => {
  if (isAuthEnabled()) {
    const user = await getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const key = context.params.key
  if (!key) {
    return new Response('Not found', { status: 404 })
  }

  const store = getStore('uploads')
  const result = await store.getWithMetadata(key, { type: 'stream' })

  if (!result) {
    return new Response('Not found', { status: 404 })
  }

  const contentType = (result.metadata?.type as string | undefined) ?? 'application/octet-stream'

  return new Response(result.data, {
    headers: { 'Content-Type': contentType },
  })
}

export const config: Config = {
  path: '/api/files/:key',
  method: 'GET',
}
