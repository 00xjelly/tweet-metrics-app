import { Button } from "@/components/ui/button";
import { Search, Loader2 } from 'lucide-react';
import { UseFormReturn } from "react-hook-form";
import { ProfileFormType } from "@/schemas/profile-form";

interface SubmitButtonProps {
  isLoading: boolean;
  csvUrls: string[];
  form: UseFormReturn<ProfileFormType>;
}

export function SubmitButton({ isLoading, csvUrls, form }: SubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isLoading || (csvUrls.length === 0 && !form.getValues('@'))}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Analyze Profiles
        </>
      )}
    </Button>
  );
} 