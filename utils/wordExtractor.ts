"use client"

// Common stop words to filter out
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
  "to", "was", "will", "with", "i", "you", "we", "they", "this",
  "but", "or", "not", "my", "your", "their", "our", "have", "had",
  "can", "could", "would", "should", "may", "might", "must", "am",
  "been", "being", "do", "does", "did", "doing", "some", "all",
  "just", "so", "than", "very", "s", "t", "um", "uh", "like"
])

export interface Word {
  text: string
  frequency: number
  timestamp: number
}

export class WordExtractor {
  private wordMap: Map<string, Word> = new Map()
  private readonly minWordLength = 3
  private readonly maxWords = 50

  /**
   * Extract and process words from transcript
   */
  extractWords(transcript: string): Word[] {
    const words = this.tokenize(transcript)
    const now = Date.now()

    // Update frequency map
    words.forEach((word) => {
      const normalized = word.toLowerCase()

      if (this.isValidWord(normalized)) {
        const existing = this.wordMap.get(normalized)

        if (existing) {
          existing.frequency++
          existing.timestamp = now
        } else {
          this.wordMap.set(normalized, {
            text: normalized,
            frequency: 1,
            timestamp: now,
          })
        }
      }
    })

    // Convert to array and sort by frequency
    const allWords = Array.from(this.wordMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, this.maxWords)

    return allWords
  }

  /**
   * Get new words from the latest transcript
   */
  getNewWords(transcript: string): string[] {
    const words = this.tokenize(transcript)
    const newWords: string[] = []

    words.forEach((word) => {
      const normalized = word.toLowerCase()
      if (this.isValidWord(normalized) && !this.wordMap.has(normalized)) {
        newWords.push(normalized)
      }
    })

    return newWords
  }

  /**
   * Get all words currently tracked
   */
  getAllWords(): Word[] {
    return Array.from(this.wordMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, this.maxWords)
  }

  /**
   * Clear old words (older than threshold)
   */
  clearOldWords(ageThresholdMs: number = 60000) {
    const now = Date.now()
    const toRemove: string[] = []

    this.wordMap.forEach((word, key) => {
      if (now - word.timestamp > ageThresholdMs) {
        toRemove.push(key)
      }
    })

    toRemove.forEach((key) => this.wordMap.delete(key))
  }

  /**
   * Clear all words
   */
  clearAll() {
    this.wordMap.clear()
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ") // Remove punctuation
      .split(/\s+/)
      .filter((word) => word.length > 0)
  }

  /**
   * Check if word is valid (not a stop word, meets length requirements)
   */
  private isValidWord(word: string): boolean {
    return (
      word.length >= this.minWordLength &&
      !STOP_WORDS.has(word) &&
      !/^\d+$/.test(word) // Not just numbers
    )
  }

  /**
   * Get word sentiment/emotion (simplified version)
   * In a real implementation, you could use Transformer.js sentiment model
   */
  getWordEmotion(word: string): "positive" | "negative" | "neutral" {
    const positiveWords = new Set([
      "happy", "joy", "love", "peace", "calm", "beautiful", "wonderful",
      "amazing", "good", "great", "excellent", "fantastic", "perfect",
      "hope", "dream", "light", "bright", "warm", "smile", "laugh"
    ])

    const negativeWords = new Set([
      "sad", "angry", "fear", "pain", "hurt", "dark", "cold", "lonely",
      "bad", "terrible", "awful", "horrible", "hate", "worry", "stress",
      "anxious", "scared", "afraid", "cry", "lost"
    ])

    const normalized = word.toLowerCase()

    if (positiveWords.has(normalized)) return "positive"
    if (negativeWords.has(normalized)) return "negative"
    return "neutral"
  }
}

// Singleton instance
let extractorInstance: WordExtractor | null = null

export function getWordExtractor(): WordExtractor {
  if (!extractorInstance) {
    extractorInstance = new WordExtractor()
  }
  return extractorInstance
}
