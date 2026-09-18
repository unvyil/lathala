with open("frontend/src/types.ts", "r") as f:
    content = f.read()

content = content.replace(
    '| "link_zone";',
    '| "link_zone"\n  | "polygon"\n  | "star"\n  | "line";'
)

# Also x and width are optional in CanvasElement, but they shouldn't be since we manipulate them directly. Wait, I won't change interface props unless needed.

with open("frontend/src/types.ts", "w") as f:
    f.write(content)
