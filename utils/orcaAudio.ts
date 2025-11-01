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

  // Play with error handling for abort errors
  audio.play().catch((error) => {
    // AbortError is normal when audio is stopped before playing
    if (error.name === "AbortError") {
      console.log("[OrcaAudio] Audio playback was cancelled (normal behavior)")
    } else {
      console.log("[OrcaAudio] Audio playback handled:", error.message)
    }
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
