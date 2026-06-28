import { FilePlus2 } from 'lucide-react'
import { Button } from '@shared/ui/shadcn/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { AppLayout } from './app-layout'
import { useResolvedActor } from './session-routing'
import type { Actor, TabConfig } from './types'
import { WorkTable } from './work-table'

export function ActorTabsPage(props: {
  actor: Actor
  title: string
  description: string
  tabs: TabConfig[]
}) {
  const { actor } = useResolvedActor(props.actor)

  return (
    <AppLayout actor={actor} page="subjects">
      <Tabs defaultValue={props.tabs[0]?.value ?? 'global'}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            {props.tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <Icon className="size-4" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          <Button>
            <FilePlus2 />
            Créer
          </Button>
        </div>
        {props.tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <WorkTable actor={actor} title={props.title.replace('.', '')} />
          </TabsContent>
        ))}
      </Tabs>
    </AppLayout>
  )
}
