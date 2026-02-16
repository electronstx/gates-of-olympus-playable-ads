import { Renderer } from '../core/renderer'
import { ASSET_MAP } from '../config/assets'
import type { GameObject } from '../types'

export class GameSymbol implements GameObject {
    #renderer: Renderer | null
    #name: string
    #x: number
    #y: number
    #targetY: number
    #scale: number = 0
    #rotation: number = 0
    #symbolSize: number

    #isFalling = false
    #isExiting = false
    #velocity = 0
    #gravity = 4000

    constructor(renderer: Renderer, name: string, x: number, y: number, symbolSize: number) {
        this.#renderer = renderer
        this.#name = name
        this.#x = x
        this.#y = y
        this.#targetY = y
        this.#symbolSize = symbolSize

        this.#updateVisuals(name)
    }

    #updateVisuals(name: string) {
        const data = ASSET_MAP[name as keyof typeof ASSET_MAP]
        if (!data) return

        this.#name = name
        const sourceW = data.rotated ? data.h : data.w
        this.#scale = (this.#symbolSize / sourceW) * 0.8
        this.#rotation = data.rotated ? -Math.PI / 2 : 0
    }

    draw() {
        this.#renderer?.drawSprite(this.#name, this.#x, this.#y, this.#scale, this.#rotation)
    }

    update(dt: number) {
        if (this.#isExiting) {
            this.#velocity += this.#gravity * dt
            this.#y += this.#velocity * dt
            return
        }

        if (!this.#isFalling) return

        this.#velocity += this.#gravity * dt
        this.#y += this.#velocity * dt

        if (this.#y >= this.#targetY) {
            this.#y = this.#targetY
            this.#isFalling = false
            this.#velocity = 0
        }
    }

    updatePosition() {}

    startExit() {
        this.#isFalling = false
        this.#isExiting = true
        this.#velocity = 1000
    }

    startDrop(y: number, name: string) {
        this.#isExiting = false
        this.#velocity = 0
        this.#y = y

        this.#updateVisuals(name)

        this.#isFalling = true
    }

    destroy() {
        this.#renderer = null
    }

    get isFalling() {
        return this.#isFalling
    }
    get isExiting() {
        return this.#isExiting
    }
}
