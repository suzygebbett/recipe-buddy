import type { ReactNode } from "react"

export default function LoggedInShell({ children }: { children: ReactNode }) {
  return (
    <div className=" flex h-screen w-screen flex-col">
      <div className="sticky flex max-h-14 grow flex-row items-center justify-around bg-blue-300 text-white">
        <span>Recipe Buddy</span>
      </div>
      <div className="grow">{children}</div>
    </div>
  )
}
