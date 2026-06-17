import { createClient } from "@/utils/supabase/server";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user details
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all user's projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects = projectsData || [];

  // Fetch all research files associated with these projects
  let files: any[] = [];
  if (projects.length > 0) {
    const projectIds = projects.map((p) => p.id);
    const { data: filesData } = await supabase
      .from("research_files")
      .select("*")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false });
    files = filesData || [];
  }

  return (
    <DashboardClient
      initialProjects={projects}
      initialFiles={files}
      user={user}
    />
  );
}
