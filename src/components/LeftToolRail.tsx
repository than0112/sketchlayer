import { CursorClick } from "@phosphor-icons/react/dist/csr/CursorClick";
import { Hand } from "@phosphor-icons/react/dist/csr/Hand";
import { MagnifyingGlassPlus } from "@phosphor-icons/react/dist/csr/MagnifyingGlassPlus";
import { Stack } from "@phosphor-icons/react/dist/csr/Stack";
import { useState } from "react";

const tools = [
  { id: "select", label: "Select", icon: CursorClick },
  { id: "pan", label: "Pan", icon: Hand },
  { id: "zoom", label: "Zoom", icon: MagnifyingGlassPlus },
  { id: "layers", label: "Layers", icon: Stack },
];

export function LeftToolRail() {
  const [active, setActive] = useState("select");
  return (
    <nav className="left-tool-rail" aria-label="Canvas navigation tools">
      {tools.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" className={active === id ? "is-active" : ""} aria-pressed={active === id} onClick={() => setActive(id)}>
          <Icon size={20} weight={active === id ? "fill" : "regular"} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
