"use client"

import { useState } from "react";
import { createTour } from "@/utils/api";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

export default function TourForm({ onCreated }: { onCreated?: () => void }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    days: 1,
    price: 0,
    type: "single", // 'single' or 'multi'
  });
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, description: editor.getHTML() }));
    },
    immediatelyRender: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "type") {
      setForm((prev) => ({
        ...prev,
        type: value,
        days: value === "single" ? 1 : prev.days
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "days" || name === "price" ? Number(value) : value
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createTour(form);
      setForm({ 
        title: "", 
        description: "", 
        location: "", 
        days: 1, 
        price: 0, 
        type: "single"
      });
      if (editor) editor.commands.setContent("");
      if (onCreated) onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating tour");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mb-8 p-6 border rounded-lg bg-white shadow-sm" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Tour</h2>
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 border border-red-200 rounded">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title:</label>
          <input 
            name="title" 
            type="text" 
            value={form.title} 
            onChange={handleChange} 
            required 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location:</label>
          <input 
            name="location" 
            type="text" 
            value={form.location} 
            onChange={handleChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
        {editor && (
          <div className="mb-3 flex flex-wrap gap-1 p-2 bg-gray-50 rounded-lg border">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'font-bold bg-blue-500 text-white px-3 py-1 rounded text-sm' : 'px-3 py-1 hover:bg-gray-200 rounded text-sm'}><b>B</b></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'italic bg-blue-500 text-white px-3 py-1 rounded text-sm' : 'px-3 py-1 hover:bg-gray-200 rounded text-sm'}><i>I</i></button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'line-through bg-blue-500 text-white px-3 py-1 rounded text-sm' : 'px-3 py-1 hover:bg-gray-200 rounded text-sm'}><s>S</s></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-blue-500 text-white px-3 py-1 rounded text-sm' : 'px-3 py-1 hover:bg-gray-200 rounded text-sm'}>• List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-blue-500 text-white px-3 py-1 rounded text-sm' : 'px-3 py-1 hover:bg-gray-200 rounded text-sm'}>1. List</button>
          </div>
        )}
        <div className="border border-gray-300 rounded-lg bg-white min-h-[150px] p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <EditorContent editor={editor} />
        </div>
        <style>{`
          .tiptap {
            min-height: 120px;
            outline: none;
            padding: 12px;
            font-size: 1rem;
            line-height: 1.5;
          }
          .tiptap p { margin-bottom: 0.5rem; }
          .tiptap ul, .tiptap ol { margin-left: 1rem; margin-bottom: 0.5rem; }
        `}</style>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tour Type:</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="single"
                checked={form.type === "single"}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Single Day</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="multi"
                checked={form.type === "multi"}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Multi Day</span>
            </label>
          </div>
        </div>
        
        {form.type === "multi" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Days:</label>
            <input 
              name="days" 
              type="number" 
              min={1} 
              value={form.days} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($):</label>
        <input 
          name="price" 
          type="number" 
          min={0} 
          step="0.01"
          value={form.price} 
          onChange={handleChange} 
          required 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button 
        type="submit" 
        className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
        disabled={loading}
      >
        {loading ? "Creating Tour..." : "Create Tour"}
      </button>
    </form>
  );
}
