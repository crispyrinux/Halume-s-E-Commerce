import { useEffect, useRef, useState } from "react";

const TABLES = {
  users: {
    x: 80, y: 120,
    color: "#1e3a5f",
    header: "#1e3a5f",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "email", type: "VARCHAR(255)", unique: true },
      { name: "password_hash", type: "VARCHAR(255)" },
      { name: "full_name", type: "VARCHAR(100)" },
      { name: "role", type: "ENUM" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  addresses: {
    x: 80, y: 430,
    color: "#1e3a5f",
    header: "#1e3a5f",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "user_id", type: "INT", fk: "users" },
      { name: "recipient_name", type: "VARCHAR(100)" },
      { name: "phone_number", type: "VARCHAR(20)" },
      { name: "address_line", type: "TEXT" },
      { name: "city", type: "VARCHAR(100)" },
      { name: "postal_code", type: "VARCHAR(10)" },
      { name: "is_primary", type: "BOOLEAN" },
    ],
  },
  categories: {
    x: 420, y: 120,
    color: "#1a4731",
    header: "#1a4731",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "name", type: "VARCHAR(100)" },
      { name: "slug", type: "VARCHAR(100)" },
    ],
  },
  products: {
    x: 420, y: 310,
    color: "#1a4731",
    header: "#1a4731",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "category_id", type: "INT", fk: "categories" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "description", type: "TEXT" },
      { name: "price", type: "DECIMAL(12,2)" },
      { name: "stock", type: "INT" },
      { name: "sku", type: "VARCHAR(100)" },
      { name: "image_url", type: "VARCHAR(255)" },
      { name: "is_active", type: "BOOLEAN" },
    ],
  },
  carts: {
    x: 760, y: 120,
    color: "#5c2a00",
    header: "#5c2a00",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "user_id", type: "INT", fk: "users" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  cart_items: {
    x: 760, y: 330,
    color: "#5c2a00",
    header: "#5c2a00",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "cart_id", type: "INT", fk: "carts" },
      { name: "product_id", type: "INT", fk: "products" },
      { name: "quantity", type: "INT" },
    ],
  },
  orders: {
    x: 1080, y: 120,
    color: "#3b1278",
    header: "#3b1278",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "user_id", type: "INT", fk: "users" },
      { name: "total_amount", type: "DECIMAL(12,2)" },
      { name: "status", type: "ENUM" },
      { name: "snap_token", type: "VARCHAR(255)" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  order_items: {
    x: 1080, y: 430,
    color: "#3b1278",
    header: "#3b1278",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "order_id", type: "INT", fk: "orders" },
      { name: "product_id", type: "INT", fk: "products" },
      { name: "quantity", type: "INT" },
      { name: "price_at_purchase", type: "DECIMAL(12,2)" },
    ],
  },
  payments: {
    x: 1400, y: 120,
    color: "#0a3d4a",
    header: "#0a3d4a",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "order_id", type: "INT", fk: "orders" },
      { name: "payment_method", type: "VARCHAR(50)" },
      { name: "payment_status", type: "ENUM" },
      { name: "transaction_time", type: "TIMESTAMP" },
      { name: "external_id", type: "VARCHAR(255)" },
    ],
  },
  shipments: {
    x: 1400, y: 430,
    color: "#4a2800",
    header: "#4a2800",
    fields: [
      { name: "id", type: "INT", pk: true },
      { name: "order_id", type: "INT", fk: "orders" },
      { name: "courier_name", type: "VARCHAR(50)" },
      { name: "tracking_number", type: "VARCHAR(100)" },
      { name: "shipped_at", type: "TIMESTAMP" },
      { name: "status", type: "ENUM" },
    ],
  },
};

const TABLE_W = 260;
const ROW_H = 28;
const HEADER_H = 36;

function tableHeight(t) {
  return HEADER_H + t.fields.length * ROW_H + 2;
}

// returns center-x, y of a specific field row in a table
function fieldAnchor(tableName, fieldName, side = "right") {
  const t = TABLES[tableName];
  const idx = t.fields.findIndex((f) => f.name === fieldName);
  const y = t.y + HEADER_H + idx * ROW_H + ROW_H / 2;
  const x = side === "right" ? t.x + TABLE_W : t.x;
  return { x, y };
}

// PK anchor (id row)
function pkAnchor(tableName, side = "right") {
  return fieldAnchor(tableName, "id", side);
}

// Build all relation paths
function buildRelations() {
  const fkRelations = [];
  for (const [tName, t] of Object.entries(TABLES)) {
    for (const f of t.fields) {
      if (f.fk) {
        fkRelations.push({ from: f.fk, to: tName, fkField: f.name });
      }
    }
  }
  return fkRelations;
}

