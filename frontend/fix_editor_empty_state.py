with open("src/pages/Editor.tsx", "r") as f:
    content = f.read()

empty_state = """
  if (!activeProject) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-parchment">
        <GlobalHeader />
        <div className="flex min-h-full items-center justify-center flex-col gap-4">
          <p className="text-[13px] font-medium text-onyx">No active project.</p>
          <button
            onClick={() => createProject()}
            className="text-[13px] font-medium text-parchment bg-accent px-4 py-2 rounded-lg"
          >
            Create New Design
          </button>
        </div>
      </div>
    )
  }
"""

import re
# Replace the if (!activeProject) block
content = re.sub(
    r'  if \(!activeProject\) \{[\s\S]*?No design open — back to files\n\s*</button>\n\s*</div>\n\s*\)\n\s*\}',
    empty_state.strip(),
    content
)

with open("src/pages/Editor.tsx", "w") as f:
    f.write(content)
