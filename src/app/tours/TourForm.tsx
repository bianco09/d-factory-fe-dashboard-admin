"use client"

import { useState, useEffect } from "react";
import { createTour, updateTour } from "@/utils/api";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

export default function TourForm({ onCreated, editingTour }: { 
  onCreated?: () => void;
  editingTour?: {
    id: number;
    title: string;
    description?: string;
    location?: string;
    days: number;
    price: number;
    type: string;
    startDate?: string;
    endDate?: string;
    categories?: string[];
    included?: string[];
    excluded?: string[];
    status?: string;
    tourPlans?: Array<{
      day: number;
      title: string;
      description: string;
      included: string[];
    }>;
  };
}) {
  // Helper function to format date for HTML input
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const [form, setForm] = useState({
    title: editingTour?.title || "",
    description: editingTour?.description || "",
    location: editingTour?.location || "",
    days: editingTour?.days || 1,
    price: editingTour?.price || 0,
    type: editingTour?.type || "single", // 'single' or 'multi'
    startDate: formatDateForInput(editingTour?.startDate), // for single day or multi-day start
    endDate: formatDateForInput(editingTour?.endDate), // for multi-day end date
    categories: editingTour?.categories || [] as string[], // changed from single category to multiple categories
    included: editingTour?.included || [] as string[], // included items
    excluded: editingTour?.excluded || [] as string[], // excluded items
    status: editingTour?.status || "draft", // draft, in_progress, published
    tourPlans: editingTour?.tourPlans || [] as Array<{
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
    content: editingTour?.description || '',
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, description: editor.getHTML() }));
    },
    immediatelyRender: false,
  });

  // Set editor content when editing a tour
  useEffect(() => {
    if (editor && editingTour?.description) {
      editor.commands.setContent(editingTour.description);
    }
  }, [editor, editingTour?.description]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newIncluded, setNewIncluded] = useState("");
  const [newExcluded, setNewExcluded] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Common travel booking include/exclude options
  const commonIncludes = [
    "Professional tour guide",
    "Transportation",
    "Lunch",
    "Breakfast",
    "Dinner", 
    "Hotel pickup and drop-off",
    "Entrance fees",
    "All taxes and fees",
    "Bottled water",
    "Snacks",
    "Equipment rental",
    "Safety gear",
    "Photography service",
    "Local guide",
    "Group tour",
    "Small group (max 12 people)",
    "Air-conditioned vehicle",
    "WiFi on board",
    "Travel insurance",
    "Souvenir",
    "Welcome drink",
    "Certificate of completion"
  ];

  const commonExcludes = [
    "Personal expenses",
    "Tips and gratuities",
    "Alcoholic beverages",
    "Travel insurance",
    "Souvenirs",
    "Additional meals not mentioned",
    "Optional activities",
    "Hotel accommodation",
    "Flight tickets",
    "Visa fees",
    "Medical expenses",
    "Laundry services",
    "Phone calls",
    "Room service",
    "Spa treatments",
    "Photography (personal)",
    "Extra equipment",
    "Private guide (upgrade)",
    "Single room supplement",
    "Early check-in/late check-out",
    "Airport transfers (if not mentioned)",
    "Travel to meeting point"
  ];

  // Helper function to calculate end date based on start date and number of days
  function calculateEndDate(startDate: string, days: number): string {
    if (!startDate || days <= 1) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1); // -1 because start date is day 1
    return end.toISOString().split('T')[0];
  }

  // Helper function to calculate completion percentage
  function calculateCompletion(formData: typeof form): number {
    let completed = 0;
    let total = 0;

    // Required fields
    total += 1; if (formData.title.trim()) completed += 1;
    total += 1; if (formData.price > 0) completed += 1;
    
    // Important fields
    total += 1; if (formData.description?.trim()) completed += 1;
    total += 1; if (formData.location?.trim()) completed += 1;
    total += 1; if (formData.startDate) completed += 1;
    total += 1; if (formData.categories.length > 0) completed += 1;
    total += 1; if (formData.included.length > 0) completed += 1;
    total += 1; if (formData.excluded.length > 0) completed += 1;

    // Multi-day specific
    if (formData.type === "multi") {
      total += 1; if (formData.endDate) completed += 1;
      total += 1; if (formData.tourPlans.length === formData.days) completed += 1;
    }

    return Math.round((completed / total) * 100);
  }

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
          endDate: newType === "multi" && prev.startDate ? calculateEndDate(prev.startDate, newDays) : "",
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
          endDate: prev.type === "multi" && prev.startDate ? calculateEndDate(prev.startDate, newDays) : prev.endDate,
          tourPlans: newTourPlans
        };
      });
    } else if (name === "startDate") {
      setForm((prev) => ({
        ...prev,
        startDate: value,
        endDate: prev.type === "multi" ? calculateEndDate(value, prev.days) : ""
      }));
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

  function addCategory() {
    if (newCategory.trim() && !form.categories.includes(newCategory.trim())) {
      setForm(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory("");
    }
  }

  function removeCategory(index: number) {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
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

  function addDay() {
    setForm(prev => {
      const newDayNumber = prev.days + 1;
      const newTourPlan = {
        day: newDayNumber,
        title: `Day ${newDayNumber}`,
        description: "",
        included: []
      };
      
      return {
        ...prev,
        days: newDayNumber,
        tourPlans: [...prev.tourPlans, newTourPlan]
      };
    });
  }

  function removeDay() {
    setForm(prev => {
      if (prev.days <= 1) return prev; // Don't allow removing the last day
      
      return {
        ...prev,
        days: prev.days - 1,
        tourPlans: prev.tourPlans.slice(0, -1) // Remove the last day
      };
    });
  }

  function removeSpecificDay(dayIndex: number) {
    setForm(prev => {
      if (prev.tourPlans.length <= 1) return prev; // Don't allow removing the last day
      
      // Remove the specific day and renumber the remaining days
      const filteredPlans = prev.tourPlans.filter((_, index) => index !== dayIndex);
      const renumberedPlans = filteredPlans.map((plan, index) => ({
        ...plan,
        day: index + 1
      }));
      
      return {
        ...prev,
        days: prev.days - 1,
        tourPlans: renumberedPlans
      };
    });
  }

  async function handleSubmit(e: React.FormEvent, saveAsDraft = false) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const completionPercentage = calculateCompletion(form);
      let status = form.status;
      
      if (saveAsDraft) {
        status = "draft";
      } else {
        // Auto-determine status based on completion
        if (completionPercentage >= 90) {
          status = "published";
        } else if (completionPercentage >= 50) {
          status = "in_progress";
        } else {
          status = "draft";
        }
      }

      const tourData = {
        ...form,
        status,
        completionPercentage
      };

      if (editingTour) {
        // Update existing tour
        await updateTour(editingTour.id, tourData);
      } else {
        // Create new tour
        await createTour(tourData);
      }

      if (!saveAsDraft) {
        // Only reset form if not saving as draft
        setForm({ 
          title: "", 
          description: "", 
          location: "", 
          days: 1, 
          price: 0, 
          type: "single",
          startDate: "",
          endDate: "",
          categories: [],
          included: [],
          excluded: [],
          status: "draft",
          tourPlans: []
        });
        if (editor) editor.commands.setContent("");
        setNewIncluded("");
        setNewExcluded("");
        setNewCategory("");
      }

      if (onCreated) onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving tour");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mb-8 p-6 border rounded-lg bg-white shadow-sm" onSubmit={(e) => handleSubmit(e, false)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {editingTour ? 'Edit Tour' : 'Create Tour'}
        </h2>
        {editingTour && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Completion:</span>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${calculateCompletion(form)}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{calculateCompletion(form)}%</span>
          </div>
        )}
      </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Categories (Tags):</label>
          <div className="flex gap-2 mb-3">
            <select 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category...</option>
              <option value="Adventure">Adventure</option>
              <option value="Cultural">Cultural</option>
              <option value="Nature">Nature</option>
              <option value="Food">Food & Culinary</option>
              <option value="Historical">Historical</option>
              <option value="Relaxation">Relaxation</option>
              <option value="Wildlife">Wildlife</option>
              <option value="City">City Tours</option>
              <option value="Beach">Beach</option>
              <option value="Mountain">Mountain</option>
              <option value="Fun">Fun</option>
              <option value="Family">Family</option>
              <option value="Romantic">Romantic</option>
              <option value="Luxury">Luxury</option>
              <option value="Budget">Budget</option>
            </select>
            <button 
              type="button" 
              onClick={addCategory}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Add
            </button>
          </div>
          {form.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.categories.map((category, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <span>{category}</span>
                  <button 
                    type="button" 
                    onClick={() => removeCategory(index)}
                    className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {form.type === "single" ? "Tour Date:" : "Start Date:"}
          </label>
          <input 
            name="startDate" 
            type="date" 
            value={form.startDate} 
            onChange={handleChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {form.type === "multi" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date:</label>
            <input 
              name="endDate" 
              type="date" 
              value={form.endDate} 
              onChange={handleChange} 
              min={form.startDate} // End date can't be before start date
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Days: {form.days}</label>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={addDay}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                + Add Day
              </button>
              {form.days > 1 && (
                <button
                  type="button"
                  onClick={removeDay}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  - Remove Day
                </button>
              )}
            </div>
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
        
        {/* Quick selection from common options */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-2">Quick Select (Common Options):</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
            {commonIncludes.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (!form.included.includes(option)) {
                    setForm(prev => ({
                      ...prev,
                      included: [...prev.included, option]
                    }));
                  }
                }}
                disabled={form.included.includes(option)}
                className={`text-left text-xs p-2 rounded border transition-colors ${
                  form.included.includes(option)
                    ? 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed'
                    : 'bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-300 cursor-pointer'
                }`}
              >
                {form.included.includes(option) ? '✓ ' : ''}{option}
              </button>
            ))}
          </div>
        </div>

        {/* Custom input for additional items */}
        <div className="flex gap-2 mb-3">
          <input 
            type="text" 
            value={newIncluded} 
            onChange={(e) => setNewIncluded(e.target.value)}
            placeholder="Add custom item (e.g., Special equipment, Custom service)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
          />
          <button 
            type="button" 
            onClick={addIncluded}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Add Custom
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
        
        {/* Quick selection from common options */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-2">Quick Select (Common Exclusions):</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
            {commonExcludes.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (!form.excluded.includes(option)) {
                    setForm(prev => ({
                      ...prev,
                      excluded: [...prev.excluded, option]
                    }));
                  }
                }}
                disabled={form.excluded.includes(option)}
                className={`text-left text-xs p-2 rounded border transition-colors ${
                  form.excluded.includes(option)
                    ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed'
                    : 'bg-white hover:bg-red-50 hover:border-red-300 border-gray-300 cursor-pointer'
                }`}
              >
                {form.excluded.includes(option) ? '✓ ' : ''}{option}
              </button>
            ))}
          </div>
        </div>

        {/* Custom input for additional items */}
        <div className="flex gap-2 mb-3">
          <input 
            type="text" 
            value={newExcluded} 
            onChange={(e) => setNewExcluded(e.target.value)}
            placeholder="Add custom exclusion (e.g., Special fees, Additional services)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExcluded())}
          />
          <button 
            type="button" 
            onClick={addExcluded}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Add Custom
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Daily Itinerary ({form.tourPlans.length} days)</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addDay}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
              >
                + Add Day
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {form.tourPlans.map((plan, dayIndex) => (
              <div key={plan.day} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-700">Day {plan.day}</h4>
                  {form.tourPlans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecificDay(dayIndex)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
                    >
                      Remove Day
                    </button>
                  )}
                </div>
                
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

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          type="submit" 
          className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={loading}
        >
          {loading ? (editingTour ? "Updating..." : "Creating...") : (editingTour ? "Update Tour" : "Create Tour")}
        </button>
        
        <button 
          type="button"
          onClick={(e) => handleSubmit(e as any, true)}
          className="flex-1 px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save as Draft"}
        </button>
      </div>
    </form>
  );
}
