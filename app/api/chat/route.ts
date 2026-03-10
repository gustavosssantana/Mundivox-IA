import { NextResponse } from "next/server"

/**
 * POST /api/chat
 *
 * Professional API Route for Next.js 14+ (App Router)
 * Receives a JSON with 'message' field, forwards to n8n webhook, and returns AI response.
 */

interface ChatRequest {
  message: string
}

interface WebhookResponse {
  response?: string
  output?: string
  message?: string
  text?: string
  [key: string]: unknown
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: ChatRequest = await request.json()

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Invalid request: 'message' field is required and must be a string" },
        { status: 400 }
      )
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL environment variable is not configured")
      return NextResponse.json(
        { error: "Server configuration error: webhook URL not configured" },
        { status: 500 }
      )
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: body.message.trim(),
      }),
    })

    if (!webhookResponse.ok) {
      console.error(`Webhook error: ${webhookResponse.status} ${webhookResponse.statusText}`)
      return NextResponse.json(
        { error: `Webhook returned error: ${webhookResponse.status}` },
        { status: webhookResponse.status }
      )
    }

    const data: WebhookResponse = await webhookResponse.json()

    // Extract the AI response from common response formats
    const aiResponse = data.response || data.output || data.message || data.text || JSON.stringify(data)

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}
