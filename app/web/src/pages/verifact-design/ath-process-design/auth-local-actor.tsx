import type { localAuthActors, LocalAuthActor } from '@entities/session/model'
import { Button } from '@shared/ui/shadcn/button'

export type LocalActorType = (typeof localAuthActors)[number]

export function showLocalActorLoginViewSection(
  isShowable: boolean,
  localActor: LocalActorType,
  handleLocalSignFn: (actor: LocalAuthActor) => void,
) {
  if (!isShowable) return null

  return (
    <Button
      key={localActor.actor}
      type="button"
      variant="outline"
      className="h-auto justify-start rounded-xl p-4 text-left transition-transform active:scale-[0.99]"
      onClick={() => void handleLocalSignFn(localActor.actor)}
    >
      <span className="grid gap-1">
        <span className="font-semibold">{localActor.label}</span>
        <span className="text-muted-foreground text-sm font-normal">
          {localActor.description}
        </span>
      </span>
    </Button>
  )
}
