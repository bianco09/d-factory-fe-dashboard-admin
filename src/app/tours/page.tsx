"use client"

import { useEffect, useState } from "react";
import { fetchTours } from "@/utils/api";
import TourForm from "./TourForm";

interface Tour {
  id: number;
  title: string;
  description?: string;
  location?: string;
  days?: number;
  price: number;
  type: string;
  category?: string;
  included?: string[];
  excluded?: string[];
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

  function reloadTours() {
    setLoading(true);
    fetchTours()
      .then(setTours)
      .catch(setError)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reloadTours();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tours Management</h1>
      <TourForm onCreated={reloadTours} />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {tour.category || 'adventure'}
                    </span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
