import { createEmitter, createEventBus } from "@solid-primitives/event-bus"
import { EventPayloads, Events } from "@rebase/core/bus"

export const bus = createEmitter<Events>()
export const publisher = createEventBus<EventPayloads>()

export const Bus = {
  on: bus.on,
  publish: function <T extends keyof Events>(type: T, properties: Events[T]) {
    const payload = {
      type,
      properties,
      source: "client",
    } as EventPayloads
    publisher.emit(payload)
  },
}
