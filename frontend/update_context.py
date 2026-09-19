import re

with open("src/contexts/StudioContext.tsx", "r") as f:
    content = f.read()

# Add supabase import
if "import { supabase }" not in content:
    content = content.replace("import {\n  AppView,", "import { supabase } from '../lib/supabase'\nimport {\n  AppView,")

# Add useEffect for fetching
use_effect = """
  // Supabase Data Fetching Boilerplate
  useEffect(() => {
    async function loadData() {
      // Uncomment when tables are created in Supabase:
      // const { data: subs } = await supabase.from('subscribers').select('*')
      // if (subs) setSubscribers(subs)
      
      // const { data: projs } = await supabase.from('projects').select('*')
      // if (projs) setProjects(projs)
    }
    loadData()
  }, [])
"""
content = content.replace("const activeProject = useMemo(", use_effect + "\n  const activeProject = useMemo(")

with open("src/contexts/StudioContext.tsx", "w") as f:
    f.write(content)