// Crow's foot markers
function CrowsFoot({ x, y, dir }) {
  // dir: "left" or "right" — which side the many-end is
  const len = 10;
  const spread = 6;
  if (dir === "right") {
    return (
      <g>
        <line x1={x} y1={y} x2={x + len} y2={y - spread} stroke="#666" strokeWidth="1.5" />
        <line x1={x} y1={y} x2={x + len} y2={y} stroke="#666" strokeWidth="1.5" />
        <line x1={x} y1={y} x2={x + len} y2={y + spread} stroke="#666" strokeWidth="1.5" />
        <line x1={x + len} y1={y - spread * 1.4} x2={x + len} y2={y + spread * 1.4} stroke="#666" strokeWidth="1.5" />
      </g>
    );
  } else {
    return (
      <g>
        <line x1={x} y1={y} x2={x - len} y2={y - spread} stroke="#666" strokeWidth="1.5" />
        <line x1={x} y1={y} x2={x - len} y2={y} stroke="#666" strokeWidth="1.5" />
        <line x1={x} y1={y} x2={x - len} y2={y + spread} stroke="#666" strokeWidth="1.5" />
        <line x1={x - len} y1={y - spread * 1.4} x2={x - len} y2={y + spread * 1.4} stroke="#666" strokeWidth="1.5" />
      </g>
    );
  }
}

function OneMarker({ x, y, dir }) {
  const len = 10;
  if (dir === "right") {
    return (
      <g>
        <line x1={x + 2} y1={y - 7} x2={x + 2} y2={y + 7} stroke="#666" strokeWidth="1.5" />
        <line x1={x + 7} y1={y - 7} x2={x + 7} y2={y + 7} stroke="#666" strokeWidth="1.5" />
      </g>
    );
  } else {
    return (
      <g>
        <line x1={x - 2} y1={y - 7} x2={x - 2} y2={y + 7} stroke="#666" strokeWidth="1.5" />
        <line x1={x - 7} y1={y - 7} x2={x - 7} y2={y + 7} stroke="#666" strokeWidth="1.5" />
      </g>
    );
  }
}

function RelationLine({ fromTable, toTable, fkField }) {
  const fromT = TABLES[fromTable];
  const toT = TABLES[toTable];

  // Determine best sides to connect
  const fromCx = fromT.x + TABLE_W / 2;
  const toCx = toT.x + TABLE_W / 2;

  let pkSide, fkSide;
  if (fromCx <= toCx) {
    pkSide = "right";
    fkSide = "left";
  } else {
    pkSide = "left";
    fkSide = "right";
  }

  const pk = pkAnchor(fromTable, pkSide);
  const fk = fieldAnchor(toTable, fkField, fkSide);

  // Route the path
  const dx = Math.abs(fk.x - pk.x);
  const gap = Math.max(20, dx * 0.4);

  let d;
  if (pkSide === "right") {
    const cx1 = pk.x + gap;
    const cx2 = fk.x - gap;
    d = `M${pk.x},${pk.y} C${cx1},${pk.y} ${cx2},${fk.y} ${fk.x},${fk.y}`;
  } else {
    const cx1 = pk.x - gap;
    const cx2 = fk.x + gap;
    d = `M${pk.x},${pk.y} C${cx1},${pk.y} ${cx2},${fk.y} ${fk.x},${fk.y}`;
  }

  return (
    <g>
      <path d={d} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6,3" />
      {/* One side (PK) */}
      <OneMarker x={pk.x} y={pk.y} dir={pkSide === "right" ? "right" : "left"} />
      {/* Many side (FK) */}
      <CrowsFoot x={fk.x} y={fk.y} dir={fkSide === "left" ? "left" : "right"} />
    </g>
  );
}

