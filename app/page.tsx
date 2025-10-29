import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Waves } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col relative">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/assets/homevideo.mp4" type="video/mp4" />
      </video>

      {/* Overlay for better text readability */}
      <div className="fixed inset-0 bg-black/40 -z-5" />

      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md sticky top-0 z-50 bg-black/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-semibold tracking-tight text-white">Inner Tides</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-white/80 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/visualize">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Experience
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
            <Waves className="w-4 h-4" />
            <span>A Creativity Bot</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight text-white drop-shadow-lg">Inner Tides</h1>

          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto text-pretty drop-shadow-md">
            Silence isn't empty—it's where thinking, recovery, and tiny acts of care happen. Inner Tides listens softly
            to your day's quiet moments, sketches their frequency "fingerprints," and answers with a unique echo from
            the ocean—orca-inspired tones and living visuals that grow with you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/visualize">
              <Button size="lg" className="text-base px-8 shadow-lg">
                Begin Your Journey
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/20 bg-black/50 backdrop-blur-md px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Listen Softly</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Capture your quiet moments through gentle audio input, respecting the sanctity of silence.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                <span className="text-2xl">🌊</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Living Visuals</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Watch as your emotional frequencies transform into flowing, organic patterns that evolve with you.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                <span className="text-2xl">🐋</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Orca Echoes</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Experience unique ocean soundscapes that respond to your stillness with orca-inspired tones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-black/50 backdrop-blur-md px-4 py-8">
        <div className="container mx-auto text-center text-sm text-white/70">
          <p>© 2025 Inner Tides. A space for quiet reflection.</p>
        </div>
      </footer>
    </main>
  )
}
