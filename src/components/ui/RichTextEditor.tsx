import React, { useEffect } from 'react';
import { useEditor, EditorContent, Editor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  Heading1,
  Heading2,
  Underline as UnderlineIcon,
  Code,
  Quote,
  Undo,
  Redo,
  HighlighterIcon,
  Palette
} from 'lucide-react';
import Button from './Button';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  minHeight = '300px'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image,
      Link.configure({
        openOnClick: false,
        validate: href => /^https?:\/\//.test(href),
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TableRow,
      TableHeader,
      TableCell,
      Table.configure({
        resizable: true,
      }),
      Highlight,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = () => {
    const url = prompt('Enter the URL of the image:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = prompt('URL', previousUrl);

    // cancelled
    if (url === null) return;

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  };

  if (!editor) {
    return null;
  }

  const menuItems = [
    {
      icon: <Bold size={18} />,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: <Italic size={18} />,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      icon: <UnderlineIcon size={18} />,
      title: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      icon: <Heading1 size={18} />,
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
    },
    {
      icon: <Heading2 size={18} />,
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <List size={18} />,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered size={18} />,
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    {
      icon: <Code size={18} />,
      title: 'Code Block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
    },
    {
      icon: <Quote size={18} />,
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
    },
    {
      icon: <AlignLeft size={18} />,
      title: 'Align Left',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
    },
    {
      icon: <AlignCenter size={18} />,
      title: 'Align Center',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
    },
    {
      icon: <AlignRight size={18} />,
      title: 'Align Right',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
    },
    {
      icon: <HighlighterIcon size={18} />,
      title: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight'),
    },
    {
      icon: <LinkIcon size={18} />,
      title: 'Link',
      action: setLink,
      isActive: editor.isActive('link'),
    },
    {
      icon: <ImageIcon size={18} />,
      title: 'Image',
      action: addImage,
    },
    {
      icon: <TableIcon size={18} />,
      title: 'Table',
      action: addTable,
    },
    {
      icon: <Undo size={18} />,
      title: 'Undo',
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: <Redo size={18} />,
      title: 'Redo',
      action: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="flex flex-wrap gap-1 p-2 mb-1 border border-slate-300 dark:border-slate-700 rounded-t-md bg-slate-50 dark:bg-slate-800">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
              item.isActive ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
            }`}
            title={item.title}
            type="button"
          >
            {item.icon}
          </button>
        ))}
      </div>

      <div 
        className={`border border-slate-300 dark:border-slate-700 rounded-b-md bg-white dark:bg-slate-900 overflow-auto`}
        style={{ minHeight }}
      >
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 p-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded ${
                  editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Bold size={14} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded ${
                  editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Italic size={14} />
              </button>
              <button
                onClick={setLink}
                className={`p-1.5 rounded ${
                  editor.isActive('link') ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <LinkIcon size={14} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={`p-1.5 rounded ${
                  editor.isActive('highlight') ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <HighlighterIcon size={14} />
              </button>
            </div>
          </BubbleMenu>
        )}
        <EditorContent editor={editor} className="p-4" />
      </div>

      <style jsx>{`
        .ProseMirror {
          outline: none;
          min-height: ${minHeight};
        }
        
        .ProseMirror p {
          margin-bottom: 1em;
        }
        
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1em 0;
        }
        
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1em 0;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        
        .ProseMirror ul li {
          list-style-type: disc;
        }
        
        .ProseMirror ol li {
          list-style-type: decimal;
        }
        
        .ProseMirror blockquote {
          padding-left: 1em;
          border-left: 3px solid #e2e8f0;
          color: #64748b;
          margin: 1em 0;
        }
        
        .ProseMirror pre {
          background: #f1f5f9;
          border-radius: 0.25rem;
          padding: 0.75em;
          font-family: monospace;
          margin: 1em 0;
        }
        
        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .ProseMirror img {
          max-width: 100%;
          height: auto;
        }
        
        .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          overflow: hidden;
          width: 100%;
        }
        
        .ProseMirror table td,
        .ProseMirror table th {
          border: 2px solid #e2e8f0;
          padding: 0.5em;
        }
        
        .dark .ProseMirror blockquote {
          border-left: 3px solid #475569;
          color: #94a3b8;
        }
        
        .dark .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
        }
        
        .dark .ProseMirror a {
          color: #60a5fa;
        }
        
        .dark .ProseMirror table td,
        .dark .ProseMirror table th {
          border: 2px solid #334155;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;