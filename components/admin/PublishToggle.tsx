import { Button } from "@/components/ui/button"
import { CheckCircle2, CircleDashed } from "lucide-react"

interface PublishToggleProps {
  status: "draft" | "published" | "archived"
  onToggle: () => void
}

export function PublishToggle({ status, onToggle }: PublishToggleProps) {
  const isPublished = status === "published"
  return (
    <Button
      variant={isPublished ? "default" : "outline"}
      className="rounded-full px-4 py-2 text-sm"
      onClick={onToggle}
    >
      {isPublished ? (
        <>
          <CheckCircle2 className="h-4 w-4" /> Published
        </>
      ) : (
        <>
          <CircleDashed className="h-4 w-4" /> Save as draft
        </>
      )}
    </Button>
  )
}
