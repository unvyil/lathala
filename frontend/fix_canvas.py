with open("src/components/editor/CanvasStage.tsx", "r") as f:
    content = f.read()

# When outer well clicked, onSelect(null)
# When artboard clicked, onSelect('canvas')

content = content.replace(
    'onPointerDown={() => onSelect(null)}',
    'onPointerDown={() => onSelect(null)}'
)
content = content.replace(
    'onPointerUp={endDrag}',
    'onPointerUp={endDrag}\n          onPointerDown={(e) => { e.stopPropagation(); onSelect("canvas"); }}'
)

# Add highlight
highlight = """
          style={{
            width: ARTBOARD_WIDTH,
            height: ARTBOARD_HEIGHT,
            backgroundColor: '#D9D9D9',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            border: selectedId === 'canvas' ? '3px solid #0062FF' : 'none',
          }}
"""
content = content.replace(
    """          style={{
            width: ARTBOARD_WIDTH,
            height: ARTBOARD_HEIGHT,
            backgroundColor: '#DBD6D0',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}""",
    highlight
)

# Add dimension label
label = """
        {selectedId === 'canvas' && (
          <div className="mb-2 text-[#0062FF] font-mono text-xs flex justify-between" style={{width: ARTBOARD_WIDTH * zoom}}>
            <span>NEWSLETTER ARTBOARD</span>
            <span>{ARTBOARD_WIDTH} × {ARTBOARD_HEIGHT}</span>
          </div>
        )}
        <div
          role="application"
"""
content = content.replace('<div\n          role="application"', label)

with open("src/components/editor/CanvasStage.tsx", "w") as f:
    f.write(content)
