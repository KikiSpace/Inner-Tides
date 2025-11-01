"use client"

import { X } from "lucide-react"
import type { SurveyResponse } from "@/utils/surveyStorage"

interface MemoryDetailPopupProps {
  memory: SurveyResponse | null
  onClose: () => void
}

const FEELING_EMOJIS: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  peaceful: "🕊️",
  nervous: "😰",
  excited: "🎉",
  thoughtful: "🤔",
}

const FEELING_BG_COLORS: Record<string, string> = {
  happy: "bg-yellow-50",
  calm: "bg-blue-50",
  peaceful: "bg-green-50",
  nervous: "bg-purple-50",
  excited: "bg-red-50",
  thoughtful: "bg-indigo-50",
}

const FEELING_BORDER_COLORS: Record<string, string> = {
  happy: "border-yellow-200",
  calm: "border-blue-200",
  peaceful: "border-green-200",
  nervous: "border-purple-200",
  excited: "border-red-200",
  thoughtful: "border-indigo-200",
}

export function MemoryDetailPopup({ memory, onClose }: MemoryDetailPopupProps) {
  if (!memory) return null

  const formattedDate = new Date(memory.timestamp).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const emoji = FEELING_EMOJIS[memory.feeling] || "✨"
  const bgColor = FEELING_BG_COLORS[memory.feeling] || "bg-blue-50"
  const borderColor = FEELING_BORDER_COLORS[memory.feeling] || "border-blue-200"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-200 rounded-t-2xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                <span className="text-3xl">{emoji}</span>
                Silence Memory
              </h2>
              <p className="mt-2 text-sm text-gray-500">{formattedDate}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* AI Generated Image */}
          {memory.imageUrl && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Memory Visualization</h3>
              <div className="relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                <img
                  src={memory.imageUrl}
                  alt={`Memory of ${memory.activity} with ${memory.feeling} feeling`}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            </div>
          )}

          {/* Feeling */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">How you felt</h3>
            <div className={`p-4 rounded-lg ${bgColor} border ${borderColor}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <span className="text-base font-medium text-gray-900 capitalize">{memory.feeling}</span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">What you were doing</h3>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-gray-900 leading-relaxed">{memory.activity}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Words Captured</div>
              <div className="text-xl font-semibold text-gray-900">{memory.capturedWordsCount}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Memory ID</div>
              <div className="text-xs font-mono text-gray-600">{memory.id.split("-").pop()}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 pb-4 text-center text-xs text-gray-400 border-t border-gray-100">
          <p>This memory was captured during a moment of silence.</p>
          <p className="mt-1">Press ESC or click outside to close.</p>
        </div>
      </div>
    </div>
  )
}
