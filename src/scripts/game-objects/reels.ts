import { Renderer } from '../core/renderer'
import { ASSET_MAP } from '../config/asset-map'
import { GameSymbol } from './symbol'
import { GAME_STATE, type GameObject } from '../types'
import { GAME_CONFIG } from '../config/config'
import type { GameModel } from '../core/game-model'

export class Reels implements GameObject {
    #renderer: Renderer | null
    #model: GameModel | null
    #symbols: GameSymbol[] = []
    #columns: GameSymbol[][] = []
    #timeouts: number[] = []
    #isSpinning = false
    #winningPositions: { x: number; y: number }[] = []
    #showCombo = false
    #activeScenarioIndex = 0
    #isWaitingForLanded = false

    constructor(renderer: Renderer, model: GameModel) {
        this.#renderer = renderer
        this.#model = model
    }

    init() {
        const renderer = this.#renderer
        if (!renderer || !this.#model) return

        const { colWidth, symbolSize, reelsStartX, reelsStartY } = renderer.layout

        if (symbolSize === 0) return

        this.#symbols = []
        this.#columns = [[], [], [], [], [], []]

        const currentScenario = GAME_CONFIG.SPIN_SCENARIOS[this.#model.currentSpinIndex]

        currentScenario.grid.forEach((column, colIndex) => {
            const centerX = reelsStartX + colIndex * colWidth + colWidth / 2

            column.forEach((symbolName, rowIndex) => {
                const targetY = reelsStartY + rowIndex * symbolSize + symbolSize / 2

                const spriteData = ASSET_MAP[symbolName]
                const sourceW = spriteData.rotated ? spriteData.h : spriteData.w
                const scale = (symbolSize / sourceW) * 0.8
                const rotation = spriteData.rotated ? -Math.PI / 2 : 0

                const symbol = new GameSymbol(
                    renderer,
                    symbolName,
                    centerX,
                    targetY,
                    targetY,
                    scale,
                    rotation
                )

                this.#symbols.push(symbol)
                this.#columns[colIndex].push(symbol)
            })
        })
    }

    draw() {
        if (!this.#renderer || !this.#renderer.ctx) return

        const { reels, symbolSize } = this.#renderer.layout
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
                const borderData = ASSET_MAP['combo-border']
                const sourceW = borderData.rotated ? borderData.h : borderData.w
                const borderScale = (symbolSize / sourceW) * 1.4
                const rotation = borderData.rotated ? -Math.PI / 2 : 0

                this.#renderer?.drawSprite('combo-border', pos.x, pos.y, borderScale, rotation)
            })
        }

        ctx.restore()
    }

    update(dt: number): void {
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

    #checkWin() {
        const model = this.#model
        const renderer = this.#renderer

        if (!renderer || !model) return

        const scenario = GAME_CONFIG.SPIN_SCENARIOS[this.#activeScenarioIndex]

        if (!scenario?.winCombo) {
            model.state = GAME_STATE.IDLE
            return
        }

        model.state = GAME_STATE.WIN
        this.#showCombo = true

        if (scenario.win) {
            model.addWin(scenario.win)
        }

        const { colWidth, symbolSize, reelsStartX, reelsStartY } = renderer.layout

        this.#winningPositions = scenario.winCombo.flatMap((column) =>
            column.map(([col, row]) => ({
                x: reelsStartX + col * colWidth + colWidth / 2,
                y: reelsStartY + row * symbolSize + symbolSize / 2,
            }))
        )

        window.setTimeout(() => {
            if (model.currentSpinIndex === 3) {
                model.state = GAME_STATE.END
                return
            }

            this.#showCombo = false
            this.#winningPositions = []
            model.state = GAME_STATE.IDLE
        }, 2500)
    }

    destroy(): void {
        this.#timeouts.forEach((t) => clearTimeout(t))
        this.#timeouts = []

        this.#symbols.forEach((s) => s.destroy())

        this.#symbols = []
        this.#columns = []

        this.#renderer = null
        this.#model = null
    }

    startSpin() {
        if (!this.#renderer || !this.#model) return

        this.#isSpinning = true
        this.#isWaitingForLanded = false

        this.#model.nextSpin()

        this.#activeScenarioIndex = this.#model.currentSpinIndex

        const { reels, symbolSize } = this.#renderer.layout
        const colDelay = 150
        const rowDelay = 70

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

                    const spriteData = ASSET_MAP[nextName]
                    const sourceW = spriteData.rotated ? spriteData.h : spriteData.w
                    const nextScale = (symbolSize / sourceW) * 0.8
                    const nextRotation = spriteData.rotated ? -Math.PI / 2 : 0

                    symbol.startDrop(spawnY, nextName, nextScale, nextRotation)

                    if (colIndex === 5 && rowIndex === 4) {
                        this.#isWaitingForLanded = true
                    }
                }, baseDelay + 1000)

                this.#timeouts.push(t1, t2)
            })
        })
    }
}
