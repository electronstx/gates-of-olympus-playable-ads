import { Renderer } from '../core/renderer'
import type { GameObject } from '../types'

export class Background implements GameObject {
    #renderer: Renderer | null

    constructor(renderer: Renderer) {
        this.#renderer = renderer
    }

    draw() {
        this.#renderer?.drawBackground()
    }

    update() {}

    updatePosition() {}

    destroy() {
        this.#renderer = null
    }
}
