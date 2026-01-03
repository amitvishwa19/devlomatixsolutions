import { useMemo } from 'react';
import { FieldDef, ValidationError } from '../types';

export function useFieldValidation(fields: FieldDef[]) {
  const errors = useMemo(() => {
    const validationErrors: ValidationError[] = [];
    const fieldNames = new Set<string>();
    let hasId = false;

    for (const field of fields) {
      // Empty field name
      if (!field.name.trim()) {
        validationErrors.push({
          fieldId: field.id,
          message: 'Field name is required',
          type: 'error',
        });
        continue;
      }

      // Invalid field name format
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
        validationErrors.push({
          fieldId: field.id,
          message: 'Field name must start with a letter or underscore and contain only alphanumeric characters',
          type: 'error',
        });
      }

      // Reserved words
      const reservedWords = ['id', 'type', 'table', 'select', 'insert', 'update', 'delete', 'from', 'where'];
      if (reservedWords.includes(field.name.toLowerCase()) && !field.isId) {
        validationErrors.push({
          fieldId: field.id,
          message: `"${field.name}" is a reserved word, consider renaming`,
          type: 'warning',
        });
      }

      // Duplicate field names
      if (fieldNames.has(field.name.toLowerCase())) {
        validationErrors.push({
          fieldId: field.id,
          message: `Duplicate field name "${field.name}"`,
          type: 'error',
        });
      }
      fieldNames.add(field.name.toLowerCase());

      // Track ID field
      if (field.isId) {
        if (hasId) {
          validationErrors.push({
            fieldId: field.id,
            message: 'Only one field can be marked as ID',
            type: 'error',
          });
        }
        hasId = true;
      }

      // ID field shouldn't be optional
      if (field.isId && field.isOptional) {
        validationErrors.push({
          fieldId: field.id,
          message: 'ID field cannot be optional',
          type: 'error',
        });
      }

      // Default value compatibility
      if (field.defaultValue && field.defaultValue !== 'none') {
        if ((field.defaultValue === 'cuid' || field.defaultValue === 'uuid') && field.type !== 'String') {
          validationErrors.push({
            fieldId: field.id,
            message: `${field.defaultValue}() is only valid for String type`,
            type: 'error',
          });
        }
        if (field.defaultValue === 'now' && field.type !== 'DateTime') {
          validationErrors.push({
            fieldId: field.id,
            message: 'now() is only valid for DateTime type',
            type: 'error',
          });
        }
        if ((field.defaultValue === 'true' || field.defaultValue === 'false') && field.type !== 'Boolean') {
          validationErrors.push({
            fieldId: field.id,
            message: 'true/false is only valid for Boolean type',
            type: 'error',
          });
        }
        if (field.defaultValue === 'autoincrement' && field.type !== 'Int' && field.type !== 'BigInt') {
          validationErrors.push({
            fieldId: field.id,
            message: 'autoincrement() is only valid for Int or BigInt type',
            type: 'error',
          });
        }
      }
    }

    // Must have at least one ID field
    if (fields.length > 0 && !hasId) {
      validationErrors.push({
        fieldId: 'global',
        message: 'Schema should have at least one ID field',
        type: 'warning',
      });
    }

    return validationErrors;
  }, [fields]);

  const hasErrors = errors.some(e => e.type === 'error');
  const hasWarnings = errors.some(e => e.type === 'warning');
  
  const getFieldErrors = (fieldId: string) => errors.filter(e => e.fieldId === fieldId);
  const getGlobalErrors = () => errors.filter(e => e.fieldId === 'global');

  return {
    errors,
    hasErrors,
    hasWarnings,
    getFieldErrors,
    getGlobalErrors,
    isValid: !hasErrors,
  };
}
