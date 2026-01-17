// React Component Templates
const componentTemplates = [
  {
    id: 'functional-component',
    name: 'Functional Component',
    description: 'A basic React functional component',
    type: 'component',
    icon: 'Box',
    color: 'primary',
    options: [
      { name: 'componentName', label: 'Component Name', type: 'text', placeholder: 'MyComponent' },
      { name: 'withProps', label: 'Include Props', type: 'checkbox', default: true },
      { name: 'withChildren', label: 'Accept Children', type: 'checkbox', default: false },
    ],
    generate: (config) => {
      const name = config.componentName || 'MyComponent';
      const withProps = config.withProps;
      const withChildren = config.withChildren;
      
      let childrenProp = '';
      
      if (withProps) {
        childrenProp = withChildren ? '{ children, className }' : '{ className }';
      } else {
        childrenProp = '()';
      }
      
      const childContent = withChildren ? '{children}' : '{/* ' + name + ' content */}';
      const classNameValue = withProps ? 'className' : "''";
      
      return [{
        filename: name + '.js',
        content: "import React from 'react';\n" +
          "import { cn } from '@/lib/utils';\n\n" +
          "const " + name + " = " + childrenProp + " => {\n" +
          "  return (\n" +
          "    <div className={cn('', " + classNameValue + ")}>\n" +
          "      " + childContent + "\n" +
          "    </div>\n" +
          "  );\n" +
          "};\n\n" +
          "export default " + name + ";\n"
      }];
    }
  },
  {
    id: 'form-component',
    name: 'Form Component',
    description: 'Form with validation using react-hook-form',
    type: 'component',
    icon: 'FileText',
    color: 'primary',
    options: [
      { name: 'componentName', label: 'Component Name', type: 'text', placeholder: 'ContactForm' },
      { name: 'withZod', label: 'Include Zod Validation', type: 'checkbox', default: true },
    ],
    generate: (config) => {
      const name = config.componentName || 'ContactForm';
      const folderName = name.toLowerCase();
      const withZod = config.withZod;
      const formFields = config.formFields || [];

      // Generate server action file content
      const generateServerAction = () => {
        return "'use server'\n" +
          'import { z } from "zod";\n' +
          'import { createSafeAction } from "@/utils/CreateSafeAction";\n' +
          'import { db } from "@/lib/db";\n\n' +
          "const Upsert" + name + " = z.object({\n" +
          "    payload: z.any().optional(),\n" +
          "});\n\n" +
          "const handler = async (data) => {\n" +
          "    const { payload } = data;\n" +
          "    console.log('@" + name + " server action', payload);\n\n" +
          "    let result;\n\n" +
          "    try {\n" +
          "        result = await db." + folderName + ".upsert({\n" +
          "            where: {\n" +
          "                id: payload.id || '000'\n" +
          "            },\n" +
          "            create: {\n" +
          "                ...payload\n" +
          "            },\n" +
          "            update: {\n" +
          "                ...payload\n" +
          "            },\n" +
          "        });\n" +
          "    } catch (error) {\n" +
          "        console.log(error);\n" +
          "        return {\n" +
          '            message: "Oops!, something went wrong", error\n' +
          "        };\n" +
          "    }\n\n" +
          "    return { data: { " + folderName + ": result } };\n" +
          "};\n\n" +
          "export const upsert" + name + " = createSafeAction(Upsert" + name + ", handler);\n";
      };

      // Generate provider file content
      const generateProvider = () => {
        return "'use client'\n" +
          "import React, { createContext, useContext, useState } from 'react';\n\n" +
          "const " + name + "Context = createContext(undefined);\n\n" +
          "export function " + name + "Provider({ children }) {\n" +
          "  const [state, setState] = useState(null);\n\n" +
          "  const value = {\n" +
          "    state,\n" +
          "    setState,\n" +
          "  };\n\n" +
          "  return (\n" +
          "    <" + name + "Context.Provider value={value}>\n" +
          "      {children}\n" +
          "    </" + name + "Context.Provider>\n" +
          "  );\n" +
          "}\n\n" +
          "export function use" + name + "() {\n" +
          "  const context = useContext(" + name + "Context);\n" +
          "  if (context === undefined) {\n" +
          "    throw new Error('use" + name + " must be used within a " + name + "Provider');\n" +
          "  }\n" +
          "  return context;\n" +
          "}\n";
      };

      // Generate layout file content
      const generateLayout = () => {
        return "import React from 'react';\n" +
          "import { db } from '@/lib/db';\n" +
          "import { " + name + "Provider } from './_provider/" + folderName + "Provider';\n\n" +
          "export const metadata = {\n" +
          "  title: {\n" +
          "    default: '" + name + "',\n" +
          "    template: '%s | ${process.env.APP_NAME}'\n" +
          "  },\n" +
          "  description: '" + name + " module',\n" +
          "};\n\n" +
          "export default async function " + name + "Layout({ children }) {\n" +
          "  return (\n" +
          "    <" + name + "Provider>\n" +
          "      <div>\n" +
          "        {children}\n" +
          "      </div>\n" +
          "    </" + name + "Provider>\n" +
          "  );\n" +
          "}\n";
      };

      // Generate page file content
      const generatePage = () => {
        return "export default function " + name + "Page() {\n" +
          "  return (\n" +
          "    <div>\n" +
          "      {/* " + name + " page content */}\n" +
          "    </div>\n" +
          "  );\n" +
          "}\n";
      };

      const generateZodSchema = () => {
        const schemaFields = formFields.map(field => {
          let schema = '';
          switch (field.type) {
            case 'email':
              schema = "z.string().email('Invalid email address')";
              break;
            case 'number':
              schema = "z.coerce.number()";
              break;
            case 'checkbox':
              schema = "z.boolean()";
              break;
            default:
              schema = "z.string()";
          }
          if (field.required && field.type !== 'checkbox') {
            schema += ".min(1, '" + field.label + " is required')";
          }
          if (!field.required && field.type !== 'checkbox') {
            schema = schema + ".optional()";
          }
          return "  " + field.name + ": " + schema + ",";
        });
        return schemaFields.join('\n');
      };

      const generateDefaultValues = () => {
        return formFields.map(field => {
          const defaultValue = field.type === 'checkbox' ? 'false' : 
                               field.type === 'number' ? '0' : "''";
          return "      " + field.name + ": " + defaultValue + ",";
        }).join('\n');
      };

      const generateFormFields = () => {
        return formFields.map(field => {
          if (field.type === 'checkbox') {
            return '        <FormField\n' +
              '          control={form.control}\n' +
              '          name="' + field.name + '"\n' +
              '          render={({ field }) => (\n' +
              '            <FormItem className="flex flex-row items-start space-x-3 space-y-0">\n' +
              '              <FormControl>\n' +
              '                <Checkbox\n' +
              '                  checked={field.value}\n' +
              '                  onCheckedChange={field.onChange}\n' +
              '                />\n' +
              '              </FormControl>\n' +
              '              <div className="space-y-1 leading-none">\n' +
              '                <FormLabel>' + field.label + '</FormLabel>\n' +
              '              </div>\n' +
              '            </FormItem>\n' +
              '          )}\n' +
              '        />';
          }

          const typeAttr = field.type === 'number' ? 'type="number" ' : 
                          field.type === 'email' ? 'type="email" ' : 
                          field.type === 'password' ? 'type="password" ' : '';
          const inputType = field.type === 'textarea' ? 'Textarea' : 'Input';

          return '        <FormField\n' +
            '          control={form.control}\n' +
            '          name="' + field.name + '"\n' +
            '          render={({ field }) => (\n' +
            '            <FormItem>\n' +
            '              <FormLabel>' + field.label + '</FormLabel>\n' +
            '              <FormControl>\n' +
            '                <' + inputType + ' ' + typeAttr + 'placeholder="' + (field.placeholder || '') + '" {...field} />\n' +
            '              </FormControl>\n' +
            '              <FormMessage />\n' +
            '            </FormItem>\n' +
            '          )}\n' +
            '        />';
        }).join('\n');
      };

      // Generate hook file content
      const generateHook = () => {
        return "import { useState, useCallback } from 'react';\n\n" +
          "export function use" + name + "() {\n" +
          "  const [data, setData] = useState(null);\n" +
          "  const [isLoading, setIsLoading] = useState(false);\n" +
          "  const [error, setError] = useState(null);\n\n" +
          "  const fetch" + name + " = useCallback(async (id) => {\n" +
          "    setIsLoading(true);\n" +
          "    setError(null);\n" +
          "    try {\n" +
          "      // Add your fetch logic here\n" +
          "      const result = await fetch('/api/" + folderName + "/' + id);\n" +
          "      const json = await result.json();\n" +
          "      setData(json);\n" +
          "      return json;\n" +
          "    } catch (err) {\n" +
          "      setError(err);\n" +
          "      throw err;\n" +
          "    } finally {\n" +
          "      setIsLoading(false);\n" +
          "    }\n" +
          "  }, []);\n\n" +
          "  return { data, isLoading, error, fetch" + name + " };\n" +
          "}\n\n" +
          "export default use" + name + ";\n";
      };

      if (withZod) {
        const mainComponent = "import React from 'react';\n" +
          "import { useForm } from 'react-hook-form';\n" +
          "import { zodResolver } from '@hookform/resolvers/zod';\n" +
          "import { z } from 'zod';\n" +
          "import { Button } from '@/components/ui/button';\n" +
          "import { Input } from '@/components/ui/input';\n" +
          "import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';\n" +
          "import { useAction } from '@/hooks/useAction';\n" +
          "import { upsert" + name + " } from '../_actions/upsert" + name + "';\n" +
          "import { toast } from 'sonner';\n\n" +
          "const formSchema = z.object({\n" +
          generateZodSchema() + "\n" +
          "});\n\n" +
          "const " + name + " = ({ onSuccess, onClose }) => {\n" +
          "  const form = useForm({\n" +
          "    resolver: zodResolver(formSchema),\n" +
          "    defaultValues: {\n" +
          generateDefaultValues() + "\n" +
          "    },\n" +
          "  });\n\n" +
          "  const { execute, isLoading } = useAction(upsert" + name + ", {\n" +
          "    onSuccess: (data) => {\n" +
          "      toast.success('Saved successfully');\n" +
          "      onSuccess?.(data);\n" +
          "      onClose?.();\n" +
          "    },\n" +
          "    onError: (error) => {\n" +
          "      toast.error('Oops something went wrong! Try again later');\n" +
          "    }\n" +
          "  });\n\n" +
          "  const handleSubmit = async (values) => {\n" +
          "    await execute({ userId: 'userId', formData: values });\n" +
          "  };\n\n" +
          "  return (\n" +
          "    <Form {...form}>\n" +
          "      <form onSubmit={form.handleSubmit(handleSubmit)} className=\"space-y-4\">\n" +
          generateFormFields() + "\n" +
          "        <Button type=\"submit\" disabled={isLoading}>\n" +
          "          {isLoading ? 'Saving...' : 'Submit'}\n" +
          "        </Button>\n" +
          "      </form>\n" +
          "    </Form>\n" +
          "  );\n" +
          "};\n\n" +
          "export default " + name + ";\n";

        return [
          {
            filename: '_components/' + name + '.js',
            content: mainComponent
          },
          {
            filename: '_actions/upsert' + name + '.js',
            content: generateServerAction()
          },
          {
            filename: '_provider/' + folderName + 'Provider.js',
            content: generateProvider()
          },
          {
            filename: '_hooks/use' + name + '.js',
            content: generateHook()
          },
          {
            filename: 'layout.js',
            content: generateLayout()
          },
          {
            filename: 'page.js',
            content: generatePage()
          }
        ];
      }
      
      const simpleComponent = "import React from 'react';\n" +
        "import { useForm } from 'react-hook-form';\n" +
        "import { Button } from '@/components/ui/button';\n" +
        "import { Input } from '@/components/ui/input';\n" +
        "import { useAction } from '@/hooks/useAction';\n" +
        "import { upsert" + name + " } from '../_actions/upsert" + name + "';\n" +
        "import { toast } from 'sonner';\n\n" +
        "const " + name + " = ({ onSuccess, onClose }) => {\n" +
        "  const { register, handleSubmit, formState: { errors } } = useForm();\n\n" +
        "  const { execute, isLoading } = useAction(upsert" + name + ", {\n" +
        "    onSuccess: (data) => {\n" +
        "      toast.success('Saved successfully');\n" +
        "      onSuccess?.(data);\n" +
        "      onClose?.();\n" +
        "    },\n" +
        "    onError: (error) => {\n" +
        "      toast.error('Oops something went wrong! Try again later');\n" +
        "    }\n" +
        "  });\n\n" +
        "  const onFormSubmit = async (values) => {\n" +
        "    await execute({ userId: 'userId', formData: values });\n" +
        "  };\n\n" +
        "  return (\n" +
        "    <form onSubmit={handleSubmit(onFormSubmit)} className=\"space-y-4\">\n" +
        "      <Button type=\"submit\" disabled={isLoading}>\n" +
        "        {isLoading ? 'Saving...' : 'Submit'}\n" +
        "      </Button>\n" +
        "    </form>\n" +
        "  );\n" +
        "};\n\n" +
        "export default " + name + ";\n";

      return [
        {
          filename: '_components/' + name + '.js',
          content: simpleComponent
        },
        {
          filename: '_actions/upsert' + name + '.js',
          content: generateServerAction()
        },
        {
          filename: '_provider/' + folderName + 'Provider.js',
          content: generateProvider()
        },
        {
          filename: '_hooks/use' + name + '.js',
          content: generateHook()
        },
        {
          filename: 'layout.js',
          content: generateLayout()
        },
        {
          filename: 'page.js',
          content: generatePage()
        }
      ];
    }
  },
];

