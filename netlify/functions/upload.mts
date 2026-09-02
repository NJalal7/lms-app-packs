import { randomUUID } from 'node:crypto'
import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { getUser } from '@netlify/identity'
import { isAuthEnabled } from '../../src/config/flags'

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB — Netlify Functions request body limit.

export default async (req: Request) => {
  if (isAuthEnabled()) {
    const user = await getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const form = await req.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return Response.json({ error: 'No file provided (expected multipart field "file").' }, { status: 400 })
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: 'File exceeds the 4 MB upload limit.' }, { status: 413 })
  }

  const user = isAuthEnabled() ? await getUser() : null
  const key = `${randomUUID()}-${file.name}`

  const store = getStore('uploads')
  await store.set(key, file, {
    metadata: {
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedBy: user?.email ?? 'demo',
    },
  })

  return Response.json({ key, url: `/api/files/${encodeURIComponent(key)}` })
}

export const config: Config = {
  path: '/api/upload',
  method: 'POST',
}
