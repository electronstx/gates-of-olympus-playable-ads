import { Renderer } from '../core/renderer'
import { ASSET_MAP } from '../config/assets'
import { GAME_STATE, type GameObject, type GameState } from '../types'
import type { GameModel } from '../core/game-model'

export class Button implements GameObject {
    #renderer: Renderer | null
    #model: GameModel | null
    #textCanvas: HTMLCanvasElement | null = null
    #currentTexture: string = 'start-button'
    #state: GameState
    #x: number = 0
    #y: number = 0
    #pulseAngle: number = 0
    #baseScale: number = 1
    #currentScale: number = 0

    constructor(renderer: Renderer, model: GameModel) {
        this.#renderer = renderer
        this.#model = model
        this.#state = this.#model.state
    }

    init() {
        this.#prepareText()
        this.updatePosition()
    }

    updatePosition() {
        if (!this.#renderer) return

        const { bg } = this.#renderer.layout

        this.#x = bg.w / 2
        this.#y = bg.h * 0.85

        const spriteData = ASSET_MAP[this.#currentTexture]
        this.#baseScale = (bg.w * 0.6) / spriteData.w
        this.#currentScale = this.#baseScale
    }

    #prepareText() {
        this.#textCanvas = document.createElement('canvas')
        this.#textCanvas.width = 400
        this.#textCanvas.height = 100
        const tCtx = this.#textCanvas.getContext('2d')!

        tCtx.font = '900 90px Montserrat'
        tCtx.fillStyle = '#ffffff'
        tCtx.textAlign = 'center'
        tCtx.textBaseline = 'middle'
        tCtx.fillText('START', 200, 50)
    }

    draw() {
        if (!this.#renderer || !this.#renderer.ctx) return
        if (this.#x === 0) return

        this.#renderer.drawSprite(this.#currentTexture, this.#x, this.#y, this.#currentScale)

        if (this.#state === GAME_STATE.START && this.#textCanvas) {
            const ctx = this.#renderer.ctx
            ctx.save()
            ctx.translate(this.#x, this.#y)
            ctx.scale(this.#currentScale, this.#currentScale)
            ctx.drawImage(this.#textCanvas, -200, -50)
            ctx.restore()
        }
    }

    update(dt: number) {
        if (!this.#model) return

        this.#state = this.#model.state

        if (this.#state === GAME_STATE.IDLE || this.#state === GAME_STATE.START) {
            this.#pulseAngle += 4 * dt
            const pulseOffset = Math.sin(this.#pulseAngle) * 0.03
            this.#currentScale = this.#baseScale + pulseOffset
        } else {
            this.#currentScale = this.#baseScale
            this.#currentTexture = 'spin-button'
            this.#pulseAngle = 0
        }
    }

    destroy() {
        if (this.#textCanvas) {
            this.#textCanvas.width = 0
            this.#textCanvas.height = 0
            this.#textCanvas = null
        }

        this.#renderer = null
        this.#model = null
    }

    isClicked(x: number, y: number): boolean {
        const data = ASSET_MAP[this.#currentTexture]
        const w = data.w * this.#baseScale
        const h = data.h * this.#baseScale

        return (
            x >= this.#x - w / 2 &&
            x <= this.#x + w / 2 &&
            y >= this.#y - h / 2 &&
            y <= this.#y + h / 2
        )
    }
}
