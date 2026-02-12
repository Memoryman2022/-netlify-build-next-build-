"use client";

import { ChangeEvent } from "react";

type YesNo = "Yes" | "No";

export type Artist = {
  _id: string;
  name: string;
  response: YesNo;
  available: YesNo;
  cost: number;
  selected?: boolean;
  isTemp?: boolean;
};

type Props = {
  artists: Artist[];
  onFieldChange: <K extends keyof Artist>(id: string, field: K, value: Artist[K]) => void;
  onToggleSelect: (id: string) => void;
};

export default function ArtistTable({ artists, onFieldChange, onToggleSelect }: Props) {
  // Sorting: response Yes > No, available Yes > No, cost high > low
  const sorted = [...artists].sort((a, b) => {
    if (a.response !== b.response) return a.response === "Yes" ? -1 : 1;
    if (a.available !== b.available) return a.available === "Yes" ? -1 : 1;
    return b.cost - a.cost; // high to low
  });

  const totalCost = artists.reduce((sum, a) => sum + (a.cost || 0), 0);

  const cellStyle: React.CSSProperties = {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "center",
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: "bold",
    textAlign: "center",
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={headerCellStyle}>#</th>
          <th style={headerCellStyle}>Name</th>
          <th style={headerCellStyle}>Response</th>
          <th style={headerCellStyle}>Available</th>
          <th style={headerCellStyle}>Cost (£)</th>
          <th style={headerCellStyle}>Select</th>
        </tr>
      </thead>

      <tbody>
        {sorted.map((artist, index) => (
          <tr key={artist._id}>
            <td style={cellStyle}>{index + 1}</td>
            <td style={cellStyle}>
              <input
                style={{ width: "100%", textAlign: "left", border: "none" }}
                value={artist.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onFieldChange(artist._id, "name", e.target.value)
                }
              />
            </td>
            <td style={cellStyle}>
              <select
                style={{ width: "100%", textAlign: "center", border: "none" }}
                value={artist.response}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  onFieldChange(artist._id, "response", e.target.value as YesNo)
                }
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </td>
            <td style={cellStyle}>
              <select
                style={{ width: "100%", textAlign: "center", border: "none" }}
                value={artist.available}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  onFieldChange(artist._id, "available", e.target.value as YesNo)
                }
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </td>
            <td style={cellStyle}>
              <input
                type="number"
                style={{ width: "100%", textAlign: "center", border: "none" }}
                value={artist.cost ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onFieldChange(
                    artist._id,
                    "cost",
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
              />
            </td>
            <td style={cellStyle}>
              <input
                type="checkbox"
                checked={artist.selected || false}
                onChange={() => onToggleSelect(artist._id)}
              />
            </td>
          </tr>
        ))}
      </tbody>

      <tfoot>
        <tr>
          <td colSpan={4} style={{ ...cellStyle, textAlign: "right", fontWeight: "bold" }}>
            Total Cost
          </td>
          <td style={cellStyle}>£{totalCost}</td>
          <td style={cellStyle}></td>
        </tr>
      </tfoot>
    </table>
  );
}
