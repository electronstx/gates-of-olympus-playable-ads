import { Renderer } from '../core/renderer'
import type { GameObject } from '../types'

export class ReelsBg implements GameObject {
    #renderer: Renderer

    constructor(renderer: Renderer) {
        this.#renderer = renderer
    }

    draw() {
        this.#renderer.drawReelsBackground()
    }

    update() {}

    destroy() {}
}
