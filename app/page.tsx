import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Waves } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FBFBFA]">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold tracking-tight text-gray-900">Inner Tides</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/memory" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Memory
            </Link>
            <Link href="/visualize">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Experience
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-4">
            <Waves className="w-4 h-4" />
            <span>A Creativity Bot</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight text-gray-900">Inner Tides</h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto text-pretty">
            Silence isn't empty—it's where thinking, recovery, and tiny acts of care happen. Inner Tides listens softly
            to your day's quiet moments, sketches their frequency "fingerprints," and answers with a unique echo from
            the ocean—orca-inspired tones and living visuals that grow with you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/visualize">
              <Button size="lg" className="text-base px-8 bg-gray-900 text-white hover:bg-gray-800">
                Begin Your Journey
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8 border-gray-300 text-gray-700 hover:bg-gray-100">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-gray-200 bg-white px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 text-center p-6 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Listen Softly</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Capture your quiet moments through gentle audio input, respecting the sanctity of silence.
              </p>
            </div>

            <div className="space-y-4 text-center p-6 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto">
                <span className="text-2xl">🌊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Living Visuals</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Watch as your emotional frequencies transform into flowing, organic patterns that evolve with you.
              </p>
            </div>

            <div className="space-y-4 text-center p-6 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto">
                <span className="text-2xl">🐋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Orca Echoes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Experience unique ocean soundscapes that respond to your stillness with orca-inspired tones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-8">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© 2025 Inner Tides. A space for quiet reflection.</p>
        </div>
      </footer>
    </main>
  )
}
