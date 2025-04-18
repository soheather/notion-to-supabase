import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="w-full h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
        <p className="text-[#6e6e85] text-sm">페이지 로딩 중...</p>
      </div>
    </div>
  )
}
