import React from "react";
import type { CanvasElement } from "../../types/studio";
import { ElementView } from "./ElementView";
import { ARTBOARD_HEIGHT, ARTBOARD_WIDTH } from "./constants";

export function ArtboardPreview({
  elements,
  scale,
  className = "",
}: {
  elements: CanvasElement[];
  scale: number;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: ARTBOARD_WIDTH * scale,
        height: ARTBOARD_HEIGHT * scale,
        backgroundColor: "#DBD6D0",
      }}
    >
      <div
        style={{
          width: ARTBOARD_WIDTH,
          height: ARTBOARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {elements
          .filter((el) => el.visible)
          .map((el) => (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
              }}
            >
              <ElementView element={el} />
            </div>
          ))}
      </div>
    </div>
  );
}
