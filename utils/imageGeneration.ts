"use client"

/**
 * Generate an image using Hugging Face Inference Providers API
 *
 * To use this:
 * 1. Sign up at https://huggingface.co/
 * 2. Generate a free API token at https://huggingface.co/settings/tokens
 * 3. Add NEXT_PUBLIC_HF_API_TOKEN to your .env.local file
 *
 * Free tier includes:
 * - Rate limited but sufficient for development
 * - Stable Diffusion XL model
 * - Can upgrade to Pro ($9/month) for faster inference
 *
 * Note: Updated to use the new Inference Providers API endpoint (November 2025)
 * Old endpoint (api-inference.huggingface.co) has been deprecated
 */

const HF_API_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"

interface ImageGenerationOptions {
  activity: string
  feeling: string
  apiToken?: string
}

/**
 * Generate a memory image based on activity and feeling
 */
export async function generateMemoryImage(options: ImageGenerationOptions): Promise<string | null> {
  const { activity, feeling, apiToken } = options

  // Check if API token is available
  const token = apiToken || process.env.NEXT_PUBLIC_HF_API_TOKEN

  if (!token) {
    console.warn("[ImageGen] No Hugging Face API token configured. Using placeholder image instead.")
    console.info("[ImageGen] To enable AI image generation, add NEXT_PUBLIC_HF_API_TOKEN to .env.local")
    return null
  }

  // Create prompt
  const prompt = `Generate a memory of a person ${activity} with a ${feeling} emotion in animation style. Soft colors, peaceful atmosphere, artistic illustration.`

  console.log("[ImageGen] Generating image with prompt:", prompt)

  try {
    // Call Hugging Face Inference API
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: "ugly, blurry, low quality, distorted, deformed",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[ImageGen] API error:", response.status, errorText)

      // Handle rate limiting
      if (response.status === 429) {
        console.error("[ImageGen] Rate limited. Please wait or upgrade to Hugging Face Pro.")
      }

      // Handle permission errors
      if (response.status === 403) {
        console.error("[ImageGen] Permission denied. Please create a new API token with 'Make calls to serverless Inference API' permission enabled.")
        console.info("[ImageGen] Go to https://huggingface.co/settings/tokens and create a token with inference permissions.")
      }

      return null
    }

    // Convert response to blob
    const blob = await response.blob()

    // Convert blob to data URL for storage in localStorage
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        console.log("[ImageGen] Image generated successfully")
        resolve(dataUrl)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("[ImageGen] Error generating image:", error)
    return null
  }
}

/**
 * Alternative: Generate placeholder image with text (fallback for testing)
 */
export function generatePlaceholderImage(activity: string, feeling: string): string {
  // Define colors based on feeling
  const colorMap: Record<string, { bg: string; gradient1: string; gradient2: string; text: string }> = {
    happy: { bg: "#FEF3C7", gradient1: "#FDE68A", gradient2: "#FCD34D", text: "#92400E" },
    calm: { bg: "#DBEAFE", gradient1: "#BFDBFE", gradient2: "#93C5FD", text: "#1E3A8A" },
    peaceful: { bg: "#D1FAE5", gradient1: "#A7F3D0", gradient2: "#6EE7B7", text: "#065F46" },
    nervous: { bg: "#E9D5FF", gradient1: "#D8B4FE", gradient2: "#C084FC", text: "#581C87" },
    excited: { bg: "#FECACA", gradient1: "#FCA5A5", gradient2: "#F87171", text: "#7F1D1D" },
    thoughtful: { bg: "#C7D2FE", gradient1: "#A5B4FC", gradient2: "#818CF8", text: "#3730A3" },
  }

  const colors = colorMap[feeling] || colorMap.calm

  // Escape XML special characters in text
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")

  const escapedActivity = escapeXml(activity)
  const escapedFeeling = escapeXml(feeling)

  // Create an artistic SVG placeholder with gradients
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.gradient1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.gradient2};stop-opacity:1" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="512" height="512" fill="${colors.bg}"/>

      <!-- Decorative circles -->
      <circle cx="100" cy="100" r="80" fill="url(#grad1)" opacity="0.3" filter="url(#blur)"/>
      <circle cx="412" cy="412" r="100" fill="url(#grad1)" opacity="0.3" filter="url(#blur)"/>
      <circle cx="400" cy="100" r="60" fill="url(#grad1)" opacity="0.2" filter="url(#blur)"/>
      <circle cx="100" cy="400" r="70" fill="url(#grad1)" opacity="0.2" filter="url(#blur)"/>

      <!-- Center content -->
      <text x="256" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="600" fill="${colors.text}" text-anchor="middle">
        Silence Memory
      </text>

      <text x="256" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${colors.text}" text-anchor="middle" opacity="0.7">
        ${escapedActivity}
      </text>

      <text x="256" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="${colors.text}" text-anchor="middle" opacity="0.5">
        Feeling: ${escapedFeeling}
      </text>

      <!-- Decorative wave -->
      <path d="M 0 320 Q 128 300 256 320 T 512 320 L 512 512 L 0 512 Z" fill="url(#grad1)" opacity="0.2"/>
    </svg>
  `

  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
