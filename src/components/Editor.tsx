'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { marked } from 'marked';

interface EditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export default function Editor({ initialContent = '', onChange }: EditorProps) {
  // マークダウンをHTMLに変換
  const initialHtml = marked.parse(initialContent, {
    gfm: true,
    breaks: true,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = convertHtmlToMarkdown(html);
      onChange?.(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none',
      },
    },
    onCreate: ({ editor }) => {
      // エディターが作成されたときにコンテンツを設定
      if (initialContent) {
        editor.commands.setContent(initialHtml);
      }
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      // 画像の挿入方法を修正
      editor.commands.setImage({ 
        src: data.url,
        alt: file.name 
      });
    } catch (error) {
      console.error('Image upload error:', error);
      alert('画像のアップロードに失敗しました');
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
      <div className="mb-4 border rounded-lg p-2 flex items-center space-x-2">
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
        >
          H3
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 4 }) ? 'bg-gray-200' : ''}`}
        >
          H4
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          太字
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          箇条書き
        </button>
        <label className="cursor-pointer px-2 py-1 rounded hover:bg-gray-100">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <PhotoIcon className="h-5 w-5 text-gray-600" />
        </label>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

// HTMLをマークダウンに変換する関数
function convertHtmlToMarkdown(html: string): string {
  let markdown = html;

  // 基本的なHTML変換
  markdown = markdown
    .replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/g, '\n#### $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/g, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
    // 手動で追加された太字のみを保持
    .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, '> $1\n')
    .replace(/<br\s*\/?>/g, '\n');

  // 余分な改行を整理
  markdown = markdown
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  return markdown;
} 