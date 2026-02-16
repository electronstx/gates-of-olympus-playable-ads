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
import { StatPanel } from './game-objects/stat-panel'
import { GameModel } from './core/game-model'
import { WinPopup } from './game-objects/win-popup'

export class Game {
    #scene: Scene
    #model: GameModel
    #renderer: Renderer
    #audioManager: AudioManager
    #ticker: Ticker

    #reels: Reels
    #button: Button
    #statPanel: StatPanel
    #winPopup: WinPopup

    #isGameStarted = false
    #canvasRect: DOMRect | null = null

    constructor() {
        this.#renderer = new Renderer()
        this.#audioManager = new AudioManager()
        this.#model = new GameModel()
        this.#scene = new Scene()
        this.#reels = new Reels(this.#renderer, this.#model, this.#audioManager)
        this.#statPanel = new StatPanel(this.#renderer, this.#model)
        this.#button = new Button(this.#renderer, this.#model)
        this.#winPopup = new WinPopup(this.#renderer, this.#model, this.#audioManager)

        this.#ticker = new Ticker((dt) => this.#update(dt))

        this.#init()
    }

    async #init() {
        const assets = [
            document.fonts.load('900 90px Montserrat'),
            this.#renderer.init(),
            this.#audioManager.init(),
        ]

        await Promise.all(assets)

        this.#scene
            .add(new Background(this.#renderer))
            .add(new Zeus(this.#renderer))
            .add(new Logo(this.#renderer))
            .add(new ReelsBg(this.#renderer))
            .add(this.#reels)
            .add(this.#statPanel)
            .add(this.#button)
            .add(this.#winPopup)

        this.#scene.updatePositions()
        this.#button.init()
        this.#updateCanvasCache()

        window.addEventListener('resize', this.#handleResize)
        this.#renderer.canvas?.addEventListener('click', this.#handleClick)

        this.#ticker.start()
    }

    #updateCanvasCache() {
        if (!this.#renderer.canvas) return

        this.#canvasRect = this.#renderer.canvas.getBoundingClientRect()
    }

    #handleClick = (e: MouseEvent) => {
        if (!this.#canvasRect) return

        const clickX = e.clientX - this.#canvasRect.left
        const clickY = e.clientY - this.#canvasRect.top

        this.#handleFirstClick()

        if (this.#winPopup.isInstallClicked(clickY)) {
            this.#redirectToStore()
            return
        }

        if (this.#button.isClicked(clickX, clickY)) {
            if (this.#model.spin()) {
                this.#reels.startSpin()
            }
        }
    }

    #handleFirstClick() {
        if (!this.#isGameStarted) {
            this.#isGameStarted = true
            this.#audioManager.playMusic()
        }
    }

    #redirectToStore() {
        if (typeof (window as any).FbPlayableAd !== 'undefined') {
            ;(window as any).FbPlayableAd.onCTAClick()
        } else {
            console.log('Action: onCTAClick (Store Redirect)')
        }
    }

    #handleResize = () => {
        this.#renderer.handleResize()
        this.#updateCanvasCache()
        this.#scene.updatePositions()
    }

    #update(dt: number) {
        this.#renderer.clear()
        this.#scene.update(dt)
        this.#scene.draw()
    }

    destroy() {
        this.#ticker.stop()
        window.removeEventListener('resize', this.#handleResize)
        this.#renderer.canvas?.removeEventListener('click', this.#handleClick)

        this.#scene.destroy()
        this.#renderer.destroy()
        this.#audioManager.destroy()
        this.#ticker.destroy()

        this.#canvasRect = null
    }
}
