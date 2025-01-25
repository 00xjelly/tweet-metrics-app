import { z } from "zod";

// Define the schema shape explicitly
const formSchema = {
  "@": z.string().optional(),
  twitterContent: z.string().optional(),
  username: z.string().optional(),
  csvFile: z.any().optional(),
  maxItems: z.number().max(200).optional(),
  includeReplies: z.boolean().default(false),
  dateRange: z.object({
    since: z.string().optional(),
    until: z.string().optional()
  }).optional()
} as const;

export const createProfileFormSchema = (csvUrls: string[]) => 
  z.object(formSchema).refine((data) => {
    const hasUsername = data['@'] && data['@'].trim().length > 0;
    const hasCsv = csvUrls.length > 0;
    return (hasUsername && !hasCsv) || (!hasUsername && hasCsv);
  }, {
    message: "Please provide either usernames OR a CSV file, not both and not neither"
  });

// Create a type for the form fields
export type FormFields = keyof z.infer<ReturnType<typeof createProfileFormSchema>>;

export type ProfileFormType = z.infer<ReturnType<typeof createProfileFormSchema>>;

export const defaultFormValues: ProfileFormType = {
  "@": "",
  twitterContent: "",
  username: "",
  csvFile: undefined,
  maxItems: 50,
  includeReplies: false,
  dateRange: {
    since: undefined,
    until: undefined
  }
}; 