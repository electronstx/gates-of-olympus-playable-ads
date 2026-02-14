export class Ticker {
    #lastTime: number = 0
    #isRunning: boolean = false
    #callback: ((dt: number) => void) | null

    constructor(callback: (dt: number) => void) {
        this.#callback = callback
    }

    start() {
        if (this.#isRunning) return

        this.#isRunning = true
        this.#lastTime = performance.now()
        requestAnimationFrame(this.#loop)
    }

    stop() {
        this.#isRunning = false
    }

    #loop = (currentTime: number) => {
        if (!this.#isRunning || !this.#callback) return

        const dt = Math.min((currentTime - this.#lastTime) / 1000, 0.1)
        this.#lastTime = currentTime

        this.#callback(dt)
        requestAnimationFrame(this.#loop)
    }

    destroy() {
        this.stop()
        this.#callback = null
    }
}
