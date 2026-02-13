import { GAME_CONFIG } from '../config/config'
import { EventEmitter } from './event-emitter'
import { GAME_STATE, type GameState } from '../types'

export class GameModel {
    #eventEmitter: EventEmitter

    #freeSpins: number
    #bet: number
    #state: GameState = GAME_STATE.START

    constructor(eventEmitter: EventEmitter) {
        this.#eventEmitter = eventEmitter
        this.#freeSpins = GAME_CONFIG.FREE_SPINS
        this.#bet = GAME_CONFIG.BET
    }

    get freeSpins() {
        return this.#freeSpins
    }
    get bet() {
        return this.#bet
    }
    get state() {
        return this.#state
    }

    set state(state: GameState) {
        if (this.#state === state) return

        this.#state = state
        this.#eventEmitter.emit('STATE_CHANGE', state)
    }

    spin(): boolean {
        if (this.#state !== GAME_STATE.IDLE && this.#state !== GAME_STATE.START) return false

        this.state = GAME_STATE.SPIN
        this.#eventEmitter.emit('DATA_UPDATED')
        return true
    }

    stopSpin(): void {
        this.state = GAME_STATE.IDLE
    }
}