function ERDTable({ name, table, highlight, onHover }) {
  const h = tableHeight(table);
  return (
    <g
      transform={`translate(${table.x},${table.y})`}
      onMouseEnter={() => onHover(name)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "default" }}
    >
      {/* Shadow */}
      <rect x="4" y="4" width={TABLE_W} height={h} rx="6" fill="#00000018" />
      {/* Body */}
      <rect width={TABLE_W} height={h} rx="6" fill="white" stroke={highlight ? table.color : "#d1d5db"} strokeWidth={highlight ? 2.5 : 1.5} />
      {/* Header */}
      <rect width={TABLE_W} height={HEADER_H} rx="6" fill={table.color} />
      <rect y={HEADER_H - 6} width={TABLE_W} height={6} fill={table.color} />
      <text x={TABLE_W / 2} y={HEADER_H - 10} textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="'IBM Plex Mono', monospace">
        {name}
      </text>

      {/* Fields */}
      {table.fields.map((f, i) => {
        const fy = HEADER_H + i * ROW_H;
        const isEven = i % 2 === 0;
        return (
          <g key={f.name}>
            <rect x="0" y={fy} width={TABLE_W} height={ROW_H}
              fill={f.pk ? "#fefce8" : f.fk ? "#eff6ff" : isEven ? "#fafafa" : "white"}
              rx={i === table.fields.length - 1 ? 6 : 0}
            />
            {i === table.fields.length - 1 && (
              <rect x="0" y={fy} width={TABLE_W} height={6} fill={f.pk ? "#fefce8" : f.fk ? "#eff6ff" : isEven ? "#fafafa" : "white"} />
            )}
            <line x1="0" y1={fy} x2={TABLE_W} y2={fy} stroke="#e5e7eb" strokeWidth="0.8" />

            {/* PK/FK badge */}
            {f.pk && (
              <g>
                <rect x="6" y={fy + 6} width="22" height="15" rx="3" fill="#ca8a04" />
                <text x="17" y={fy + 17} textAnchor="middle" fontSize="8" fontWeight="700" fill="white" fontFamily="monospace">PK</text>
              </g>
            )}
            {f.fk && (
              <g>
                <rect x="6" y={fy + 6} width="22" height="15" rx="3" fill="#2563eb" />
                <text x="17" y={fy + 17} textAnchor="middle" fontSize="8" fontWeight="700" fill="white" fontFamily="monospace">FK</text>
              </g>
            )}
            {!f.pk && !f.fk && f.unique && (
              <g>
                <rect x="6" y={fy + 6} width="22" height="15" rx="3" fill="#7c3aed" />
                <text x="17" y={fy + 17} textAnchor="middle" fontSize="8" fontWeight="700" fill="white" fontFamily="monospace">UQ</text>
              </g>
            )}

            {/* Field name */}
            <text x="36" y={fy + ROW_H - 8} fontSize="11.5" fill={f.pk ? "#78350f" : f.fk ? "#1d4ed8" : "#1f2937"}
              fontWeight={f.pk || f.fk ? "600" : "400"} fontFamily="'IBM Plex Mono', monospace">
              {f.name}
            </text>
            {/* Type */}
            <text x={TABLE_W - 6} y={fy + ROW_H - 8} textAnchor="end" fontSize="10" fill="#9ca3af" fontFamily="'IBM Plex Mono', monospace">
              {f.type}
            </text>
          </g>
        );
      })}

      {/* Bottom border */}
      <rect y={h - 2} width={TABLE_W} height={2} rx="2" fill={table.color} opacity="0.4" />
    </g>
  );
}

export default function ERD() {
  const [hovered, setHovered] = useState(null);
  const relations = buildRelations();

  // SVG canvas size — auto from table positions
  const maxX = Math.max(...Object.values(TABLES).map((t) => t.x + TABLE_W)) + 60;
  const maxY = Math.max(...Object.values(TABLES).map((t) => t.y + tableHeight(t))) + 60;

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const svgRef = useRef();

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(2, Math.max(0.3, s * delta)));
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };
  const handleMouseMove = (e) => {
    if (dragging) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => { if (svg) svg.removeEventListener("wheel", handleWheel); };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", color: "white", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 700, color: "#f59e0b", letterSpacing: 1 }}>HALUME</span>
          <span style={{ marginLeft: 12, fontSize: 13, color: "#94a3b8" }}>Entity Relationship Diagram  ·  10 Tables</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {[["PK", "#ca8a04", "Primary Key"], ["FK", "#2563eb", "Foreign Key"], ["UQ", "#7c3aed", "Unique"]].map(([label, color, desc]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ background: color, borderRadius: 3, padding: "2px 6px", fontSize: 9, fontWeight: 700, color: "white", fontFamily: "monospace" }}>{label}</div>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{desc}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="30" height="14"><line x1="0" y1="7" x2="30" y2="7" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" /></svg>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>1 : N</span>
          </div>
          <span style={{ fontSize: 11, color: "#64748b" }}>Scroll = zoom  ·  Drag = pan</span>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, overflow: "hidden", cursor: dragging ? "grabbing" : "grab", position: "relative" }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <svg ref={svgRef} width="100%" height="100%">
          <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
            {/* Grid dots */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#cbd5e1" opacity="0.5" />
              </pattern>
            </defs>
            <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#grid)" />

            {/* Relations — draw first (behind tables) */}
            {relations.map((r, i) => (
              <RelationLine key={i} fromTable={r.from} toTable={r.to} fkField={r.fkField} />
            ))}

            {/* Tables */}
            {Object.entries(TABLES).map(([name, table]) => (
              <ERDTable key={name} name={name} table={table} highlight={hovered === name} onHover={setHovered} />
            ))}
          </g>
        </svg>
      </div>

      {/* Footer */}
      <div style={{ background: "#0f172a", padding: "6px 24px", fontSize: 11, color: "#475569", display: "flex", justifyContent: "space-between" }}>
        <span>Kelompok Halume  ·  WRPL Universitas Gadjah Mada</span>
        <span>Zoom: {Math.round(scale * 100)}%  ·  {Object.keys(TABLES).length} tables  ·  {relations.length} relations</span>
      </div>
    </div>
  );
}
