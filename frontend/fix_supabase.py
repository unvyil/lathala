with open("src/contexts/StudioContext.tsx", "r") as f:
    content = f.read()

import re
old_block = """      // Fetch CRM Subscribers
      const { data: subs, error: subsError } = await supabase
        .from("subscribers")
        .select("*");
      if (subs && !subsError) setSubscribers(subs as Subscriber[]);

      // Fetch Canvas Projects
      const { data: projs, error: projsError } = await supabase
        .from("projects")
        .select("*");
      if (projs && !projsError) setProjects(projs as Project[]);

      // Fetch Departments
      const { data: deps, error: depsError } = await supabase
        .from("departments")
        .select("*");
      if (deps && !depsError) setDepartments(deps as Department[]);"""

new_block = """      // UNCOMMENT BELOW when your Supabase tables are ready:
      /*
      // Fetch CRM Subscribers
      const { data: subs, error: subsError } = await supabase
        .from("subscribers")
        .select("*");
      if (subs && !subsError) setSubscribers(subs as Subscriber[]);

      // Fetch Canvas Projects
      const { data: projs, error: projsError } = await supabase
        .from("projects")
        .select("*");
      if (projs && !projsError) setProjects(projs as Project[]);

      // Fetch Departments
      const { data: deps, error: depsError } = await supabase
        .from("departments")
        .select("*");
      if (deps && !depsError) setDepartments(deps as Department[]);
      */"""

content = content.replace(old_block, new_block)

with open("src/contexts/StudioContext.tsx", "w") as f:
    f.write(content)
