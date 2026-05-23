import type { ReactNode } from 'react'
import { Badge } from '../../shared/ui/shadcn/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/shadcn/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/ui/shadcn/table'
import { workItems } from './data'

export function WorkTable(props: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title ?? 'File de travail'}</CardTitle>
        <CardDescription>
          {props.description ??
            'Une liste unique et lisible pour qualifier, enqueter et arbitrer.'}
        </CardDescription>
        {props.action ? <CardAction>{props.action}</CardAction> : null}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sujet</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Priorite</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workItems.map((item) => (
              <TableRow key={item.title}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.source}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.priority === 'Critique' ? 'destructive' : 'outline'
                    }
                  >
                    {item.priority}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
