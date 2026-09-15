import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { requireRole } from '@/auth/server'
import { listAudit } from '@/data/audit'
import { Card, CardContent, CardHeader, CardTitle, EmptyState } from '@netlify-labs/app-pack-ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingState } from '@/components/states/loading-state'
import { ErrorState } from '@/components/states/error-state'

// Route-local server fn (not shared elsewhere, so it lives next to the one
// route that uses it rather than in src/server/). `requireRole('admin')`
// is the actual authorization check — the route guard below is just UX.
const listAuditServer = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole('admin')
  return listAudit()
})

export const Route = createFileRoute('/_app/admin/audit')({
  loader: () => listAuditServer(),
  pendingComponent: () => <LoadingState variant="table" />,
  errorComponent: ({ error }) => (
    <ErrorState message={error instanceof Error ? error.message : 'Failed to load audit log'} />
  ),
  component: AuditPage,
})

function AuditPage() {
  const entries = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <p className="text-muted-foreground">Every mutation, with actor and before/after state.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <EmptyState
              title="No audit entries yet"
              description="Mutations will appear here once auth is on."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{entry.actorEmail ?? 'unknown'}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>
                      {entry.entity} ({entry.entityId.slice(0, 8)})
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
