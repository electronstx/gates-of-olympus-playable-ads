import { ASSET_MAP } from '../config/asset-map'
import { Renderer } from '../core/renderer'
import type { GameObject } from '../types'

export class Logo implements GameObject {
    #renderer: Renderer | null

    constructor(renderer: Renderer) {
        this.#renderer = renderer
    }

    draw() {
        const spriteData = ASSET_MAP['logo']

        const targetScreenWidth = window.innerWidth * 0.5
        const dynamicScale = targetScreenWidth / spriteData.h

        const x = window.innerWidth * 0.3
        const y = window.innerHeight * 0.1

        this.#renderer?.drawSprite('logo', x, y, dynamicScale, -Math.PI / 2)
    }

    update(_dt: number): void {}

    destroy(): void {
        this.#renderer = null
    }
}
