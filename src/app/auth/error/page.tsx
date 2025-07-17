import { Suspense } from "react"
import ClientError from "./ClientError"

export const metadata = {
  title: "Auth Error",
  description: "Authentication error page",
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <ClientError />
    </Suspense>
  )
}
