"use client"

import { useEffect, useState } from "react";
import { fetchTours, deleteTour } from "@/utils/api";
import TourForm from "./TourForm";

interface Tour {
  id: number;
  title: string;
  description?: string;
  location?: string;
  days?: number;
  price: number;
  type: string;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  included?: string[];
  excluded?: string[];
  status?: string;
  completionPercentage?: number;
  tourPlans?: Array<{
    id: number;
    day: number;
    title: string;
    description: string;
    included: string[];
  }>;
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  function reloadTours() {
    setLoading(true);
    fetchTours()
      .then(setTours)
      .catch(setError)
      .finally(() => setLoading(false));
  }

  function handleEditTour(tour: Tour) {
    setEditingTour(tour);
  }

  function handleCancelEdit() {
    setEditingTour(null);
  }

  function handleTourSaved() {
    setEditingTour(null);
    reloadTours();
  }

  async function handleDeleteTour(tourId: number) {
    if (!confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }

    setDeleting(tourId);
    try {
      await deleteTour(tourId);
      reloadTours(); // Reload the list
    } catch (err) {
      alert('Failed to delete tour: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    reloadTours();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tours Management</h1>
      
      {editingTour ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Editing: {editingTour.title}</h2>
            <button 
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
            >
              Cancel Edit
            </button>
          </div>
          <TourForm editingTour={{
            ...editingTour,
            days: editingTour.days || 1
          }} onCreated={handleTourSaved} />
        </div>
      ) : (
        <TourForm onCreated={reloadTours} />
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading tours...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading tours: {error.message}</p>
          <button 
            onClick={reloadTours}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tour.title}</div>
                      <div className="text-sm text-gray-500">{tour.location}</div>
                      {tour.type === "multi" && (
                        <div className="text-xs text-blue-600">{tour.days} days</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {tour.categories && tour.categories.length > 0 ? (
                        tour.categories.map((cat, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No categories</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tour.status === 'published' ? 'bg-green-100 text-green-800' :
                        tour.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tour.status === 'published' ? '✓ Published' :
                         tour.status === 'in_progress' ? '⏳ In Progress' :
                         '📝 Draft'}
                      </span>
                      {tour.completionPercentage !== undefined && (
                        <span className="text-xs text-gray-600">{tour.completionPercentage}%</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tour.type === "single" ? "Single Day" : "Multi Day"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${tour.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      {tour.included && tour.included.length > 0 && (
                        <div className="text-xs">✅ {tour.included.length} inclusions</div>
                      )}
                      {tour.excluded && tour.excluded.length > 0 && (
                        <div className="text-xs">❌ {tour.excluded.length} exclusions</div>
                      )}
                      {tour.tourPlans && tour.tourPlans.length > 0 && (
                        <div className="text-xs">📅 {tour.tourPlans.length} day plans</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTour(tour)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour.id)}
                        disabled={deleting === tour.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === tour.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
