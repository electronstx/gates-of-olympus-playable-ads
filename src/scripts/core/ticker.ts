export class Ticker {
    #lastTime: number = 0
    #isRunning: boolean = false
    #callback: (dt: number) => void

    constructor(callback: (dt: number) => void) {
        this.#callback = callback
    }

    start() {
        this.#isRunning = true
        this.#lastTime = performance.now()
        requestAnimationFrame(this.#loop)
    }

    stop() {
        this.#isRunning = false
    }

    #loop = (currentTime: number) => {
        if (!this.#isRunning) return

        const dt = (currentTime - this.#lastTime) / 1000
        this.#lastTime = currentTime

        this.#callback(dt)
        requestAnimationFrame(this.#loop)
    }
}
