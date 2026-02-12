"use client";

import { useState, useEffect } from "react";
import ArtistTable, { Artist } from "./ArtistTable";

export default function Home() {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    const fetchArtists = async () => {
      const res = await fetch("/api/artists");
      const data: Artist[] = await res.json();
      setArtists(data.map((a) => ({ ...a, selected: false })));
    };
    fetchArtists();
  }, []);

  const handleFieldChange = async <K extends keyof Artist>(
    id: string,
    field: K,
    value: Artist[K]
  ) => {
    const artist = artists.find((a) => a._id === id);
    if (!artist) return;

    setArtists((prev) =>
      prev.map((a) => (a._id === id ? { ...a, [field]: value } : a))
    );

    if (!artist.isTemp) {
      await fetch(`/api/artists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });
    }
  };

  const toggleSelect = (id: string) => {
    setArtists((prev) =>
      prev.map((a) => (a._id === id ? { ...a, selected: !a.selected } : a))
    );
  };

  const addArtist = async () => {
    const tempId = Date.now().toString();
    setArtists((prev) => [
      ...prev,
      { _id: tempId, name: "", response: "No", available: "No", cost: 0, selected: false, isTemp: true },
    ]);

    const res = await fetch("/api/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", response: "No", available: "No", cost: 0 }),
    });
    const savedArtist: Artist = await res.json();

    setArtists((prev) =>
      prev.map((a) => (a._id === tempId ? { ...savedArtist, selected: false } : a))
    );
  };

  const saveSelected = async () => {
    const selected = artists.filter((a) => a.selected && !a.isTemp);
    if (!selected.length) return;

    await fetch("/api/artists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected.map((a) => a._id), field: "saved", value: true }),
    });

    setArtists((prev) =>
      prev.map((a) => (selected.some((s) => s._id === a._id) ? { ...a, selected: false, isTemp: false } : a))
    );

    alert(`Saved ${selected.length} artist(s)`);
  };

  const totalCost = artists.reduce((sum, a) => sum + a.cost, 0);

  return (
    <main style={{ padding: 30 }}>
      <h1>🎶 Artist Contact Tracker</h1>

      <ArtistTable artists={artists} onFieldChange={handleFieldChange} onToggleSelect={toggleSelect} />

      {/* <tfoot>
        <div style={{ marginTop: 10, textAlign: "right", fontWeight: "bold" }}>
          Total Cost: £{totalCost}
        </div>
      </tfoot> */}

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button onClick={addArtist}>➕ Add Artist</button>
        <button onClick={saveSelected} style={{ background: "red", padding: 5 }}>
          💾 Save Selected
        </button>
      </div>
    </main>
  );
}
