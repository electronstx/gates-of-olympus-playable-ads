import { AudioManager } from './core/audio'
import { Ticker } from './core/ticker'
import { Renderer } from './core/renderer'
import { Zeus } from './game-objects/zeus'
import { Logo } from './game-objects/logo'
import { Reels } from './game-objects/reels'
import { Button } from './game-objects/button'
import { Scene } from './core/scene'
import { ReelsBg } from './game-objects/reels-bg'
import { Background } from './game-objects/background'
import { EventEmitter } from './core/event-emitter'
import { StatPanel } from './game-objects/stat-panel'
import { GameModel } from './core/game-model'

export class Game {
    #scene: Scene
    #model: GameModel
    #renderer: Renderer
    #audioManager: AudioManager
    #eventEmitter: EventEmitter
    #ticker: Ticker

    #reels: Reels
    #button: Button
    #statPanel: StatPanel

    #isGameStarted = false

    constructor() {
        this.#eventEmitter = new EventEmitter()
        this.#renderer = new Renderer()
        this.#audioManager = new AudioManager()
        this.#model = new GameModel(this.#eventEmitter)
        this.#scene = new Scene()
        this.#reels = new Reels(this.#renderer)
        this.#statPanel = new StatPanel(this.#renderer)
        this.#button = new Button(this.#renderer, this.#eventEmitter, this.#model.state)

        this.#ticker = new Ticker((dt) => this.#update(dt))

        this.#init()
    }

    async #init() {
        await document.fonts.load('900 90px Montserrat')
        await document.fonts.ready

        this.#scene
            .add(new Background(this.#renderer))
            .add(new Zeus(this.#renderer))
            .add(new Logo(this.#renderer))
            .add(new ReelsBg(this.#renderer))
            .add(this.#reels)
            .add(this.#statPanel)
            .add(this.#button)

        this.#reels.init()

        window.addEventListener('resize', () => this.#handleResize())
        this.#renderer.canvas.addEventListener('click', (e) => this.#handleClick(e))

        this.#ticker.start()
    }

    #handleClick(e: MouseEvent) {
        const rect = this.#renderer.canvas.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top

        this.#handleFirstClick()

        if (this.#button.isClicked(clickX, clickY)) {
            if (this.#model.spin()) {
                console.log('Spin started via Model')
            }
        }
    }

    #handleFirstClick() {
        if (!this.#isGameStarted) {
            this.#isGameStarted = true
            this.#audioManager.playMusic()
        }
    }

    #handleResize() {
        this.#reels.init()
        this.#button.updatePosition()
    }

    #update(dt: number) {
        this.#renderer.clear()

        this.#scene.update(dt)
        this.#scene.draw()
    }
}
