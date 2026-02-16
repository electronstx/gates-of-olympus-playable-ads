import { ASSETS_AUDIO } from '../config/assets'

export class AudioManager {
    #music: HTMLAudioElement | null = null
    #soundCache: Map<string, HTMLAudioElement> = new Map()
    #activeSounds: Set<HTMLAudioElement> = new Set()

    constructor() {}

    async init(): Promise<void> {
        this.#music = new Audio(ASSETS_AUDIO.BG)
        this.#music.loop = true
        this.#music.volume = 0.4

        const loadPromises = [
            ASSETS_AUDIO.BIG_WIN,
            ASSETS_AUDIO.COMBO,
            ASSETS_AUDIO.SPIN,
            ASSETS_AUDIO.WIN,
        ].map((url) => this.#preload(url))

        await Promise.all(loadPromises)
    }

    #preload(url: string): Promise<void> {
        return new Promise((resolve) => {
            if (this.#soundCache.has(url)) return resolve()

            const audio = new Audio(url)
            audio.oncanplaythrough = () => resolve()
            audio.onerror = () => resolve()
            audio.load()
            this.#soundCache.set(url, audio)
        })
    }

    async playMusic() {
        if (!this.#music) return
        try {
            await this.#music.play()
        } catch {
            console.warn('Audio autoplay blocked or failed')
        }
    }

    playSound(url: string) {
        const original = this.#soundCache.get(url)

        if (!original) return

        const sound = original.cloneNode() as HTMLAudioElement
        sound.volume = 0.2

        this.#activeSounds.add(sound)

        sound.addEventListener(
            'ended',
            () => {
                this.#cleanupSound(sound)
            },
            { once: true }
        )

        sound.play().catch(() => this.#cleanupSound(sound))
    }

    #cleanupSound(sound: HTMLAudioElement) {
        this.#activeSounds.delete(sound)
        sound.pause()
        sound.src = ''
        sound.load()
    }

    destroy() {
        if (this.#music) {
            this.#music.pause()
            this.#music.src = ''
            this.#music = null
        }

        this.#activeSounds.forEach((s) => this.#cleanupSound(s))
        this.#activeSounds.clear()

        this.#soundCache.forEach((s) => {
            s.src = ''
            s.load()
        })
        this.#soundCache.clear()
    }
}
