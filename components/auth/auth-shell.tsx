"use client"

import { ReactNode } from "react"

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-400 mb-6">{subtitle}</p>
        )}

        {children}
      </div>
    </div>
  )
}