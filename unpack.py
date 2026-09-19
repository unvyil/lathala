import json
import os
import re

transcript_path = "/home/bee/.gemini/antigravity/brain/5a3809e3-6a44-4a74-a10c-67b0cfd44060/.system_generated/logs/transcript_full.jsonl"
with open(transcript_path, 'r') as f:
    lines = f.readlines()

content = ""
for line in reversed(lines):
    data = json.loads(line)
    if data.get('type') == 'USER_INPUT' and '```index.tsx' in data.get('content', ''):
        content = data['content']
        break

if not content:
    print("Could not find the user message with the code blocks.")
    exit(1)

# Regex to match ```filename\n...\n```
pattern = re.compile(r'```([a-zA-Z0-9_./-]+)\n(.*?)```', re.DOTALL)
matches = pattern.findall(content)

base_dir = "/home/bee/Downloads/lathala/lathala/frontend"

for filename, file_content in matches:
    if filename == "package.json" or filename == "tailwind.config.js":
        file_path = os.path.join(base_dir, filename)
    else:
        file_path = os.path.join(base_dir, "src", filename)
    
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        f.write(file_content)
    print(f"Wrote {file_path}")

print(f"Done unpacking {len(matches)} files.")
