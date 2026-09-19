import re

with open("tailwind.config.js", "r") as f:
    content = f.read()

# Replace the colors block
new_colors = """      colors: {
        onyx: '#0A0A0A',
        espresso: '#303030',
        sandbar: '#666666',
        parchment: '#E5E4E2',
        base: '#D9D9D9',
        accent: '#0062FF',
        yellow: '#F8E77C',
        sky: '#5BADFF',
      },"""

content = re.sub(r'colors:\s*\{.*?\},', new_colors, content, flags=re.DOTALL)

with open("tailwind.config.js", "w") as f:
    f.write(content)
