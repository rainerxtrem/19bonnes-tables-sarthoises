"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils/cn";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";

const ButtonLink = TiptapLink.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => (attributes.class ? { class: attributes.class } : {}),
      },
    };
  },
});

function ToolbarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100",
        active && "bg-brand-cream text-brand-dark"
      )}
    >
      {label}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function insertLink() {
    const url = window.prompt("URL du lien :");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertButton() {
    const url = window.prompt("URL du bouton :");
    if (!url) return;
    const label = window.prompt("Texte du bouton :", "En savoir plus");
    if (!label) return;
    editor
      .chain()
      .focus()
      .insertContent(
        `<a href="${url}" class="btn-cta">${escapeHtml(label)}</a>&nbsp;`
      )
      .run();
  }

  function handleMediaSelected(media: PickedMedia[]) {
    for (const item of media) {
      editor.chain().focus().setImage({ src: item.url, alt: item.alt ?? item.filename }).run();
    }
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
      <ToolbarButton label="H1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <ToolbarButton label="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton label="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <ToolbarButton label="Gras" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton label="Italique" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarButton label="Liste à puces" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton label="Liste numérotée" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton label="Citation" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <ToolbarButton label="Séparateur" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <ToolbarButton label="Lien" active={editor.isActive("link")} onClick={insertLink} />
      <ToolbarButton label="Bouton" onClick={insertButton} />
      <ToolbarButton label="Image" onClick={() => setPickerOpen(true)} />
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleMediaSelected} multiple />
    </div>
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] ?? char;
  });
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapImage,
      ButtonLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Rédigez le contenu ici..." }),
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[240px] px-3 py-2 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-md border border-gray-300 bg-white shadow-sm">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
