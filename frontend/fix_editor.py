import re

with open("src/pages/Editor.tsx", "r") as f:
    content = f.read()

# Add GlobalHeader import
if "GlobalHeader" not in content:
    content = content.replace("import { EditorTopBar", "import { GlobalHeader } from '../components/ui/GlobalHeader'\nimport { EditorTopBar")

# Add GlobalHeader to render
if "<GlobalHeader />" not in content:
    content = content.replace("<EditorTopBar", "<GlobalHeader />\n      <EditorTopBar")

with open("src/pages/Editor.tsx", "w") as f:
    f.write(content)

with open("src/pages/CRM.tsx", "r") as f:
    crm = f.read()

if "GlobalHeader" not in crm:
    crm = crm.replace("import { Button", "import { GlobalHeader } from '../components/ui/GlobalHeader'\nimport { Button")
    crm = re.sub(r'<header.*?</header>', '<GlobalHeader />', crm, flags=re.DOTALL)

with open("src/pages/CRM.tsx", "w") as f:
    f.write(crm)

with open("src/components/editor/EditorTopBar.tsx", "r") as f:
    topbar = f.read()

# Remove the dropdown menu entirely
topbar = re.sub(r'<div className="relative" ref={menuRef}>.*?</div>', '', topbar, flags=re.DOTALL)

with open("src/components/editor/EditorTopBar.tsx", "w") as f:
    f.write(topbar)
