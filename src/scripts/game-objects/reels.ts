import { Renderer } from '../core/renderer'
import { ASSET_MAP } from '../config/asset-map'
import { GameSymbol } from './symbol'
import type { GameObject } from '../types'

export class Reels implements GameObject {
    #renderer: Renderer
    #symbols: GameSymbol[] = []
    #gridData = [
        ['ruby', 'topaz', 'crown', 'amethyst', 'crown'],
        ['emerald', 'sapphire', 'hourglass', 'ruby', 'scatter'],
        ['ruby', 'topaz', 'crown', 'ring', 'cup'],
        ['scatter', 'emerald', 'cup', 'hourglass', 'ruby'],
        ['hourglass', 'amethyst', 'sapphire', 'ring', 'cup'],
        ['crown', 'topaz', 'crown', 'amethyst', 'ring'],
    ]

    constructor(renderer: Renderer) {
        this.#renderer = renderer
    }

    init() {
        const { colWidth, symbolSize, reelsStartX, reelsStartY } = this.#renderer.layout

        if (symbolSize === 0) return

        this.#symbols = []

        this.#gridData.forEach((column, colIndex) => {
            const centerX = reelsStartX + colIndex * colWidth + colWidth / 2

            column.forEach((symbolName, rowIndex) => {
                const posY = reelsStartY + rowIndex * symbolSize + symbolSize / 2
                const spriteData = ASSET_MAP[symbolName]
                const sourceW = spriteData.rotated ? spriteData.h : spriteData.w
                const scale = (symbolSize / sourceW) * 0.8
                const rotation = spriteData.rotated ? -Math.PI / 2 : 0

                this.#symbols.push(
                    new GameSymbol(this.#renderer, symbolName, centerX, posY, scale, rotation)
                )
            })
        })
    }

    draw() {
        this.#symbols.forEach((s) => s.draw())
    }

    update(dt: number): void {}

    destroy(): void {
        this.#symbols = []
    }
}
