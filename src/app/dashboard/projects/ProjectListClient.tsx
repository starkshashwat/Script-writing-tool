"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, Search, Plus, Trash2, Calendar, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createProject, deleteProject } from "./actions";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ProjectListClientProps {
  initialProjects: Project[];
}

export function ProjectListClient({ initialProjects }: ProjectListClientProps) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [projectDescription, setProjectDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Deletion loading states tracked by project ID
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Sync state if props change (though revalidatePath updates page)
  React.useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // Filter projects by query
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query))
    );
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (!projectName.trim()) {
      setFormError("Workspace name is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const newProject = await createProject(projectName, projectDescription);
      setProjects([newProject, ...projects]);
      setIsModalOpen(false);
      setProjectName("");
      setProjectDescription("");
    } catch (err: any) {
      setFormError(err.message || "Failed to create workspace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if nested in link (though cards link separately)
    
    if (!confirm("Are you sure you want to delete this workspace? All associated uploaded files will be permanently deleted.")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete workspace.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2b1613] font-display">Workspaces</h1>
          <p className="text-[#603e39] mt-1 font-medium font-body">Manage and access your video strategy workspaces.</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#bc0100] hover:bg-[#aa3000] text-white gap-2 shadow-md shadow-[#bc0100]/10 cursor-pointer font-bold"
        >
          <Plus className="h-4 w-4" /> Create Workspace
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#956d67]" />
        <Input
          type="text"
          placeholder="Search workspaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-[#ebbbb4]/40 bg-white/80 text-[#2b1613] placeholder:text-[#603e39]/30 focus-visible:ring-[#bc0100] focus-visible:border-[#ebbbb4]"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="border-[#ebbbb4]/40 border-dashed bg-white/40 text-[#2b1613] p-12 text-center flex flex-col items-center justify-center">
          <FolderKanban className="h-16 w-16 text-[#956d67]/40 mb-4" />
          <h3 className="text-xl font-bold text-[#2b1613] mb-2 font-display">No workspaces found</h3>
          <p className="text-[#603e39]/70 text-sm max-w-sm font-medium">
            {searchQuery ? "No workspaces match your query. Try a different search." : "Get started by creating your first strategy workspace."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsModalOpen(true)} className="bg-[#bc0100] hover:bg-[#aa3000] text-white mt-6 font-bold shadow-md shadow-[#bc0100]/10">
              Create First Workspace
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="border-[#ebbbb4]/30 bg-white/70 hover:bg-white hover:border-[#ebbbb4] text-[#2b1613] flex flex-col justify-between group relative transition-all shadow-sm"
            >
              <CardHeader className="p-6 pb-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff0ee] border border-[#ebbbb4]/40 text-[#bc0100] group-hover:bg-[#bc0100] group-hover:text-white transition-colors duration-300">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="h-8 w-8 text-[#956d67] hover:text-red-600 hover:bg-red-50 transition-colors rounded-md cursor-pointer"
                    disabled={deletingId === project.id}
                    isLoading={deletingId === project.id}
                  >
                    {deletingId !== project.id && <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
                <CardTitle className="mt-4 text-lg font-bold text-[#2b1613] group-hover:text-[#bc0100] transition-colors font-display">
                  {project.name}
                </CardTitle>
                <CardDescription className="text-[#603e39] text-sm mt-2 line-clamp-3 min-h-[60px] font-medium leading-relaxed">
                  {project.description || "No description provided."}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 flex flex-col gap-2 text-xs text-[#603e39]/60 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-[#ebbbb4]/20 bg-[#fff8f6]/30 mt-auto flex justify-end">
                <Link href={`/project/${project.id}`} className="w-full">
                  <Button variant="outline" className="w-full border-[#ebbbb4]/40 hover:bg-[#ffe9e6] text-[#603e39] hover:text-[#bc0100] font-bold justify-between transition-colors">
                    Open Workspace
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal Dialog */}
      <Dialog open={isModalOpen}>
        <DialogContent onClose={() => setIsModalOpen(false)} className="border-[#ebbbb4]/40 bg-white text-[#2b1613]">
          <DialogHeader>
            <DialogTitle className="text-[#2b1613] font-bold font-display text-xl">New Workspace</DialogTitle>
            <DialogDescription className="text-[#603e39]/80 text-xs font-medium">
              Establish a secure workspace directory for your video uploads.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="my-2 rounded-md bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateProject} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <label htmlFor="projectName" className="text-xs font-bold text-[#603e39] uppercase tracking-wider">
                Workspace Name
              </label>
              <Input
                id="projectName"
                type="text"
                placeholder="e.g. YouTube Channel Strategy"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="border-[#ebbbb4]/40 bg-[#fff8f6]/50 text-[#2b1613] placeholder:text-[#603e39]/30 focus-visible:ring-[#bc0100] focus-visible:border-[#ebbbb4]"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="projectDescription" className="text-xs font-bold text-[#603e39] uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                id="projectDescription"
                rows={3}
                placeholder="Enter workspace description..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="flex w-full rounded-md border border-[#ebbbb4]/40 bg-[#fff8f6]/50 px-3 py-2 text-sm text-[#2b1613] placeholder:text-[#603e39]/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#bc0100] focus-visible:border-[#ebbbb4] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-[#ebbbb4]/20">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="border-[#ebbbb4]/40 text-[#603e39] hover:bg-[#ffe9e6] hover:text-[#bc0100]"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#bc0100] text-white hover:bg-[#aa3000] font-bold shadow-md shadow-[#bc0100]/10"
                isLoading={isSubmitting}
              >
                Create Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
