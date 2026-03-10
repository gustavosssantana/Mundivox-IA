import { ChatShell } from "@/components/chat/chat-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chat - Mundi",
  description: "Converse com a Mundi, sua assistente de IA corporativa.",
}

export default function ChatPage() {
  return <ChatShell />
}
