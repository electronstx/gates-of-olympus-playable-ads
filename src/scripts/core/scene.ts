import type { GameObject } from '../types'

export class Scene {
    #gameObjects: GameObject[] = []

    add(gameObject: GameObject) {
        this.#gameObjects.push(gameObject)
        return this
    }

    draw() {
        this.#gameObjects.forEach((gameObject) => gameObject.draw())
    }

    update(dt: number) {
        this.#gameObjects.forEach((gameObject) => gameObject.update(dt))
    }

    destroy() {
        this.#gameObjects.forEach((gameObject) => gameObject.destroy())
        this.#gameObjects = []
    }
}
