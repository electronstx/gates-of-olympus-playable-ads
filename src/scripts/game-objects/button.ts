import { Renderer } from '../core/renderer'
import { ASSET_MAP } from '../config/asset-map'
import { GAME_STATE, type GameObject, type GameState } from '../types'
import type { EventEmitter } from '../core/event-emitter'

export class Button implements GameObject {
    #renderer: Renderer | null
    #eventEmitter: EventEmitter | null
    #textCanvas: HTMLCanvasElement | null = null
    #currentTexture: string = 'start-button'
    #state: GameState
    #x: number = 0
    #y: number = 0
    #pulseAngle: number = 0
    #baseScale: number = 0
    #currentScale: number = 0

    constructor(renderer: Renderer, eventEmitter: EventEmitter, state: GameState) {
        this.#renderer = renderer
        this.#eventEmitter = eventEmitter
        this.#state = state
        this.updatePosition()
        this.#eventEmitter.on('STATE_CHANGE', this.#handleStateChange)
    }

    #handleStateChange = (state: GameState) => {
        this.#state = state

        if (state === GAME_STATE.START) {
            this.#currentTexture = 'start-button'
        } else {
            this.#currentTexture = 'spin-button'
            this.#pulseAngle = 0
        }
    }

    updatePosition() {
        this.#x = window.innerWidth / 2
        this.#y = window.innerHeight * 0.85

        const spriteData = ASSET_MAP[this.#currentTexture]
        this.#baseScale = (window.innerWidth * 0.6) / spriteData.w
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

        if (!this.#textCanvas) {
            this.#prepareText()
        }

        const pulseOffset =
            this.#state === GAME_STATE.IDLE || this.#state === GAME_STATE.START
                ? Math.sin(this.#pulseAngle) * 0.03
                : 0
        this.#currentScale = this.#baseScale + pulseOffset

        this.#renderer.drawSprite(this.#currentTexture, this.#x, this.#y, this.#currentScale)

        if (this.#state === GAME_STATE.START) {
            const ctx = this.#renderer.ctx
            ctx.save()
            ctx.translate(this.#x, this.#y)
            ctx.scale(this.#currentScale, this.#currentScale)
            ctx.drawImage(this.#textCanvas!, -200, -50)
            ctx.restore()
        }
    }

    update(dt: number) {
        if (this.#state === GAME_STATE.IDLE || this.#state === GAME_STATE.START) {
            this.#pulseAngle += 4 * dt
        }
    }

    destroy() {
        if (this.#textCanvas) {
            this.#textCanvas.width = 0
            this.#textCanvas.height = 0
            this.#textCanvas = null
        }

        this.#renderer = null

        this.#eventEmitter?.off('STATE_CHANGE', this.#handleStateChange)
        this.#eventEmitter = null
    }

    isClicked(x: number, y: number): boolean {
        const data = ASSET_MAP[this.#currentTexture]
        const w = data.w * this.#currentScale
        const h = data.h * this.#currentScale

        return (
            x >= this.#x - w / 2 &&
            x <= this.#x + w / 2 &&
            y >= this.#y - h / 2 &&
            y <= this.#y + h / 2
        )
    }
}
