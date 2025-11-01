"use client"

export interface SurveyResponse {
  id: string
  timestamp: number
  activity: string
  feeling: string
  orcaId: string
  capturedWordsCount: number
  imageUrl?: string // AI-generated image URL
}

const STORAGE_KEY = "inner-tides-survey-responses"

/**
 * Save a survey response to localStorage
 */
export function saveSurveyResponse(response: SurveyResponse): void {
  try {
    const existing = getAllSurveyResponses()
    existing.push(response)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    console.log("[Survey] Response saved:", response)
  } catch (error) {
    console.error("[Survey] Error saving response:", error)
  }
}

/**
 * Get all survey responses from localStorage
 */
export function getAllSurveyResponses(): SurveyResponse[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data) as SurveyResponse[]
  } catch (error) {
    console.error("[Survey] Error reading responses:", error)
    return []
  }
}

/**
 * Export survey responses as JSON file
 */
export function exportSurveyResponses(): void {
  try {
    const responses = getAllSurveyResponses()
    const json = JSON.stringify(responses, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `inner-tides-survey-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log("[Survey] Exported", responses.length, "responses")
  } catch (error) {
    console.error("[Survey] Error exporting responses:", error)
  }
}

/**
 * Clear all survey responses
 */
export function clearAllSurveyResponses(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log("[Survey] All responses cleared")
  } catch (error) {
    console.error("[Survey] Error clearing responses:", error)
  }
}

/**
 * Get survey statistics
 */
export function getSurveyStats() {
  const responses = getAllSurveyResponses()

  const feelingCounts: Record<string, number> = {}
  responses.forEach((response) => {
    feelingCounts[response.feeling] = (feelingCounts[response.feeling] || 0) + 1
  })

  return {
    totalResponses: responses.length,
    feelingDistribution: feelingCounts,
    mostCommonFeeling: Object.entries(feelingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "none",
  }
}
