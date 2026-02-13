import type { EmitterCallback } from '../types'

export class EventEmitter {
    #events: Map<string, Set<EmitterCallback>> = new Map()

    on(event: string, callback: EmitterCallback) {
        if (!this.#events.has(event)) {
            this.#events.set(event, new Set())
        }
        this.#events.get(event)?.add(callback)
    }

    off(event: string, callback: EmitterCallback) {
        this.#events.get(event)?.delete(callback)
    }

    emit(event: string, data?: any) {
        this.#events.get(event)?.forEach((callback) => callback(data))
    }

    destroy(): void {
        this.#events.clear()
    }
}
