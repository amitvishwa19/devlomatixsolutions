import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import ModuleCard from '../components/ModuleCard';
import TemplateSelector from '../components/TemplateSelector';
import TemplateForm from '../components/TemplateForm';
import CodePreview from '../components/CodePreview';
import FormPreview from '../components/FormPreview';
import { moduleTypes, getTemplatesByType } from '../lib/templates';

const Templates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const [selectedType, setSelectedType] = useState(typeParam);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [formConfig, setFormConfig] = useState({});

  const templates = selectedType ? getTemplatesByType(selectedType) : [];

  useEffect(() => {
    if (typeParam) {
      setSelectedType(typeParam);
    }
  }, [typeParam]);

  useEffect(() => {
    // Auto-select first template when type changes
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates, selectedTemplate]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedTemplate(null);
    setGeneratedFiles([]);
    setSearchParams({ type });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setGeneratedFiles([]);
    setFormConfig({});
  };

  const handleGenerate = useCallback((files, config) => {
    setGeneratedFiles(files);
    if (config) {
      setFormConfig(config);
    }
  }, []);

  // Generate preview component for form templates
  const previewComponent = useMemo(() => {
    if (generatedFiles.length === 0) return undefined;
    
    if (selectedTemplate?.id === 'form-component') {
      const componentName = formConfig.componentName || 'ContactForm';
      const withZod = formConfig.withZod;
      const fields = formConfig.formFields;
      return <FormPreview componentName={componentName} withZod={withZod} fields={fields} />;
    }
    
    return undefined;
  }, [generatedFiles, selectedTemplate, formConfig]);

  // Get module name for download
  const moduleName = useMemo(() => {
    return formConfig.componentName || selectedTemplate?.name || 'module';
  }, [formConfig.componentName, selectedTemplate]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Template Generator</h1>
          <p className="text-muted-foreground">
            Select a module type, choose a template, customize options, and generate code.
          </p>
        </motion.div>

        {/* Module Type Selection */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">1. Choose Module Type</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleTypes.map((module) => (
              <ModuleCard
                key={module.type}
                icon={module.icon}
                label={module.label}
                description={module.description}
                color={module.color}
                onClick={() => handleTypeSelect(module.type)}
                isActive={selectedType === module.type}
              />
            ))}
          </div>
        </motion.section>

        {/* Template Selection and Configuration */}
        {selectedType && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Template List */}
            <div className="min-w-0 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4">2. Select Template</h2>
              <TemplateSelector
                templates={templates}
                selectedId={selectedTemplate?.id}
                onSelect={handleTemplateSelect}
              />
            </div>

            {/* Template Form */}
            <div className="min-w-0 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4">3. Configure</h2>
              {selectedTemplate ? (
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <TemplateForm
                    template={selectedTemplate}
                    onGenerate={handleGenerate}
                  />
                </div>
              ) : (
                <div className="p-6 rounded-2xl border-2 border-dashed border-border text-center text-muted-foreground">
                  Select a template to configure
                </div>
              )}
            </div>

            {/* Code Preview */}
            <div className="min-w-0 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4">4. Generated Code</h2>
              <CodePreview files={generatedFiles} preview={previewComponent} moduleName={moduleName} />
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
};

export default Templates;
