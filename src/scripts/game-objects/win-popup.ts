import { Renderer } from '../core/renderer'
import { GameModel } from '../core/game-model'
import { GAME_STATE, type GameObject } from '../types'
import { GAME_CONFIG } from '../config/config'
import { ASSET_MAP } from '../config/asset-map'
import { Coin } from './coin'

export class WinPopup implements GameObject {
    #renderer: Renderer | null
    #model: GameModel | null
    #visible = false
    #currentText: 'nice-text' | 'sensational-text' | null = null
    #scale = 0
    #alpha = 0
    #coinPool: Coin[] = []
    #maxPoolSize = 40
    #pulseAngle = 0
    #installTextCanvas: HTMLCanvasElement | null = null

    constructor(renderer: Renderer, model: GameModel) {
        this.#renderer = renderer
        this.#model = model

        for (let i = 0; i < this.#maxPoolSize; i++) {
            this.#coinPool.push(new Coin())
        }
    }

    #prepareInstallText() {
        this.#installTextCanvas = document.createElement('canvas')
        this.#installTextCanvas.width = 400
        this.#installTextCanvas.height = 100
        const tCtx = this.#installTextCanvas.getContext('2d')!

        tCtx.font = '900 90px Montserrat'
        tCtx.fillStyle = '#ffffff'
        tCtx.textAlign = 'center'
        tCtx.textBaseline = 'middle'
        tCtx.fillText('INSTALL', 200, 50)
    }

    draw(): void {
        if (
            !this.#renderer ||
            !this.#renderer.ctx ||
            !this.#visible ||
            !this.#currentText ||
            !this.#model
        )
            return

        const ctx = this.#renderer.ctx
        const { symbolSize } = this.#renderer.layout
        const centerX = window.innerWidth / 2
        const screenH = window.innerHeight

        const topY = screenH * 0.2
        const bottomY = screenH - symbolSize * 1.2

        const textData = ASSET_MAP[this.#currentText]
        const bgData = ASSET_MAP['text-background']
        const banknoteData = ASSET_MAP['banknote']
        if (!textData || !bgData || !banknoteData) return

        const scenarioIndex = this.#model.currentSpinIndex
        const banknotesCount = scenarioIndex === 3 ? 15 : 10
        const win = GAME_CONFIG.SPIN_SCENARIOS[scenarioIndex].win

        ctx.save()

        ctx.fillStyle = `rgba(0, 0, 0, ${this.#alpha})`
        ctx.fillRect(0, 0, window.innerWidth, screenH)

        const pulseOffset = Math.sin(this.#pulseAngle) * 0.04
        const globalScale = this.#scale + pulseOffset

        const bgSourceW = bgData.rotated ? bgData.h : bgData.w
        const bgScale = (window.innerWidth * 1.3) / bgSourceW
        this.#renderer.drawSprite(
            'text-background',
            centerX,
            topY,
            bgScale * this.#scale,
            bgData.rotated ? -Math.PI / 2 : 0
        )

        const sourceW = textData.rotated ? textData.h : textData.w
        const textScale = (window.innerWidth * 0.85) / sourceW
        this.#renderer.drawSprite(
            this.#currentText,
            centerX,
            topY,
            textScale * this.#scale,
            textData.rotated ? -Math.PI / 2 : 0
        )

        const banknoteSourceW = banknoteData.rotated ? banknoteData.h : banknoteData.w
        const banknoteSourceH = banknoteData.rotated ? banknoteData.w : banknoteData.h

        const banknoteScale = (symbolSize * 1.5) / banknoteSourceW

        const arcRadius = (banknoteSourceH * banknoteScale) / 2

        const pivotY = window.innerHeight / 2
        const pivotX = centerX

        const arcAngle = Math.PI / 1.5
        const banknoteRotation = banknoteData.rotated ? -Math.PI / 2 : 0

        for (let i = 0; i < banknotesCount; i++) {
            const angle = (i / (banknotesCount - 1) - 0.5) * arcAngle

            const banknoteX = pivotX + Math.sin(angle) * arcRadius
            const banknoteY = pivotY - Math.cos(angle) * arcRadius

            this.#renderer.drawSprite(
                'banknote',
                banknoteX,
                banknoteY,
                banknoteScale * this.#scale,
                banknoteRotation + angle
            )
        }

        const isLastSpin = scenarioIndex === 3
        const winTextY = window.innerHeight / 2 + symbolSize * 2.5

        if (isLastSpin) {
            const winBgData = ASSET_MAP['win-background']
            if (winBgData) {
                const winBgScale =
                    (window.innerWidth * 0.7) / (winBgData.rotated ? winBgData.h : winBgData.w)
                this.#renderer.drawSprite(
                    'win-background',
                    centerX,
                    winTextY,
                    winBgScale * this.#scale,
                    winBgData.rotated ? -Math.PI / 2 : 0
                )
            }

            if (!this.#installTextCanvas) this.#prepareInstallText()
            const btnData = ASSET_MAP['install-button']
            const btnScale = (window.innerWidth * 0.6) / (btnData.rotated ? btnData.h : btnData.w)
            const currentBtnScale = globalScale * btnScale

            this.#renderer.drawSprite(
                'install-button',
                centerX,
                bottomY,
                btnScale * globalScale,
                btnData.rotated ? -Math.PI / 2 : 0
            )

            ctx.save()
            ctx.translate(centerX, bottomY)
            ctx.scale(currentBtnScale, currentBtnScale)
            ctx.drawImage(this.#installTextCanvas!, -200, -50)
            ctx.restore()
        }

        const fontSize = Math.floor(symbolSize)
        ctx.font = `900 ${fontSize}px Montserrat`
        ctx.textAlign = 'center'
        ctx.fillStyle = '#FFD700'

        if (isLastSpin) {
            ctx.fillText(`${win}€`, centerX, winTextY - fontSize)
            ctx.fillText(`+250FS`, centerX, winTextY + fontSize / 4)
        } else {
            ctx.fillText(`WIN ${win}€`, centerX, winTextY)
        }

        ctx.globalAlpha = this.#alpha * 1.4
        this.#coinPool.forEach((c) => {
            if (c.y > screenH + 50) return
            this.#renderer?.drawSprite(
                'coin',
                c.x,
                c.y,
                Math.cos(c.flip) * c.scale * this.#scale,
                c.rotation,
                c.scale * this.#scale
            )
        })

        ctx.restore()
    }

    update(dt: number): void {
        if (!this.#model) return

        const isActiveState =
            this.#model.state === GAME_STATE.WIN || this.#model.state === GAME_STATE.END

        if (!isActiveState) {
            this.#visible = false
            this.#scale = 0
            this.#alpha = 0
            this.#currentText = null
            this.#pulseAngle = 0
            return
        }

        this.#pulseAngle += 4 * dt

        const scenarioIndex = this.#model.currentSpinIndex

        if (scenarioIndex === 2) {
            this.#currentText = 'nice-text'
        } else if (scenarioIndex === 3) {
            this.#currentText = 'sensational-text'
        }

        if (this.#currentText) {
            if (!this.#visible) {
                this.#visible = true
                this.#coinPool.forEach((c) => c.reset())
            }

            this.#scale = Math.min(this.#scale + dt * 4, 0.9)
            this.#alpha = Math.min(this.#alpha + dt * 2, 0.7)

            this.#coinPool.forEach((c) => c.update(dt))
        }
    }

    destroy(): void {
        if (this.#installTextCanvas) {
            this.#installTextCanvas.width = 0
            this.#installTextCanvas.height = 0
            this.#installTextCanvas = null
        }

        this.#renderer = null
        this.#model = null
        this.#coinPool = []
    }

    isInstallClicked(clickY: number): boolean {
        if (!this.#visible || this.#currentText !== 'sensational-text') return false

        const yCenter = window.innerHeight / 2
        return clickY > yCenter
    }
}
