'use client'

import { Form } from "@/components/ui/form"
import { useProfileForm } from '@/hooks/use-profile-form'
import { FormFields } from './form-fields'
import { SubmitButton } from './submit-button'
import { StatusMessages } from './status-messages'

export function ProfileSearchForm() {
  const {
    form,
    isLoading,
    error,
    csvUrls,
    processingStatus,
    handleListSelect,
    handleCsvUpload,
    clearCsvUrls,
    onSubmit
  } = useProfileForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormFields
          form={form}
          csvUrls={csvUrls}
          clearCsvUrls={clearCsvUrls}
          handleListSelect={handleListSelect}
          handleCsvUpload={handleCsvUpload}
        />
        
        <StatusMessages 
          error={error}
          processingStatus={processingStatus}
        />

        <SubmitButton 
          isLoading={isLoading}
          csvUrls={csvUrls}
          form={form}
        />
      </form>
    </Form>
  );
} 