import * as React from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to show toast notifications for form validation errors.
 * Extracts specific field error messages from react-hook-form errors object.
 */
export function useFormValidationToast() {
  const { toast } = useToast();

  const showValidationErrors = React.useCallback((errors) => {
    // Flatten nested errors (like for arrays with useFieldArray)
    const flattenErrors = (obj, prefix = '') => {
      const messages = [];
      
      for (const [key, value] of Object.entries(obj)) {
        const fieldName = prefix ? `${prefix}.${key}` : key;
        
        if (value?.message) {
          // Format field name for display (e.g., firstName → First Name)
          const displayName = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\w/, c => c.toUpperCase())
            .trim();
          messages.push(`• ${displayName}: ${value.message}`);
        } else if (typeof value === 'object' && value !== null) {
          // Handle nested errors (arrays or objects)
          messages.push(...flattenErrors(value, fieldName));
        }
      }
      
      return messages;
    };

    const errorMessages = flattenErrors(errors);
    
    if (errorMessages.length > 0) {
      // Limit to first 5 errors for readability
      const displayMessages = errorMessages.slice(0, 5);
      const remaining = errorMessages.length - 5;
      
      let description = displayMessages.join('\n');
      if (remaining > 0) {
        description += `\n... and ${remaining} more error(s)`;
      }

      toast({
        title: 'Validation Failed',
        description,
        variant: 'destructive',
      });
    }
  }, [toast]);

  return { showValidationErrors };
}
