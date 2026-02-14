import { GAME_CONFIG } from '../config/config'
import { EventEmitter } from './event-emitter'
import { GAME_STATE, type GameState } from '../types'

export class GameModel {
    #eventEmitter: EventEmitter | null

    #freeSpins: number
    #bet: number
    #win: number = 0
    #state: GameState = GAME_STATE.START
    #currentSpinIndex: number = 0

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

    get win() {
        return this.#win
    }

    get state() {
        return this.#state
    }

    get currentSpinIndex() {
        return this.#currentSpinIndex
    }

    set state(state: GameState) {
        if (this.#state === state) return

        this.#state = state
        this.#eventEmitter?.emit('STATE_CHANGE', state)
        console.log(`State changed on ${this.#state}`)
    }

    nextSpin(): boolean {
        if (this.#currentSpinIndex < GAME_CONFIG.SPIN_SCENARIOS.length - 1) {
            this.#currentSpinIndex++
            return true
        }
        return false
    }

    spin(): boolean {
        if (this.#state === GAME_STATE.SPIN) return false

        if (this.#freeSpins > 0) {
            this.#freeSpins -= 1

            this.state = GAME_STATE.SPIN

            this.#eventEmitter?.emit('DATA_UPDATED')

            return true
        }

        return false
    }

    stopSpin(): void {
        this.state = GAME_STATE.IDLE
    }

    addWin(amount: number) {
        if (amount <= 0) return

        this.#win += amount
        this.#eventEmitter?.emit('DATA_UPDATED')
    }

    destroy() {
        this.#eventEmitter = null
    }
}
