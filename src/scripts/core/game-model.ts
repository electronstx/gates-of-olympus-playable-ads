import { GAME_CONFIG } from '../config/config'
import { GAME_STATE, type GameState } from '../types'

export class GameModel {
    #freeSpins: number
    #bet: number
    #win: number = 0
    #state: GameState = GAME_STATE.START
    #currentSpinIndex: number = 0

    constructor() {
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
    }

    spin(): boolean {
        const canSpin = this.#state === GAME_STATE.IDLE || this.#state === GAME_STATE.START
        const hasSpins = this.#freeSpins > 0
        const hasScenarios = this.#currentSpinIndex < GAME_CONFIG.SPIN_SCENARIOS.length - 1

        if (canSpin && hasSpins && hasScenarios) {
            this.#freeSpins -= 1
            this.#currentSpinIndex++
            this.#state = GAME_STATE.SPIN
            return true
        }

        return false
    }

    stopSpin() {
        this.#state = GAME_STATE.IDLE
    }

    addWin(amount: number) {
        if (amount <= 0) return

        this.#win += amount
    }
}
