'use client';

import React, { useState, useEffect } from 'react';
import { useField } from '@payloadcms/ui';

// Dynamic import for CKEditor (browser-only)
let CKEditor: any = null;
let ClassicEditor: any = null;

interface Props {
  path: string;
  label?: string;
  required?: boolean;
}

const CKEditorField: React.FC<Props> = ({ path, label, required }) => {
  const { value, setValue } = useField<string>({ path });
  const [activeTab, setActiveTab] = useState<'visual' | 'html'>('visual');
  const [editorLoaded, setEditorLoaded] = useState(false);

  // Load CKEditor dynamically (browser-only)
  useEffect(() => {
    Promise.all([
      import('@ckeditor/ckeditor5-react'),
      import('@ckeditor/ckeditor5-build-classic'),
    ]).then(([ckeditorReact, classicEditor]) => {
      CKEditor = ckeditorReact.CKEditor;
      ClassicEditor = classicEditor.default;
      setEditorLoaded(true);
    });
  }, []);

  const handleEditorChange = (_event: any, editor: any) => {
    const data = editor.getData();
    setValue(data);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '0.625rem 1.25rem',
    border: 'none',
    borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    color: isActive ? '#fff' : '#a1a1aa',
    cursor: 'pointer',
    fontWeight: isActive ? 600 : 400,
    fontSize: '0.875rem',
    transition: 'all 0.15s ease',
    borderRadius: '4px 4px 0 0',
  });

  return (
    <div className="field-type" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#e4e4e7' }}>
        {label || 'Контент'}
        {required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #3f3f46', marginBottom: '0' }}>
        <button type="button" onClick={() => setActiveTab('visual')} style={tabStyle(activeTab === 'visual')}>
          Візуальний редактор
        </button>
        <button type="button" onClick={() => setActiveTab('html')} style={tabStyle(activeTab === 'html')}>
          HTML код
        </button>
      </div>

      {/* Visual Editor */}
      {activeTab === 'visual' && (
        <div className="ckeditor-wrapper">
          {editorLoaded && CKEditor ? (
            <CKEditor
              editor={ClassicEditor}
              data={value || ''}
              onChange={handleEditorChange}
              config={{
                licenseKey: 'GPL',
                toolbar: [
                  'heading',
                  '|',
                  'bold',
                  'italic',
                  '|',
                  'link',
                  'imageUpload',
                  'mediaEmbed',
                  '|',
                  'bulletedList',
                  'numberedList',
                  '|',
                  'outdent',
                  'indent',
                  '|',
                  'blockQuote',
                  'insertTable',
                  'horizontalLine',
                  '|',
                  'undo',
                  'redo',
                ],
                heading: {
                  options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                    { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                    { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                  ],
                },
                image: {
                  toolbar: ['imageTextAlternative', '|', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side'],
                },
                table: {
                  contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
                },
                language: 'uk',
              }}
            />
          ) : (
            <div style={{
              padding: '1rem',
              border: '1px solid #3f3f46',
              borderRadius: '0 0 4px 4px',
              color: '#a1a1aa',
              backgroundColor: '#27272a',
            }}>
              Завантаження редактора...
            </div>
          )}
          <style>{`
            .ckeditor-wrapper .ck.ck-editor {
              --ck-color-base-background: #27272a;
              --ck-color-base-foreground: #3f3f46;
              --ck-color-base-border: #3f3f46;
              --ck-color-base-text: #e4e4e7;
              --ck-color-toolbar-background: #27272a;
              --ck-color-toolbar-border: #3f3f46;
              --ck-color-button-default-background: transparent;
              --ck-color-button-default-hover-background: #3f3f46;
              --ck-color-button-on-background: #3b82f6;
              --ck-color-dropdown-panel-background: #27272a;
              --ck-color-dropdown-panel-border: #3f3f46;
              --ck-color-input-background: #18181b;
              --ck-color-input-border: #3f3f46;
              --ck-color-input-text: #e4e4e7;
              --ck-color-list-background: #27272a;
              --ck-color-list-button-hover-background: #3f3f46;
              --ck-color-panel-background: #27272a;
              --ck-color-panel-border: #3f3f46;
            }
            .ckeditor-wrapper .ck-editor__editable {
              min-height: 300px;
              background-color: #18181b !important;
              color: #e4e4e7 !important;
              border-color: #3f3f46 !important;
              border-radius: 0 0 4px 4px;
            }
            .ckeditor-wrapper .ck-editor__editable:focus {
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            }
            .ckeditor-wrapper .ck-content p,
            .ckeditor-wrapper .ck-content h2,
            .ckeditor-wrapper .ck-content h3,
            .ckeditor-wrapper .ck-content h4,
            .ckeditor-wrapper .ck-content li,
            .ckeditor-wrapper .ck-content a {
              color: #e4e4e7 !important;
            }
            .ckeditor-wrapper .ck-content a {
              color: #60a5fa !important;
            }
            .ckeditor-wrapper .ck.ck-toolbar {
              border-radius: 4px 4px 0 0 !important;
              border-bottom: 1px solid #3f3f46 !important;
            }
            .ckeditor-wrapper .ck.ck-icon {
              color: #a1a1aa;
            }
            .ckeditor-wrapper .ck.ck-button:hover .ck.ck-icon {
              color: #e4e4e7;
            }
          `}</style>
        </div>
      )}

      {/* HTML Editor */}
      {activeTab === 'html' && (
        <textarea
          value={value || ''}
          onChange={handleHtmlChange}
          style={{
            width: '100%',
            minHeight: '300px',
            padding: '0.75rem',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            border: '1px solid #3f3f46',
            borderRadius: '0 0 4px 4px',
            resize: 'vertical',
            backgroundColor: '#18181b',
            color: '#e4e4e7',
          }}
          placeholder="<p>Введіть HTML код...</p>"
        />
      )}

      <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.5rem' }}>
        {activeTab === 'visual'
          ? 'Використовуйте панель інструментів для форматування тексту.'
          : 'Редагуйте HTML напряму. Зміни відображаються миттєво в обох режимах.'}
      </p>
    </div>
  );
};

export default CKEditorField;
