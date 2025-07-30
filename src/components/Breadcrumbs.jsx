import React from "react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <div style={{ fontSize: 18, color: "#a1a1a1", fontWeight: 400 }}>
      {items.map((item, idx) =>
        item.to ? (
          <span key={item.label}>
            <Link to={item.to} style={{ color: "#a1a1a1", textDecoration: "none" }}>{item.label}</Link>
            {idx < items.length - 1 && <span style={{ margin: "0 4px" }}> &gt; </span>}
          </span>
        ) : (
          <span key={item.label} style={{ fontWeight: 600, color: "#1b3966" }}>
            {item.label}
          </span>
        )
      )}
    </div>
  );
}
