import { ASSET_MAP } from '../config/asset-map'
import { Renderer } from '../core/renderer'
import type { GameObject } from '../types'

export class StatPanel implements GameObject {
    #renderer: Renderer

    #freeSpins = 5
    #balance = 0
    #bet = 10

    constructor(renderer: Renderer) {
        this.#renderer = renderer
    }

    draw(): void {
        const { reels, symbolSize } = this.#renderer.layout
        const ctx = this.#renderer.ctx

        const x = window.innerWidth / 2
        const y = reels.y + reels.h + (window.innerHeight / 2) * 0.1

        const bgData = ASSET_MAP['stat-background']
        const bgScale = (window.innerWidth * 0.9) / bgData.h

        this.#renderer.drawSprite('stat-background', x, y, bgScale, -Math.PI / 2)

        const fontSize = Math.floor(symbolSize * 0.33)
        ctx.font = `800 ${fontSize}px Montserrat`
        ctx.textBaseline = 'top'

        const labelColor = '#FFD700'
        const valueColor = '#FFFFFF'

        const spacing = (window.innerWidth * 1.2) / 3

        ctx.textAlign = 'left'
        const fsLabel = 'FREE SPINS: '
        const fsValue = `${this.#freeSpins}`
        const fsX = x - spacing

        ctx.fillStyle = labelColor
        ctx.fillText(fsLabel, fsX, y)
        const fsLabelWidth = ctx.measureText(fsLabel).width
        ctx.fillStyle = valueColor
        ctx.fillText(fsValue, fsX + fsLabelWidth, y)

        const endOfLeft = fsX + fsLabelWidth + ctx.measureText(fsValue).width

        ctx.textAlign = 'right'
        const betLabel = 'BET: '
        const betValue = `${this.#bet}€`
        const betX = x + spacing

        ctx.fillStyle = valueColor
        ctx.fillText(betValue, betX, y)
        const betValueWidth = ctx.measureText(betValue).width
        ctx.fillStyle = labelColor
        ctx.fillText(betLabel, betX - betValueWidth, y)

        const startOfRight = betX - betValueWidth - ctx.measureText(betLabel).width
        const midPointX = endOfLeft + (startOfRight - endOfLeft) / 2

        const balLabel = '€: '
        const balValue = `${this.#balance}€`
        const totalBalWidth = ctx.measureText(balLabel + balValue).width

        const currentBalX = midPointX - totalBalWidth / 2

        ctx.textAlign = 'left'
        ctx.fillStyle = labelColor
        ctx.fillText(balLabel, currentBalX, y)
        ctx.fillStyle = valueColor
        ctx.fillText(balValue, currentBalX + ctx.measureText(balLabel).width, y)
    }

    update(dt: number): void {}

    destroy(): void {}
}
