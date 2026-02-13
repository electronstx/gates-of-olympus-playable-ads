import { Renderer } from '../core/renderer'

export class GameSymbol {
    #renderer: Renderer
    #name: string
    #x: number
    #y: number
    #scale: number
    #rotation: number

    constructor(
        renderer: Renderer,
        name: string,
        x: number,
        y: number,
        scale: number,
        rotation: number
    ) {
        this.#renderer = renderer
        this.#name = name
        this.#x = x
        this.#y = y
        this.#scale = scale
        this.#rotation = rotation
    }

    draw() {
        this.#renderer.drawSprite(this.#name, this.#x, this.#y, this.#scale, this.#rotation)
    }
}
