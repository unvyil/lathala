import React from "react";
import { LinkIcon } from "lucide-react";
import type { CanvasElement } from "../../types/studio";

export function ElementView({
  element,
  interactive = false,
}: {
  element: CanvasElement;
  interactive?: boolean;
}) {
  switch (element.kind) {
    case "text":
      return (
        <div
          className="h-full w-full select-none"
          style={{
            fontFamily: `"${element.fontFamily}", "Instrument Sans", sans-serif`,
            fontSize: element.fontSize,
            fontWeight: element.fontWeight,
            color: element.color,
            textAlign: element.align,
            lineHeight: element.lineHeight,
            letterSpacing: `${element.letterSpacing}px`,
            overflow: "hidden",
          }}
        >
          {element.text}
        </div>
      );
    case "shape":
      return (
        <div
          className="h-full w-full"
          style={{
            backgroundColor: element.fill,
            borderRadius:
              element.shape === "ellipse" ? "9999px" : element.radius,
          }}
        />
      );
    case "image":
      return (
        <img
          src={element.src}
          alt={element.alt}
          draggable={false}
          className="h-full w-full select-none object-cover"
          style={{ borderRadius: element.radius }}
        />
      );
    case "hotspot":
      return (
        <div
          className="flex h-full w-full items-center justify-center gap-1.5 rounded-[4px] text-[11px] font-medium"
          style={{
            border: `1.5px dashed ${interactive ? "#0062FF" : "transparent"}`,
            backgroundColor: interactive
              ? "rgba(0, 98, 255, 0.08)"
              : "transparent",
            color: "#0062FF",
          }}
        >
          {interactive && (
            <>
              <LinkIcon size={12} strokeWidth={1.5} />
              {element.label}
            </>
          )}
        </div>
      );
    default:
      return null;
  }
}
