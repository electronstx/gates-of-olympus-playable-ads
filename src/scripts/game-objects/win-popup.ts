import { Renderer } from '../core/renderer'
import { GameModel } from '../core/game-model'
import { GAME_STATE, type GameObject } from '../types'
import { GAME_CONFIG } from '../config/config'
import { ASSET_MAP, ASSETS_AUDIO } from '../config/assets'
import { Coin } from './coin'
import type { AudioManager } from '../core/audio'

export class WinPopup implements GameObject {
    #renderer: Renderer | null
    #model: GameModel | null
    #audioManager: AudioManager | null
    #visible = false
    #currentText: 'nice-text' | 'sensational-text' | null = null
    #scale = 0
    #alpha = 0
    #coinPool: Coin[] = []
    #maxPoolSize = 40
    #pulseAngle = 0
    #installTextCanvas: HTMLCanvasElement | null = null
    #isSoundPlayed = false

    #geo = {
        centerX: 0,
        screenH: 0,
        topY: 0,
        bottomY: 0,
        winTextY: 0,
        fontSize: 0,
        bgBaseScale: 0,
        textBaseScale: 0,
        banknoteBaseScale: 0,
        banknoteArcRadius: 0,
        winBgBaseScale: 0,
        btnBaseScale: 0,
    }

    constructor(renderer: Renderer, model: GameModel, audioManager: AudioManager) {
        this.#renderer = renderer
        this.#model = model
        this.#audioManager = audioManager

        for (let i = 0; i < this.#maxPoolSize; i++) {
            this.#coinPool.push(new Coin())
        }
    }

    updatePosition(): void {
        if (!this.#renderer) return
        const { bg, symbolSize } = this.#renderer.layout
        const g = this.#geo

        g.centerX = bg.w / 2
        g.screenH = bg.h
        g.topY = bg.h * 0.2
        g.bottomY = bg.h - symbolSize * 1.2
        g.winTextY = bg.h / 2 + symbolSize * 2.5
        g.fontSize = Math.floor(symbolSize)

        const bgData = ASSET_MAP['text-background']
        g.bgBaseScale = (bg.w * 1.3) / (bgData.rotated ? bgData.h : bgData.w)

        const banknoteData = ASSET_MAP['banknote']
        const bW = banknoteData.rotated ? banknoteData.h : banknoteData.w
        const bH = banknoteData.rotated ? banknoteData.w : banknoteData.h
        g.banknoteBaseScale = (symbolSize * 1.5) / bW
        g.banknoteArcRadius = (bH * g.banknoteBaseScale) / 2

        const btnData = ASSET_MAP['install-button']
        g.btnBaseScale = (bg.w * 0.6) / (btnData.rotated ? btnData.h : btnData.w)

        const winBgData = ASSET_MAP['win-background']
        g.winBgBaseScale = (bg.w * 0.7) / (winBgData.rotated ? winBgData.h : winBgData.w)

        this.#geo.centerX = g.centerX
    }

    #prepareInstallText() {
        if (this.#installTextCanvas) return
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
        if (!this.#renderer?.ctx || !this.#visible || !this.#currentText || !this.#model) return

        const ctx = this.#renderer.ctx
        const g = this.#geo
        const scenarioIndex = this.#model.currentSpinIndex
        const isLastSpin = scenarioIndex === 3
        const win = GAME_CONFIG.SPIN_SCENARIOS[scenarioIndex].win

        ctx.save()

        ctx.fillStyle = `rgba(0, 0, 0, ${this.#alpha})`
        ctx.fillRect(0, 0, this.#renderer.layout.bg.w, g.screenH)

        const pulse = 1 + Math.sin(this.#pulseAngle) * 0.04
        const s = this.#scale

        this.#renderer.drawSprite('text-background', g.centerX, g.topY, g.bgBaseScale * s)

        const textData = ASSET_MAP[this.#currentText]
        const textScale =
            (this.#renderer.layout.bg.w * 0.85) / (textData.rotated ? textData.h : textData.w)
        this.#renderer.drawSprite(
            this.#currentText,
            g.centerX,
            g.topY,
            textScale * s,
            textData.rotated ? -Math.PI / 2 : 0
        )

        const bData = ASSET_MAP['banknote']
        const bRot = bData.rotated ? -Math.PI / 2 : 0
        const bCount = isLastSpin ? 15 : 10
        const arcAngle = Math.PI / 1.5
        const pivotY = g.screenH / 2

        for (let i = 0; i < bCount; i++) {
            const angle = (i / (bCount - 1) - 0.5) * arcAngle
            const bX = g.centerX + Math.sin(angle) * g.banknoteArcRadius
            const bY = pivotY - Math.cos(angle) * g.banknoteArcRadius

            this.#renderer.drawSprite('banknote', bX, bY, g.banknoteBaseScale * s, bRot + angle)
        }

        if (isLastSpin) {
            this.#renderer.drawSprite('win-background', g.centerX, g.winTextY, g.winBgBaseScale * s)

            this.#prepareInstallText()
            const btnS = g.btnBaseScale * pulse * s
            this.#renderer.drawSprite('install-button', g.centerX, g.bottomY, btnS)

            if (this.#installTextCanvas) {
                ctx.save()
                ctx.translate(g.centerX, g.bottomY)
                ctx.scale(btnS, btnS)
                ctx.drawImage(this.#installTextCanvas, -200, -50)
                ctx.restore()
            }
        }

        ctx.font = `900 ${Math.floor(g.fontSize * s)}px Montserrat`
        ctx.textAlign = 'center'
        ctx.fillStyle = '#FFD700'

        if (isLastSpin) {
            ctx.fillText(`${win}€`, g.centerX, g.winTextY - g.fontSize)
            ctx.fillText(`+250FS`, g.centerX, g.winTextY + g.fontSize / 4)
        } else {
            ctx.fillText(`WIN ${win}€`, g.centerX, g.winTextY)
        }

        ctx.globalAlpha = Math.min(this.#alpha * 1.4, 1)
        this.#coinPool.forEach((c) => {
            if (c.y < g.screenH + 50) {
                this.#renderer?.drawSprite(
                    'coin',
                    c.x,
                    c.y,
                    Math.cos(c.flip) * c.scale * s,
                    c.rotation,
                    c.scale * s
                )
            }
        })

        ctx.restore()
    }

    update(dt: number) {
        if (!this.#model || !this.#audioManager) return

        const isWin = this.#model.state === GAME_STATE.WIN || this.#model.state === GAME_STATE.END
        if (!isWin) {
            this.#visible = false
            this.#scale = 0
            this.#alpha = 0
            this.#currentText = null
            this.#isSoundPlayed = false
            return
        }

        if (this.#geo.centerX === 0) this.updatePosition()

        this.#pulseAngle += 4 * dt
        const idx = this.#model.currentSpinIndex
        this.#currentText = idx === 2 ? 'nice-text' : idx === 3 ? 'sensational-text' : null

        if (this.#currentText && !this.#isSoundPlayed) {
            this.#isSoundPlayed = true
            this.#audioManager.playSound(
                this.#currentText === 'nice-text' ? ASSETS_AUDIO.WIN : ASSETS_AUDIO.BIG_WIN
            )
        }

        if (this.#currentText) {
            if (!this.#visible) {
                this.#visible = true
                this.#coinPool.forEach((c) => c.reset(this.#renderer?.layout.bg.w))
            }
            this.#scale = Math.min(this.#scale + dt * 4, 0.9)
            this.#alpha = Math.min(this.#alpha + dt * 2, 0.7)
            this.#coinPool.forEach((c) => c.update(dt))
        }
    }

    isInstallClicked(clickY: number): boolean {
        return (
            this.#visible && this.#model?.currentSpinIndex === 3 && clickY > this.#geo.bottomY - 100
        )
    }

    destroy() {
        if (this.#installTextCanvas) {
            this.#installTextCanvas.width = 0
            this.#installTextCanvas.height = 0
            this.#installTextCanvas = null
        }

        this.#renderer = null
        this.#model = null
        this.#audioManager = null
    }
}
