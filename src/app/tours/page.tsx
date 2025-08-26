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
      <h1 className="text-2xl font-bold mb-4">Tours</h1>
      <TourForm onCreated={reloadTours} />
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error loading tours</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Location</th>
              <th>Type</th>
              <th>Days</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.description}</td>
                <td>{t.location}</td>
                <td>{t.type === "single" ? "Single Day" : "Multi Day"}</td>
                <td>{t.type === "multi" ? t.days : 1}</td>
                <td>${t.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
