import { createClient } from "@/utils/supabase/server";
import { ProjectListClient } from "./ProjectListClient";

export const metadata = {
  title: "Workspaces | TubeBoost",
  description: "View and manage your creator workspace projects.",
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  // Fetch projects from Supabase
  const { data: projects = [] } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return <ProjectListClient initialProjects={projects || []} />;
}