// Hook Templates
const hookTemplates = [
  {
    id: 'data-fetching-hook',
    name: 'Data Fetching Hook',
    description: 'Custom hook for fetching data with loading/error states',
    type: 'hook',
    icon: 'Download',
    color: 'secondary',
    options: [
      { name: 'hookName', label: 'Hook Name', type: 'text', placeholder: 'useFetchData' },
      { name: 'withCache', label: 'Include Caching', type: 'checkbox', default: false },
    ],
    generate: (config) => {
      const name = config.hookName || 'useFetchData';
      
      return [{
        filename: name + '.js',
        content: "import { useState, useEffect, useCallback } from 'react';\n\n" +
          "export function " + name + "(url) {\n" +
          "  const [data, setData] = useState(null);\n" +
          "  const [isLoading, setIsLoading] = useState(true);\n" +
          "  const [error, setError] = useState(null);\n\n" +
          "  const fetchData = useCallback(async () => {\n" +
          "    setIsLoading(true);\n" +
          "    setError(null);\n" +
          "    \n" +
          "    try {\n" +
          "      const response = await fetch(url);\n" +
          "      if (!response.ok) {\n" +
          "        throw new Error('HTTP error! status: ' + response.status);\n" +
          "      }\n" +
          "      const result = await response.json();\n" +
          "      setData(result);\n" +
          "    } catch (err) {\n" +
          "      setError(err instanceof Error ? err : new Error('An error occurred'));\n" +
          "    } finally {\n" +
          "      setIsLoading(false);\n" +
          "    }\n" +
          "  }, [url]);\n\n" +
          "  useEffect(() => {\n" +
          "    fetchData();\n" +
          "  }, [fetchData]);\n\n" +
          "  return { data, isLoading, error, refetch: fetchData };\n" +
          "}\n\n" +
          "export default " + name + ";\n"
      }];
    }
  },
];

