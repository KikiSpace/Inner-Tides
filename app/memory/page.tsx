"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Download, Trash2, RefreshCw } from "lucide-react"
import { MemoryTimeline } from "@/components/memory-timeline"
import { MemoryDetailPopup } from "@/components/memory-detail-popup"
import {
  getAllSurveyResponses,
  exportSurveyResponses,
  clearAllSurveyResponses,
  type SurveyResponse,
} from "@/utils/surveyStorage"

export default function MemoryPage() {
  const [memories, setMemories] = useState<SurveyResponse[]>([])
  const [selectedMemory, setSelectedMemory] = useState<SurveyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load memories from localStorage
  const loadMemories = () => {
    setIsLoading(true)
    const allMemories = getAllSurveyResponses()
    setMemories(allMemories)
    setIsLoading(false)
    console.log("[Memory] Loaded", allMemories.length, "memories")
  }

  useEffect(() => {
    loadMemories()
  }, [])

  const handleExport = () => {
    exportSurveyResponses()
    console.log("[Memory] Exported survey responses")
  }

  const handleClear = () => {
    if (confirm("Are you sure you want to delete all silence memories? This cannot be undone.")) {
      clearAllSurveyResponses()
      setMemories([])
      console.log("[Memory] Cleared all memories")
    }
  }

  const handleRefresh = () => {
    loadMemories()
    console.log("[Memory] Refreshed memories")
  }

  return (
    <main className="min-h-screen bg-[#FBFBFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                <span className="text-3xl">🐋</span>
                Silence Memory
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                A journal of your moments in silence
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-700 hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>

              {memories.length > 0 && (
                <>
                  <Button
                    onClick={handleExport}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>

                  <Button
                    onClick={handleClear}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </Button>
                </>
              )}

              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:bg-gray-100">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-600 text-xl">Loading memories...</div>
          </div>
        ) : (
          <MemoryTimeline
            memories={memories}
            onMemoryClick={setSelectedMemory}
          />
        )}
      </div>

      {/* Memory Detail Popup */}
      <MemoryDetailPopup
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />

      {/* Floating button to go to visualize page */}
      {memories.length === 0 && !isLoading && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
          <Link href="/visualize">
            <Button size="lg" className="gap-2 shadow-2xl">
              <span className="text-xl">🌊</span>
              Start Your Journey
            </Button>
          </Link>
        </div>
      )}
    </main>
  )
}
