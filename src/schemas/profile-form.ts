import { z } from "zod";

export const createProfileFormSchema = (csvUrls: string[]) => z.object({
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
}).refine((data) => {
  const hasUsername = data['@'] && data['@'].trim().length > 0;
  const hasCsv = csvUrls.length > 0;
  
  return (hasUsername && !hasCsv) || (!hasUsername && hasCsv);
}, {
  message: "Please provide either usernames OR a CSV file, not both and not neither"
});

export type ProfileFormType = z.infer<typeof createProfileFormSchema>;

export const defaultFormValues: Omit<z.infer<ReturnType<typeof createProfileFormSchema>>, 'csvFile'> = {
  "@": "",
  twitterContent: "",
  username: "",
  maxItems: 50,
  includeReplies: false,
  dateRange: {
    since: undefined,
    until: undefined
  }
}; 