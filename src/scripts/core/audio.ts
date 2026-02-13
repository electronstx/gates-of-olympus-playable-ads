import musicUrl from '../../assets/audio/background.mp3'

export class AudioManager {
    #music: HTMLAudioElement | null = null
    #activeSound: Set<HTMLAudioElement> = new Set()

    constructor() {
        this.#music = new Audio(musicUrl)
        this.#music.loop = true
        this.#music.volume = 0.4
    }

    playMusic() {
        this.#music?.play().catch(() => {
            console.log('Waiting for click to start music')
        })
    }

    playSound(url: string) {
        const sound = new Audio(url)
        sound.volume = 0.6
        this.#activeSound.add(sound)

        sound.onended = () => this.#activeSound.delete(sound)
        sound.play()
    }

    destroy(): void {
        if (this.#music) {
            this.#music.pause()
            this.#music.src = ''
            this.#music.load()
            this.#music = null
        }

        this.#activeSound.forEach((sound) => {
            sound.pause()
            sound.src = ''
            sound.load()
        })
        this.#activeSound.clear()
    }
}
