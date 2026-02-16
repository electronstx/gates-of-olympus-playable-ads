import { ASSET_MAP } from '../config/assets'
import { Renderer } from '../core/renderer'
import type { GameObject } from '../types'

export class Zeus implements GameObject {
    #renderer: Renderer | null
    #angle: number = 0
    #speed: number = 2
    #amplitude: number = 7

    #x: number = 0
    #baseY: number = 0
    #scale: number = 0

    constructor(renderer: Renderer) {
        this.#renderer = renderer
        this.updatePosition()
    }

    updatePosition() {
        if (!this.#renderer) return

        const { bg } = this.#renderer.layout
        const spriteData = ASSET_MAP['zeus']

        const targetScreenWidth = bg.w * 0.65
        this.#scale = targetScreenWidth / spriteData.w

        this.#x = bg.w * 0.75
        this.#baseY = bg.h * 0.25
    }

    draw() {
        if (!this.#renderer) return

        const currentY = this.#baseY + Math.sin(this.#angle) * this.#amplitude

        this.#renderer.drawSprite('zeus', this.#x, currentY, this.#scale, -Math.PI / 2)
    }

    update(dt: number) {
        this.#angle += this.#speed * dt
    }

    destroy() {
        this.#renderer = null
    }
}
