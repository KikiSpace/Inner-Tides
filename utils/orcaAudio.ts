// Orca soundtrack utilities

const ORCA_SOUNDTRACKS = [
  "/orca-soundtracks/orca-1.mp3",
  "/orca-soundtracks/orca-2.mp3",
  "/orca-soundtracks/orca-3.mp3",
]

/**
 * Get a random orca soundtrack path
 */
export function getRandomOrcaSoundtrack(): string {
  const randomIndex = Math.floor(Math.random() * ORCA_SOUNDTRACKS.length)
  return ORCA_SOUNDTRACKS[randomIndex]
}

/**
 * Play a random orca soundtrack
 * Returns the Audio object so it can be controlled (stopped, etc.)
 */
export function playRandomOrcaSoundtrack(volume: number = 0.5): HTMLAudioElement {
  const soundtrackPath = getRandomOrcaSoundtrack()
  console.log(`[OrcaAudio] Playing soundtrack: ${soundtrackPath}`)

  const audio = new Audio(soundtrackPath)
  audio.volume = volume
  audio.play().catch((error) => {
    console.error("[OrcaAudio] Error playing audio:", error)
  })

  return audio
}

/**
 * Stop an audio element
 */
export function stopAudio(audio: HTMLAudioElement | null) {
  if (audio) {
    try {
      audio.pause()
      audio.currentTime = 0
    } catch (error) {
      // Gracefully handle any errors (e.g., if audio was already stopped)
      console.log("[OrcaAudio] Audio already stopped or cleaned up")
    }
  }
}
