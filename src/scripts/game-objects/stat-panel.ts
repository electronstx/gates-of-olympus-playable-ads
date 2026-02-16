import { ASSET_MAP } from '../config/assets'
import type { GameModel } from '../core/game-model'
import { Renderer } from '../core/renderer'
import type { GameObject } from '../types'

export class StatPanel implements GameObject {
    #renderer: Renderer | null
    #model: GameModel | null

    #geo = {
        x: 0,
        y: 0,
        bgScale: 0,
        spacing: 0,
        fsX: 0,
        betX: 0,
        fontSize: 0,
        fontStr: '',
    }

    #metrics = {
        lastFont: '',
        fsLabelW: 0,
        betLabelW: 0,
        balLabelW: 0,
    }

    constructor(renderer: Renderer, model: GameModel) {
        this.#renderer = renderer
        this.#model = model
    }

    updatePosition() {
        const renderer = this.#renderer
        if (!renderer) return
        const { reels, symbolSize } = renderer.layout

        const winW = window.innerWidth
        const winH = window.innerHeight

        this.#geo.x = winW / 2
        this.#geo.y = reels.y + reels.h + (winH / 2) * 0.1

        const bgData = ASSET_MAP['stat-background']
        this.#geo.bgScale = (winW * 0.9) / bgData.h

        this.#geo.fontSize = Math.floor(symbolSize * 0.33)
        this.#geo.fontStr = `800 ${this.#geo.fontSize}px Montserrat`

        this.#geo.spacing = (winW * 1.2) / 3
        this.#geo.fsX = this.#geo.x - this.#geo.spacing
        this.#geo.betX = this.#geo.x + this.#geo.spacing

        this.#metrics.lastFont = ''
    }

    draw() {
        const renderer = this.#renderer
        const model = this.#model
        if (!renderer?.ctx || !model) return
        const ctx = renderer.ctx
        const g = this.#geo
        const m = this.#metrics

        renderer.drawSprite('stat-background', g.x, g.y, g.bgScale, -Math.PI / 2)

        ctx.font = g.fontStr
        const checkWidth = ctx.measureText('FREE SPINS: ').width
        if (m.lastFont !== g.fontStr || m.fsLabelW !== checkWidth) {
            m.fsLabelW = checkWidth
            m.betLabelW = ctx.measureText('BET: ').width
            m.balLabelW = ctx.measureText('€: ').width
            m.lastFont = g.fontStr
        }

        ctx.textBaseline = 'top'
        const labelColor = '#FFD700'
        const valueColor = '#FFFFFF'

        ctx.textAlign = 'left'
        ctx.fillStyle = labelColor
        ctx.fillText('FREE SPINS: ', g.fsX, g.y)
        ctx.fillStyle = valueColor
        const fsVal = `${model.freeSpins}`
        ctx.fillText(fsVal, g.fsX + m.fsLabelW, g.y)

        const fsValueWidth = ctx.measureText(fsVal).width
        const endOfLeft = g.fsX + m.fsLabelW + fsValueWidth

        ctx.textAlign = 'right'
        ctx.fillStyle = valueColor
        const betValue = `${model.bet}€`
        ctx.fillText(betValue, g.betX, g.y)
        const betValueWidth = ctx.measureText(betValue).width
        ctx.fillStyle = labelColor
        ctx.fillText('BET: ', g.betX - betValueWidth, g.y)

        const startOfRight = g.betX - betValueWidth - m.betLabelW

        const midPointX = endOfLeft + (startOfRight - endOfLeft) / 2

        const balValue = `${model.win}€`
        const totalBalWidth = m.balLabelW + ctx.measureText(balValue).width
        const currentBalX = midPointX - totalBalWidth / 2

        ctx.textAlign = 'left'
        ctx.fillStyle = labelColor
        ctx.fillText('€: ', currentBalX, g.y)
        ctx.fillStyle = valueColor
        ctx.fillText(balValue, currentBalX + m.balLabelW, g.y)
    }

    update(_dt: number) {
        if (this.#geo.x === 0) this.updatePosition()
    }

    destroy() {
        this.#renderer = null
        this.#model = null
    }
}
