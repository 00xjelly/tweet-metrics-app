import { useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';
import { useMetrics } from "@/context/metrics-context";
import { processBatch } from "@/lib/batch-processor";
import { extractUsername } from "@/utils/url-validation";
import { processCsvFile } from "@/utils/csv-processor";
import { createProfileFormSchema, ProfileFormType, defaultFormValues, FormFields } from "@/schemas/profile-form";

export const useProfileForm = () => {
  const router = useRouter();
  const { setResults } = useMetrics();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvUrls, setCsvUrls] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const profileFormSchema = createProfileFormSchema(csvUrls);

  const form = useForm<ProfileFormType>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultFormValues
  });

  const clearCsvUrls = useCallback(() => {
    setCsvUrls([]);
    setError(null);
  }, []);

  const handleListSelect = useCallback((profiles: string[]) => {
    const usernames = profiles
      .map(url => extractUsername(url))
      .filter(username => username.length > 0)
      .join(', ');

    form.setValue('@', usernames);
    clearCsvUrls();
  }, [form, clearCsvUrls]);

  const handleCsvUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (form.getValues('@')) {
      form.setValue('@', '');
    }

    await processCsvFile(file, {
      onSuccess: (urls) => {
        setCsvUrls(urls);
        setError(null);
      },
      onError: (message) => {
        setError(message);
        setCsvUrls([]);
      },
      onComplete: () => {
        if (event.target) {
          event.target.value = '';
        }
      }
    });
  }, [form]);

  const onSubmit = async (values: ProfileFormType) => {
    setIsLoading(true);
    setError(null);
    setProcessingStatus('');
    
    try {
      let authors: string[] = [];
      
      if (csvUrls.length > 0) {
        authors = csvUrls.map(url => extractUsername(url)).filter(username => username.length > 0);
      } else if (values['@']) {
        authors = values['@'].split(',').map(s => s.trim()).filter(Boolean);
      }
      
      if (authors.length === 0) {
        setError('Please provide at least one username or upload a CSV file');
        setIsLoading(false);
        return;
      }

      const results = await processBatch({
        ids: authors,
        type: 'profiles',
        processingCallback: (current, total) => {
          setProcessingStatus(`Processing batch ${current}/${total}`);
        },
        params: {
          '@': values['@'],
          maxItems: values.maxItems,
          since: values.dateRange?.since,
          until: values.dateRange?.until,
          includeReplies: values.includeReplies,
          twitterContent: values.twitterContent || undefined
        }
      });

      setResults(results);
      router.push('/results');
    } catch (error) {
      console.error('Error analyzing profiles:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setProcessingStatus('');
    }
  };

  return {
    form,
    isLoading,
    error,
    csvUrls,
    processingStatus,
    handleListSelect,
    handleCsvUpload,
    clearCsvUrls,
    onSubmit
  };
}; 