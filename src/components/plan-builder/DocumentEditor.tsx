import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Bold, Italic, List, ListOrdered, Type, Save, FileDown } from 'lucide-react'
import clsx from 'clsx'

interface DocumentEditorProps {
  initialContent: string
  onSave: (content: string) => void
  onExportPDF: () => void
}

export function DocumentEditor({ initialContent, onSave, onExportPDF }: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Heading,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[500px] p-4'
      }
    }
  })

  const MenuButton = ({ 
    onClick, 
    active = false,
    disabled = false,
    children 
  }: { 
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'p-2 rounded-lg transition-colors',
        active ? 'bg-indigo-100 text-indigo-900' : 'hover:bg-gray-100',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-2 flex items-center space-x-2 bg-gray-50">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <Bold className="w-5 h-5" />
        </MenuButton>
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <Italic className="w-5 h-5" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          <List className="w-5 h-5" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          <ListOrdered className="w-5 h-5" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          <Type className="w-5 h-5" />
        </MenuButton>

        <div className="flex-1" />

        <button
          onClick={() => onSave(editor.getHTML())}
          className="btn-secondary"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Draft
        </button>

        <button
          onClick={onExportPDF}
          className="btn-primary"
        >
          <FileDown className="w-5 h-5 mr-2" />
          Export PDF
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}