import './style.css'
import './assets/images/spritesheet.css'

import musicUrl from './assets/audio/background.mp3'
//import spritesheetUrl from './assets/images/spritesheet.webp';
import bgMainUrl from './assets/images/background.webp'

const bgMusic = new Audio(musicUrl)
bgMusic.loop = true
bgMusic.volume = 0.4

let isGameStarted = false

function init() {
    console.log('Playable Loaded')

    const app = document.querySelector<HTMLDivElement>('#app')!
    app.style.backgroundImage = `url(${bgMainUrl})`

    window.addEventListener('click', handleFirstClick, { once: true })
}

function handleFirstClick() {
    if (!isGameStarted) {
        isGameStarted = true

        bgMusic.play().catch((e) => console.error('Audio playback failed', e))

        startGame()
    }
}

function startGame() {
    console.log('Game Sequence Started')
}

window.onload = init
