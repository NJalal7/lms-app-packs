import { createFileRoute, Link } from '@tanstack/react-router'
import { PlusCircle, Inbox } from 'lucide-react'
import { listRecordsServer, recordStatusValues } from '@/server/records'
import type { RecordRow } from '@/db/schema'
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/states/empty-state'
import { LoadingState } from '@/components/states/loading-state'
import { ErrorState } from '@/components/states/error-state'

export const Route = createFileRoute('/_app/records/')({
  loader: () => listRecordsServer(),
  pendingComponent: () => <LoadingState variant="table" />,
  errorComponent: ({ error }) => (
    <ErrorState message={error instanceof Error ? error.message : 'Failed to load records'} />
  ),
  component: RecordsPage,
})

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  draft: 'secondary',
  done: 'outline',
  archived: 'outline',
}

const columns: Array<DataTableColumn<RecordRow>> = [
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => (
      <Link to="/records/$id" params={{ id: row.original.id }} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ getValue }) => {
      const status = getValue<string>()
      return <Badge variant={statusVariant[status] ?? 'secondary'}>{status}</Badge>
    },
    filterFn: (row, columnId, filterValue) => row.getValue(columnId) === filterValue,
  },
  {
    accessorKey: 'owner',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ getValue }) => `$${Number(getValue<string>()).toLocaleString()}`,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due date" />,
    cell: ({ getValue }) => {
      const value = getValue<string | null>()
      return value ? new Date(value).toLocaleDateString() : '—'
    },
  },
]

function RecordsPage() {
  const records = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Records</h1>
          <p className="text-muted-foreground">Sort, filter, and search all records.</p>
        </div>
        <Button asChild>
          <Link to="/records/new">
            <PlusCircle className="size-4" />
            New record
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={records}
        searchPlaceholder="Search records..."
        filterableColumns={[
          {
            id: 'status',
            title: 'Status',
            options: recordStatusValues.map((s) => ({ label: s, value: s })),
          },
        ]}
        emptyState={
          <EmptyState
            icon={Inbox}
            title="No records"
            description="Create your first record to get started."
            action={
              <Button asChild size="sm">
                <Link to="/records/new">New record</Link>
              </Button>
            }
          />
        }
      />
    </div>
  )
}
