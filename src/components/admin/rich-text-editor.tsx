"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  TextB,
  TextItalic,
  ListBullets,
  ListNumbers,
  TextHOne,
  TextHTwo,
  Quotes,
  LinkSimple,
  ArrowUUpLeft,
  ArrowUUpRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * Editor rich text simple (Tiptap). Serializa HTML a un input hidden
 * para enviarlo con el resto del formulario.
 */
export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = "Escribe el contenido…",
  onChange,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
}) {
  const [html, setHtmlState] = useState(defaultValue);
  const setHtml = (h: string) => {
    setHtmlState(h);
    onChange?.(h);
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap prose-pm max-w-none px-4 py-3 text-[15px] text-mist-900",
        "data-placeholder": placeholder,
      },
    },
  });

  const btn = (active: boolean) =>
    cn(
      "pressable flex size-9 items-center justify-center rounded-lg transition-colors",
      active ? "bg-palm-700 text-white" : "text-mist-600 hover:bg-mist-100 hover:text-palm-950",
    );

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="rounded-xl border border-mist-300 bg-white focus-within:border-palm-600 focus-within:ring-2 focus-within:ring-palm-600/20">
      <input type="hidden" name={name} value={html} />
      {editor ? (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-mist-200 px-2 py-1.5">
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} aria-label="Título">
            <TextHOne size={17} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} aria-label="Subtítulo">
            <TextHTwo size={17} />
          </button>
          <span className="mx-1 h-5 w-px bg-mist-200" />
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} aria-label="Negrita">
            <TextB size={17} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} aria-label="Cursiva">
            <TextItalic size={17} />
          </button>
          <button type="button" onClick={setLink} className={btn(editor.isActive("link"))} aria-label="Enlace">
            <LinkSimple size={17} />
          </button>
          <span className="mx-1 h-5 w-px bg-mist-200" />
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} aria-label="Lista">
            <ListBullets size={17} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} aria-label="Lista numerada">
            <ListNumbers size={17} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} aria-label="Cita">
            <Quotes size={17} />
          </button>
          <span className="mx-1 h-5 w-px bg-mist-200" />
          <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)} aria-label="Deshacer">
            <ArrowUUpLeft size={17} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)} aria-label="Rehacer">
            <ArrowUUpRight size={17} />
          </button>
        </div>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
