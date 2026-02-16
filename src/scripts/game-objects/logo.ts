import { ASSET_MAP } from '../config/assets'
import { Renderer } from '../core/renderer'
import type { GameObject } from '../types'

export class Logo implements GameObject {
    #renderer: Renderer | null
    #x: number = 0
    #y: number = 0
    #scale: number = 0
    #rotation: number = -Math.PI / 2

    constructor(renderer: Renderer) {
        this.#renderer = renderer
        this.updatePosition()
    }

    draw() {
        if (!this.#renderer) return

        this.#renderer.drawSprite('logo', this.#x, this.#y, this.#scale, this.#rotation)
    }

    update(_dt: number) {}

    updatePosition() {
        if (!this.#renderer) return

        const { bg } = this.#renderer.layout
        const spriteData = ASSET_MAP['logo']
        const targetVisibleWidth = bg.w * 0.5
        this.#scale = targetVisibleWidth / spriteData.h

        this.#x = bg.w * 0.3
        this.#y = bg.h * 0.1
    }

    destroy() {
        this.#renderer = null
    }
}
