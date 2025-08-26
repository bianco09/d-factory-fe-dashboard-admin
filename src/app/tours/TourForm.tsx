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
    category: "adventure", // new category field
    included: [] as string[], // included items
    excluded: [] as string[], // excluded items
    tourPlans: [] as Array<{
      day: number;
      title: string;
      description: string;
      included: string[];
    }>, // tour plans for multi-day tours
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
  const [newIncluded, setNewIncluded] = useState("");
  const [newExcluded, setNewExcluded] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "type") {
      setForm((prev) => {
        const newType = value;
        const newDays = newType === "single" ? 1 : Math.max(prev.days, 2);
        
        // Generate tour plans for multi-day tours
        let newTourPlans = prev.tourPlans;
        if (newType === "multi") {
          // Create empty plans for each day if none exist
          newTourPlans = Array.from({ length: newDays }, (_, i) => {
            const existingPlan = prev.tourPlans.find(p => p.day === i + 1);
            return existingPlan || {
              day: i + 1,
              title: `Day ${i + 1}`,
              description: "",
              included: []
            };
          });
        } else {
          // Clear tour plans for single day tours
          newTourPlans = [];
        }

        return {
          ...prev,
          type: newType,
          days: newDays,
          tourPlans: newTourPlans
        };
      });
    } else if (name === "days") {
      const newDays = Number(value);
      setForm((prev) => {
        // Update tour plans when days change for multi-day tours
        let newTourPlans = prev.tourPlans;
        if (prev.type === "multi") {
          if (newDays > prev.tourPlans.length) {
            // Add new days
            for (let i = prev.tourPlans.length; i < newDays; i++) {
              newTourPlans.push({
                day: i + 1,
                title: `Day ${i + 1}`,
                description: "",
                included: []
              });
            }
          } else if (newDays < prev.tourPlans.length) {
            // Remove excess days
            newTourPlans = prev.tourPlans.slice(0, newDays);
          }
        }
        
        return {
          ...prev,
          days: newDays,
          tourPlans: newTourPlans
        };
      });
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "price" ? Number(value) : value
      }));
    }
  }

  function addIncluded() {
    if (newIncluded.trim()) {
      setForm(prev => ({
        ...prev,
        included: [...prev.included, newIncluded.trim()]
      }));
      setNewIncluded("");
    }
  }

  function removeIncluded(index: number) {
    setForm(prev => ({
      ...prev,
      included: prev.included.filter((_, i) => i !== index)
    }));
  }

  function addExcluded() {
    if (newExcluded.trim()) {
      setForm(prev => ({
        ...prev,
        excluded: [...prev.excluded, newExcluded.trim()]
      }));
      setNewExcluded("");
    }
  }

  function removeExcluded(index: number) {
    setForm(prev => ({
      ...prev,
      excluded: prev.excluded.filter((_, i) => i !== index)
    }));
  }

  function updateTourPlan(dayIndex: number, field: 'title' | 'description', value: string) {
    setForm(prev => ({
      ...prev,
      tourPlans: prev.tourPlans.map((plan, index) => 
        index === dayIndex ? { ...plan, [field]: value } : plan
      )
    }));
  }

  function addTourPlanIncluded(dayIndex: number, item: string) {
    if (item.trim()) {
      setForm(prev => ({
        ...prev,
        tourPlans: prev.tourPlans.map((plan, index) => 
          index === dayIndex 
            ? { ...plan, included: [...plan.included, item.trim()] }
            : plan
        )
      }));
    }
  }

  function removeTourPlanIncluded(dayIndex: number, itemIndex: number) {
    setForm(prev => ({
      ...prev,
      tourPlans: prev.tourPlans.map((plan, index) => 
        index === dayIndex 
          ? { ...plan, included: plan.included.filter((_, i) => i !== itemIndex) }
          : plan
      )
    }));
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
        type: "single",
        category: "adventure",
        included: [],
        excluded: [],
        tourPlans: []
      });
      if (editor) editor.commands.setContent("");
      setNewIncluded("");
      setNewExcluded("");
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category:</label>
          <select 
            name="category" 
            value={form.category} 
            onChange={handleChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
            <option value="nature">Nature</option>
            <option value="food">Food & Culinary</option>
            <option value="historical">Historical</option>
            <option value="relaxation">Relaxation</option>
            <option value="wildlife">Wildlife</option>
            <option value="city">City Tours</option>
            <option value="beach">Beach</option>
            <option value="mountain">Mountain</option>
          </select>
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

      {/* Includes Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">What&apos;s Included:</label>
        <div className="flex gap-2 mb-3">
          <input 
            type="text" 
            value={newIncluded} 
            onChange={(e) => setNewIncluded(e.target.value)}
            placeholder="e.g., Professional guide, Lunch, Transportation"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
          />
          <button 
            type="button" 
            onClick={addIncluded}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Add
          </button>
        </div>
        {form.included.length > 0 && (
          <div className="space-y-2">
            {form.included.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="flex-1 text-sm text-green-800">✓ {item}</span>
                <button 
                  type="button" 
                  onClick={() => removeIncluded(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Excludes Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">What&apos;s Not Included:</label>
        <div className="flex gap-2 mb-3">
          <input 
            type="text" 
            value={newExcluded} 
            onChange={(e) => setNewExcluded(e.target.value)}
            placeholder="e.g., Personal expenses, Tips, Travel insurance"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExcluded())}
          />
          <button 
            type="button" 
            onClick={addExcluded}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Add
          </button>
        </div>
        {form.excluded.length > 0 && (
          <div className="space-y-2">
            {form.excluded.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <span className="flex-1 text-sm text-red-800">✗ {item}</span>
                <button 
                  type="button" 
                  onClick={() => removeExcluded(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tour Plans Section - Only for multi-day tours */}
      {form.type === "multi" && form.tourPlans.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Itinerary</h3>
          <div className="space-y-6">
            {form.tourPlans.map((plan, dayIndex) => (
              <div key={plan.day} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-md font-medium text-gray-700 mb-3">Day {plan.day}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Day Title:</label>
                    <input
                      type="text"
                      value={plan.title}
                      onChange={(e) => updateTourPlan(dayIndex, 'title', e.target.value)}
                      placeholder={`Day ${plan.day} activities`}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description:</label>
                  <textarea
                    value={plan.description}
                    onChange={(e) => updateTourPlan(dayIndex, 'description', e.target.value)}
                    placeholder="Describe the activities and experiences for this day..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Day-specific Inclusions:</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="e.g., Breakfast, Museum entry, Local guide"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            addTourPlanIncluded(dayIndex, input.value);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                        if (input?.value.trim()) {
                          addTourPlanIncluded(dayIndex, input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {plan.included.length > 0 && (
                    <div className="space-y-1">
                      {plan.included.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <span className="flex-1 text-sm text-blue-800">• {item}</span>
                          <button
                            type="button"
                            onClick={() => removeTourPlanIncluded(dayIndex, itemIndex)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
