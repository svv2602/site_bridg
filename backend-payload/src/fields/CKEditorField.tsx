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
    padding: '0.5rem 1rem',
    border: 'none',
    borderBottom: isActive ? '2px solid #0070f3' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: isActive ? '#000' : '#666',
    cursor: 'pointer',
    fontWeight: isActive ? 600 : 400,
    fontSize: '0.875rem',
  });

  return (
    <div className="field-type" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
        {label || 'Контент'}
        {required && <span style={{ color: 'red' }}> *</span>}
      </label>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '0.5rem' }}>
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
                  'underline',
                  'strikethrough',
                  '|',
                  'link',
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
                language: 'uk',
              }}
            />
          ) : (
            <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '4px', color: '#666' }}>
              Завантаження редактора...
            </div>
          )}
          <style>{`
            .ckeditor-wrapper .ck-editor__editable {
              min-height: 300px;
            }
            .ckeditor-wrapper .ck-editor__editable:focus {
              border-color: #0070f3;
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
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            resize: 'vertical',
          }}
          placeholder="<p>Введіть HTML код...</p>"
        />
      )}

      <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
        {activeTab === 'visual'
          ? 'Використовуйте панель інструментів для форматування тексту.'
          : 'Редагуйте HTML напряму. Зміни відображаються миттєво в обох режимах.'}
      </p>
    </div>
  );
};

export default CKEditorField;
