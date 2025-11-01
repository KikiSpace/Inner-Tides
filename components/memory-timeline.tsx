"use client"

import { useState, useMemo } from "react"
import type { SurveyResponse } from "@/utils/surveyStorage"

interface MemoryTimelineProps {
  memories: SurveyResponse[]
  onMemoryClick: (memory: SurveyResponse) => void
}

const FEELING_EMOJIS: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  peaceful: "🕊️",
  nervous: "😰",
  excited: "🎉",
  thoughtful: "🤔",
}

const FEELING_COLORS: Record<string, string> = {
  happy: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  calm: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  peaceful: "bg-green-50 border-green-200 hover:bg-green-100",
  nervous: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  excited: "bg-red-50 border-red-200 hover:bg-red-100",
  thoughtful: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
}

export function MemoryTimeline({ memories, onMemoryClick }: MemoryTimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Group memories by date
  const groupedMemories = useMemo(() => {
    const groups: Record<string, SurveyResponse[]> = {}

    memories.forEach((memory) => {
      const date = new Date(memory.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(memory)
    })

    // Sort dates in descending order (most recent first)
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => {
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
      .map(([date, memories]) => ({
        date,
        memories: memories.sort((a, b) => b.timestamp - a.timestamp),
      }))
  }, [memories])

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-6xl mb-4">🌊</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Silence Memories Yet</h3>
        <p className="text-gray-500 text-center max-w-md">
          Start your journey by experiencing moments of silence. Your memories will appear here as you
          capture them.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

        {/* Memory groups by date */}
        <div className="space-y-10">
          {groupedMemories.map(({ date, memories: dayMemories }) => (
            <div key={date} className="relative">
              {/* Date header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                    <span className="text-xl">📅</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{date}</h3>
                  <p className="text-sm text-gray-500">{dayMemories.length} moment{dayMemories.length !== 1 ? "s" : ""} of silence</p>
                </div>
              </div>

              {/* Memories for this date */}
              <div className="ml-14 space-y-3">
                {dayMemories.map((memory) => {
                  const time = new Date(memory.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  const emoji = FEELING_EMOJIS[memory.feeling] || "✨"
                  const colorClass = FEELING_COLORS[memory.feeling] || "bg-blue-50 border-blue-200 hover:bg-blue-100"

                  return (
                    <button
                      key={memory.id}
                      onClick={() => onMemoryClick(memory)}
                      onMouseEnter={() => setHoveredId(memory.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`w-full text-left p-4 rounded-lg border ${colorClass} transition-all duration-150 ${
                        hoveredId === memory.id ? "shadow-md" : "shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Emoji */}
                        <div className="text-2xl">{emoji}</div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-medium text-gray-500">{time}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-600 capitalize">{memory.feeling}</span>
                          </div>

                          <p className="text-gray-900 text-sm font-medium line-clamp-2 mb-1.5">
                            {memory.activity}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{memory.capturedWordsCount} words captured</span>
                          </div>
                        </div>

                        {/* Hover indicator */}
                        <div
                          className={`flex items-center transition-opacity duration-150 ${
                            hoveredId === memory.id ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <span className="text-gray-400">→</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary footer */}
      <div className="mt-12 p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">{memories.length}</div>
            <div className="text-sm text-gray-500">Total Memories</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {new Set(groupedMemories.map(g => g.date)).size}
            </div>
            <div className="text-sm text-gray-500">Days Recorded</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {Math.round(memories.reduce((sum, m) => sum + m.capturedWordsCount, 0) / memories.length) || 0}
            </div>
            <div className="text-sm text-gray-500">Avg Words</div>
          </div>
        </div>
      </div>
    </div>
  )
}