// Utility Templates
const utilityTemplates = [
  {
    id: 'format-utils',
    name: 'Format Utilities',
    description: 'Common formatting functions (date, currency, etc.)',
    type: 'utility',
    icon: 'Wand2',
    color: 'accent',
    options: [
      { name: 'fileName', label: 'File Name', type: 'text', placeholder: 'formatters' },
    ],
    generate: (config) => {
      const name = config.fileName || 'formatters';
      return [{
        filename: name + '.js',
        content: "export function formatDate(date, options) {\n" +
          "  const d = typeof date === 'string' ? new Date(date) : date;\n" +
          "  return d.toLocaleDateString('en-US', {\n" +
          "    year: 'numeric',\n" +
          "    month: 'long',\n" +
          "    day: 'numeric',\n" +
          "    ...options,\n" +
          "  });\n" +
          "}\n\n" +
          "export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {\n" +
          "  return new Intl.NumberFormat(locale, {\n" +
          "    style: 'currency',\n" +
          "    currency,\n" +
          "  }).format(amount);\n" +
          "}\n\n" +
          "export function capitalize(str) {\n" +
          "  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();\n" +
          "}\n"
      }];
    }
  },
];

// API Templates
const apiTemplates = [
  {
    id: 'crud-api',
    name: 'CRUD API Client',
    description: 'Type-safe API client for CRUD operations',
    type: 'api',
    icon: 'Server',
    color: 'success',
    options: [
      { name: 'fileName', label: 'File Name', type: 'text', placeholder: 'api-client' },
      { name: 'resourceName', label: 'Resource Name', type: 'text', placeholder: 'users' },
    ],
    generate: (config) => {
      const fileName = config.fileName || 'api-client';
      const resource = config.resourceName || 'items';
      
      return [{
        filename: fileName + '.js',
        content: "const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';\n\n" +
          "export async function getAll(page = 1, limit = 10) {\n" +
          "  const response = await fetch(API_BASE_URL + '/" + resource + "?page=' + page + '&limit=' + limit);\n" +
          "  if (!response.ok) throw new Error('Failed to fetch');\n" +
          "  return response.json();\n" +
          "}\n\n" +
          "export async function getById(id) {\n" +
          "  const response = await fetch(API_BASE_URL + '/" + resource + "/' + id);\n" +
          "  if (!response.ok) throw new Error('Failed to fetch');\n" +
          "  return response.json();\n" +
          "}\n\n" +
          "export async function create(data) {\n" +
          "  const response = await fetch(API_BASE_URL + '/" + resource + "', {\n" +
          "    method: 'POST',\n" +
          "    headers: { 'Content-Type': 'application/json' },\n" +
          "    body: JSON.stringify(data),\n" +
          "  });\n" +
          "  if (!response.ok) throw new Error('Failed to create');\n" +
          "  return response.json();\n" +
          "}\n\n" +
          "export async function update(id, data) {\n" +
          "  const response = await fetch(API_BASE_URL + '/" + resource + "/' + id, {\n" +
          "    method: 'PATCH',\n" +
          "    headers: { 'Content-Type': 'application/json' },\n" +
          "    body: JSON.stringify(data),\n" +
          "  });\n" +
          "  if (!response.ok) throw new Error('Failed to update');\n" +
          "  return response.json();\n" +
          "}\n\n" +
          "export async function remove(id) {\n" +
          "  const response = await fetch(API_BASE_URL + '/" + resource + "/' + id, {\n" +
          "    method: 'DELETE',\n" +
          "  });\n" +
          "  if (!response.ok) throw new Error('Failed to delete');\n" +
          "}\n"
      }];
    }
  },
];

export const templates = [
  ...componentTemplates,
  ...hookTemplates,
  ...utilityTemplates,
  ...apiTemplates,
];

export const getTemplatesByType = (type) => {
  return templates.filter(t => t.type === type);
};

export const getTemplateById = (id) => {
  return templates.find(t => t.id === id);
};

export const moduleTypes = [
  { type: 'component', label: 'React Components', icon: 'Box', color: 'primary', description: 'Functional components, forms, modals' },
  { type: 'hook', label: 'Custom Hooks', icon: 'Anchor', color: 'secondary', description: 'Data fetching, state management' },
  { type: 'utility', label: 'Utilities', icon: 'Wand2', color: 'accent', description: 'Formatters, validators, helpers' },
  { type: 'api', label: 'API Code', icon: 'Server', color: 'success', description: 'CRUD clients, query hooks' },
];
