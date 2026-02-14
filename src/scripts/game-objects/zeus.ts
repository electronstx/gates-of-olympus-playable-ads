import { ASSET_MAP } from '../config/asset-map'
import { Renderer } from '../core/renderer'
import type { GameObject } from '../types'

export class Zeus implements GameObject {
    #renderer: Renderer | null
    #angle: number = 0
    #speed: number = 2
    #amplitude: number = 7

    constructor(renderer: Renderer) {
        this.#renderer = renderer
    }

    draw() {
        const spriteData = ASSET_MAP['zeus']
        const targetScreenWidth = window.innerWidth * 0.65

        const dynamicScale = targetScreenWidth / spriteData.w

        const x = window.innerWidth * 0.75
        const y = window.innerHeight * 0.25 + Math.sin(this.#angle) * this.#amplitude

        this.#renderer?.drawSprite('zeus', x, y, dynamicScale, -Math.PI / 2)
    }

    update(dt: number) {
        this.#angle += this.#speed * dt
    }

    destroy(): void {
        this.#renderer = null
    }
}
