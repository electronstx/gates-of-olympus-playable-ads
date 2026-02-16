import { ASSET_MAP, ASSETS_AUDIO } from '../config/assets'
import { Renderer } from '../core/renderer'
import { GameSymbol } from './symbol'
import { GAME_STATE, type GameObject } from '../types'
import { GAME_CONFIG } from '../config/config'
import type { GameModel } from '../core/game-model'
import type { AudioManager } from '../core/audio'

export class Reels implements GameObject {
    #renderer: Renderer | null
    #model: GameModel | null
    #audioManager: AudioManager | null
    #symbols: GameSymbol[] = []
    #columns: GameSymbol[][] = []
    #timeouts: number[] = []
    #isSpinning = false
    #winningPositions: { x: number; y: number; scale: number; rotation: number }[] = []
    #showCombo = false
    #activeScenarioIndex = 0
    #isWaitingForLanded = false

    constructor(renderer: Renderer, model: GameModel, audioManager: AudioManager) {
        this.#renderer = renderer
        this.#model = model
        this.#audioManager = audioManager
    }

    updatePosition() {
        const renderer = this.#renderer
        if (!renderer || !this.#model) return

        this.#symbols.forEach((s) => s.destroy())

        const { colWidth, symbolSize, reelsStartX, reelsStartY } = renderer.layout

        if (symbolSize === 0) return

        this.#symbols = []
        this.#columns = [[], [], [], [], [], []]

        const currentScenario = GAME_CONFIG.SPIN_SCENARIOS[this.#model.currentSpinIndex]

        currentScenario.grid.forEach((column, colIndex) => {
            const centerX = reelsStartX + colIndex * colWidth + colWidth / 2

            column.forEach((symbolName, rowIndex) => {
                const targetY = reelsStartY + rowIndex * symbolSize + symbolSize / 2

                const symbol = new GameSymbol(renderer, symbolName, centerX, targetY, symbolSize)

                this.#symbols.push(symbol)
                this.#columns[colIndex].push(symbol)
            })
        })
    }

    draw() {
        if (!this.#renderer || !this.#renderer.ctx) return

        const { reels } = this.#renderer.layout
        const ctx = this.#renderer.ctx

        ctx.save()
        ctx.beginPath()

        const offsetX = reels.w * 0.02
        const offsetYTop = reels.h * 0.07
        const offsetYBottom = reels.h * 0.08

        ctx.rect(
            reels.x + offsetX,
            reels.y + offsetYTop,
            reels.w - offsetX * 2,
            reels.h - offsetYTop - offsetYBottom
        )

        ctx.clip()

        this.#symbols.forEach((s) => s.draw())

        if (this.#showCombo) {
            this.#winningPositions.forEach((pos) => {
                this.#renderer?.drawSprite('combo-border', pos.x, pos.y, pos.scale, pos.rotation)
            })
        }

        ctx.restore()
    }

    update(dt: number) {
        this.#symbols.forEach((s) => s.update(dt))

        if (
            this.#model?.state === GAME_STATE.SPIN &&
            this.#isSpinning &&
            this.#isWaitingForLanded
        ) {
            const isMoving = this.#symbols.some((s) => s.isFalling || s.isExiting)

            if (!isMoving) {
                this.#isSpinning = false
                this.#isWaitingForLanded = false
                this.#checkWin()
            }
        }
    }

    #clearTimeouts() {
        this.#timeouts.forEach((t) => clearTimeout(t))
        this.#timeouts = []
    }

    #checkWin() {
        const model = this.#model
        const renderer = this.#renderer

        if (!renderer || !model) return

        const scenario = GAME_CONFIG.SPIN_SCENARIOS[this.#activeScenarioIndex]

        if (!scenario?.winCombo) {
            model.state = GAME_STATE.IDLE
            return
        }

        this.#showCombo = true
        this.#audioManager?.playSound(ASSETS_AUDIO.COMBO)

        const { colWidth, symbolSize, reelsStartX, reelsStartY } = renderer.layout
        const borderData = ASSET_MAP['combo-border']
        const borderScale = (symbolSize / (borderData.rotated ? borderData.h : borderData.w)) * 1.4
        const rotation = borderData.rotated ? -Math.PI / 2 : 0

        this.#winningPositions = scenario.winCombo.flatMap((column) =>
            column.map(([col, row]) => ({
                x: reelsStartX + col * colWidth + colWidth / 2,
                y: reelsStartY + row * symbolSize + symbolSize / 2,
                scale: borderScale,
                rotation: rotation,
            }))
        )

        this.#clearTimeouts()

        const t1 = window.setTimeout(() => {
            model.state = GAME_STATE.WIN
            if (scenario.win) model.addWin(scenario.win)

            const t2 = window.setTimeout(() => {
                if (model.currentSpinIndex === GAME_CONFIG.SPIN_SCENARIOS.length - 1) {
                    model.state = GAME_STATE.END
                    return
                }

                this.#showCombo = false
                this.#winningPositions = []
                model.state = GAME_STATE.IDLE
            }, 2500)

            this.#timeouts.push(t2)
        }, 1000)

        this.#timeouts.push(t1)
    }

    startSpin() {
        if (!this.#renderer || !this.#model) return

        this.#clearTimeouts()
        this.#showCombo = false
        this.#isSpinning = true
        this.#isWaitingForLanded = false
        this.#activeScenarioIndex = this.#model.currentSpinIndex

        this.#audioManager?.playSound(ASSETS_AUDIO.SPIN)

        const { reels, symbolSize } = this.#renderer.layout
        const colDelay = 220
        const rowDelay = 90

        const currentScenario = GAME_CONFIG.SPIN_SCENARIOS[this.#activeScenarioIndex]

        this.#columns.forEach((column, colIndex) => {
            column.forEach((symbol, rowIndex) => {
                const baseDelay = colIndex * colDelay + (4 - rowIndex) * rowDelay

                const t1 = window.setTimeout(() => {
                    symbol.startExit()
                }, baseDelay)

                const t2 = window.setTimeout(() => {
                    const offset = (column.length - rowIndex) * symbolSize
                    const spawnY = reels.y - offset
                    const nextName = currentScenario.grid[colIndex][rowIndex]

                    symbol.startDrop(spawnY, nextName)

                    if (colIndex === 5 && rowIndex === 4) {
                        this.#isWaitingForLanded = true
                    }
                }, baseDelay + 1000)

                this.#timeouts.push(t1, t2)
            })
        })
    }

    destroy() {
        this.#clearTimeouts()
        this.#symbols.forEach((s) => s.destroy())

        this.#symbols = []
        this.#columns = []

        this.#renderer = null
        this.#model = null
        this.#audioManager = null
    }
}
