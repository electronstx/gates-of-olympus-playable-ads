import { Renderer } from '../core/renderer'
import type { GameObject } from '../types'

export class GameSymbol implements GameObject {
    #renderer: Renderer | null
    #name: string
    #x: number
    #y: number
    #targetY: number
    #scale: number
    #rotation: number
    #isFalling = false
    #isExiting = false
    #velocity = 0
    #gravity = 4000

    constructor(
        renderer: Renderer,
        name: string,
        x: number,
        y: number,
        targetY: number,
        scale: number,
        rotation: number
    ) {
        this.#renderer = renderer
        this.#name = name
        this.#x = x
        this.#y = y
        this.#targetY = targetY
        this.#scale = scale
        this.#rotation = rotation
    }

    draw() {
        this.#renderer?.drawSprite(this.#name, this.#x, this.#y, this.#scale, this.#rotation)
    }

    update(dt: number): void {
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

    destroy(): void {
        this.#renderer = null
    }

    get isFalling() {
        return this.#isFalling
    }

    get isExiting() {
        return this.#isExiting
    }

    get targetY() {
        return this.#targetY
    }

    set y(y: number) {
        this.#y = y
    }

    resetVelocity() {
        this.#velocity = 0
    }

    stopAll() {
        this.#isFalling = false
        this.#isExiting = false
        this.#velocity = 0
    }

    startExit() {
        this.stopAll()
        this.#isExiting = true
        this.#velocity = 1000
    }

    startDrop(y: number, name: string, scale: number, rotation: number) {
        this.stopAll()
        this.#name = name
        this.#y = y
        this.#scale = scale
        this.#rotation = rotation
        this.#isFalling = true
    }
}
