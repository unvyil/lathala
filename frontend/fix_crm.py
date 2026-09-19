import re

with open("src/pages/CRM.tsx", "r") as f:
    content = f.read()

# Replace Name cell
content = content.replace(
    '<td className="px-4 py-3 text-[13px] font-medium text-onyx">\n                      {sub.name}\n                    </td>',
    '''<td className="px-4 py-3 text-[13px] font-medium text-onyx">
                      <input
                        value={sub.name}
                        onChange={(e) => updateSubscriber(sub.id, { name: e.target.value })}
                        className="bg-transparent border-none outline-none focus:ring-1 focus:ring-accent rounded px-1 w-full"
                      />
                    </td>'''
)

# Replace Email cell
content = content.replace(
    '<td className="px-4 py-3 text-[13px] text-espresso/80">\n                      {sub.email}\n                    </td>',
    '''<td className="px-4 py-3 text-[13px] text-espresso/80">
                      <input
                        value={sub.email}
                        onChange={(e) => updateSubscriber(sub.id, { email: e.target.value })}
                        className="bg-transparent border-none outline-none focus:ring-1 focus:ring-accent rounded px-1 w-full"
                      />
                    </td>'''
)

# Replace Role cell
content = content.replace(
    '<td className="px-4 py-3">\n                      <RolePill role={sub.role} />\n                    </td>',
    '''<td className="px-4 py-3">
                      <input
                        value={sub.role}
                        onChange={(e) => updateSubscriber(sub.id, { role: e.target.value })}
                        className="inline-flex items-center rounded-full bg-yellow px-2.5 py-1 text-[11px] font-bold text-onyx outline-none focus:ring-2 focus:ring-accent max-w-[140px]"
                      />
                    </td>'''
)

with open("src/pages/CRM.tsx", "w") as f:
    f.write(content)
