import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SelectListDialog } from "@/components/lists/select-list-dialog";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormType } from "@/schemas/profile-form";

interface FormFieldsProps {
  form: UseFormReturn<ProfileFormType>;
  csvUrls: string[];
  clearCsvUrls: () => void;
  handleListSelect: (profiles: string[]) => void;
  handleCsvUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormFields({ 
  form, 
  csvUrls, 
  clearCsvUrls, 
  handleListSelect, 
  handleCsvUpload 
}: FormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="@"
        render={({ field }) => (
          <FormItem>
            <FormLabel>X Username(s)</FormLabel>
            <FormControl>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    placeholder="e.g. user1, user2" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value) {
                        clearCsvUrls();
                      }
                    }}
                    disabled={csvUrls.length > 0}
                  />
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => field.onChange('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <SelectListDialog onSelect={handleListSelect} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Other form fields... */}
      {/* Copy the rest of the form fields from the original component */}
    </>
  );
} 