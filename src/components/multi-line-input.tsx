import { FormDescription } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

interface MultiLineInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  description?: string
}

export function MultiLineInput({ description, ...props }: MultiLineInputProps) {
  return (
    <div className="grid gap-2">
      <Textarea {...props} />
      {description && (
        <FormDescription>{description}</FormDescription>
      )}
    </div>
  )
}