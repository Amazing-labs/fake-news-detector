export type WatcherApplicationItem = {
  id: string
  actorId: string
  motivation: string
  status: string
  createdAt: string
  updatedAt: string
}

export type WatcherApplicationList = {
  items: WatcherApplicationItem[]
  total: number
}
