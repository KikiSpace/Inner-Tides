"use client"

interface OceanBackgroundProps {
  emotionalColor: { r: number; g: number; b: number }
  audioLevel: number
}

export default function OceanBackground({ emotionalColor, audioLevel }: OceanBackgroundProps) {
  const { r, g, b } = emotionalColor

  // Create gradient colors based on emotional state
  const baseColor = `rgb(${r * 0.3}, ${g * 0.3}, ${b * 0.4})`
  const midColor = `rgb(${r * 0.5}, ${g * 0.5}, ${b * 0.6})`
  const lightColor = `rgb(${r * 0.7}, ${g * 0.7}, ${b * 0.8})`

  // Audio intensity affects animation speed
  const animationSpeed = 20 - audioLevel * 10 // 10-20 seconds

  return (
    <>
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            rgb(15, 20, 30) 0%,
            ${baseColor} 30%,
            ${midColor} 60%,
            ${lightColor} 100%)`,
          transition: "background 0.5s ease",
        }}
      />

      {/* Animated particle layer using CSS */}
      <div className="absolute inset-0 ocean-particles" style={{ opacity: 0.6 }} />

      {/* Flowing wave patterns */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.4 }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Wave pattern 1 */}
          <pattern
            id="wave1"
            x="0"
            y="0"
            width="400"
            height="400"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,100 Q100,80 200,100 T400,100"
              fill="none"
              stroke={`rgba(${r}, ${g}, ${b}, 0.3)`}
              strokeWidth="2"
            >
              <animate
                attributeName="d"
                values="M0,100 Q100,80 200,100 T400,100;M0,100 Q100,120 200,100 T400,100;M0,100 Q100,80 200,100 T400,100"
                dur={`${animationSpeed}s`}
                repeatCount="indefinite"
              />
            </path>
          </pattern>

          {/* Wave pattern 2 */}
          <pattern
            id="wave2"
            x="0"
            y="0"
            width="600"
            height="600"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,150 Q150,120 300,150 T600,150"
              fill="none"
              stroke={`rgba(${r * 1.2}, ${g * 1.2}, ${b * 1.2}, 0.2)`}
              strokeWidth="3"
            >
              <animate
                attributeName="d"
                values="M0,150 Q150,120 300,150 T600,150;M0,150 Q150,180 300,150 T600,150;M0,150 Q150,120 300,150 T600,150"
                dur={`${animationSpeed * 1.5}s`}
                repeatCount="indefinite"
              />
            </path>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#wave1)" />
        <rect width="100%" height="100%" fill="url(#wave2)" style={{ opacity: 0.5 }} />
      </svg>

      {/* Subtle shimmer effect */}
      <div
        className="absolute inset-0 shimmer-effect"
        style={{
          opacity: 0.1 + audioLevel * 0.2,
          transition: "opacity 0.3s ease",
        }}
      />

      <style jsx>{`
        .ocean-particles {
          background-image:
            radial-gradient(2px 2px at 20% 30%, rgba(${r}, ${g}, ${b}, 0.3), transparent),
            radial-gradient(2px 2px at 60% 70%, rgba(${r}, ${g}, ${b}, 0.3), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(${r}, ${g}, ${b}, 0.2), transparent),
            radial-gradient(1px 1px at 80% 10%, rgba(${r}, ${g}, ${b}, 0.2), transparent),
            radial-gradient(2px 2px at 90% 60%, rgba(${r}, ${g}, ${b}, 0.3), transparent),
            radial-gradient(1px 1px at 33% 80%, rgba(${r}, ${g}, ${b}, 0.2), transparent),
            radial-gradient(2px 2px at 15% 90%, rgba(${r}, ${g}, ${b}, 0.3), transparent);
          background-size: 200px 200px, 300px 300px, 250px 250px, 350px 350px, 180px 180px, 280px 280px, 220px 220px;
          background-position: 0 0, 40px 60px, 130px 270px, 70px 100px, 200px 50px, 150px 200px, 90px 180px;
          animation: particleFloat 60s linear infinite;
        }

        @keyframes particleFloat {
          0% {
            background-position: 0 0, 40px 60px, 130px 270px, 70px 100px, 200px 50px, 150px 200px, 90px 180px;
          }
          100% {
            background-position: 200px 200px, 240px 260px, 330px 470px, 270px 300px, 400px 250px, 350px 400px, 290px 380px;
          }
        }

        .shimmer-effect {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 70%
          );
          background-size: 200% 200%;
          animation: shimmer 8s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }
      `}</style>
    </>
  )
}
