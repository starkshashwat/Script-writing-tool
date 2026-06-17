"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  Search,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Video,
  UploadCloud,
  ArrowRight,
  Dna,
  FileText,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  FileCode,
  Sliders,
  Maximize2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createProject, deleteProject } from "./projects/actions";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface ResearchFile {
  id: string;
  project_id: string;
  name: string;
  size: number;
  type: string;
  storage_path: string;
  created_at: string;
}

interface DashboardClientProps {
  initialProjects: Project[];
  initialFiles: ResearchFile[];
  user: any;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const statusStyles: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  Analyzing: "bg-purple-50 text-purple-700 border-purple-200",
  "Research Ready": "bg-emerald-50 text-emerald-750 border-emerald-200",
  Generating: "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-[#fff0ee] text-[#bc0100] border-[#ebbbb4]/45",
  Failed: "bg-red-50 text-red-750 border-red-200",
};

// Mock DNA Library Data
const initialMockDNALibrary = [
  {
    id: "dna-1",
    title: "I Survived 100 Days In A Circle",
    creator: "MrBeast",
    hookScore: 98,
    retentionScore: 92,
    openLoops: 12,
    thumbnailBg: "from-red-500 to-orange-600",
    url: "https://youtube.com/watch?v=dummy1",
    views: "142M views",
  },
  {
    id: "dna-2",
    title: "How to Build a $1M Side Hustle",
    creator: "Ali Abdaal",
    hookScore: 94,
    retentionScore: 84,
    openLoops: 6,
    thumbnailBg: "from-blue-600 to-[#0059ba]",
    url: "https://youtube.com/watch?v=dummy2",
    views: "2.4M views",
  },
  {
    id: "dna-3",
    title: "The Future of Smartphones is Here",
    creator: "MKBHD",
    hookScore: 91,
    retentionScore: 89,
    openLoops: 8,
    thumbnailBg: "from-slate-800 to-black",
    url: "https://youtube.com/watch?v=dummy3",
    views: "4.8M views",
  },
];

export function DashboardClient({ initialProjects, initialFiles, user }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [files, setFiles] = React.useState<ResearchFile[]>(initialFiles);

  // Search/Filters for Projects tab
  const [projectSearch, setProjectSearch] = React.useState("");
  const [projectStatusFilter, setProjectStatusFilter] = React.useState("all");

  // Search for DNA Library
  const [dnaSearch, setDnaSearch] = React.useState("");

  // Search/Filters for Research Library
  const [fileSearch, setFileSearch] = React.useState("");
  const [fileSortField, setFileSortField] = React.useState("date");

  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [projectDescription, setProjectDescription] = React.useState("");
  const [isSubmittingProject, setIsSubmittingProject] = React.useState(false);
  const [projectFormError, setProjectFormError] = React.useState<string | null>(null);

  // Video URL analysis placeholder state
  const [videoUrl, setVideoUrl] = React.useState("");
  const [isAnalyzingVideo, setIsAnalyzingVideo] = React.useState(false);
  const [analysisProgress, setAnalysisProgress] = React.useState(0);
  const [mockDnaList, setMockDnaList] = React.useState(initialMockDNALibrary);

  // Deletion loading states tracked by project ID
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Sync state if initial props change
  React.useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  React.useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectFormError(null);
    setIsSubmittingProject(true);

    if (!projectName.trim()) {
      setProjectFormError("Project name is required.");
      setIsSubmittingProject(false);
      return;
    }

    try {
      const newProject = await createProject(projectName, projectDescription);
      setProjects([newProject, ...projects]);
      setIsProjectModalOpen(false);
      setProjectName("");
      setProjectDescription("");
      
      // Auto redirect to the project detail page
      router.push(`/project/${newProject.id}`);
    } catch (err: any) {
      setProjectFormError(err.message || "Failed to create project workspace.");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this workspace? All associated research files will be permanently purged.")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
      // Re-fetch files in background to update state
      setFiles(files.filter((f) => f.project_id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim() || !videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
      alert("Please enter a valid YouTube Video URL.");
      return;
    }

    setIsAnalyzingVideo(true);
    setAnalysisProgress(15);

    // Mock interactive workflow progress
    const timer1 = setTimeout(() => setAnalysisProgress(45), 800);
    const timer2 = setTimeout(() => setAnalysisProgress(80), 1600);
    const timer3 = setTimeout(() => {
      setAnalysisProgress(100);
      
      // Seed a new analysis card in the library
      const newMockDna = {
        id: `dna-${Date.now()}`,
        title: "I Analyzed My Competitor's Video Secrets",
        creator: "Creator Insight",
        hookScore: 95,
        retentionScore: 88,
        openLoops: 9,
        thumbnailBg: "from-orange-500 to-red-600",
        url: videoUrl,
        views: "1.2M views",
      };

      setMockDnaList([newMockDna, ...mockDnaList]);
      setIsAnalyzingVideo(false);
      setIsAnalysisModalOpen(false);
      setVideoUrl("");
      setAnalysisProgress(0);

      // Redirect user to DNA Library tab to see the newly generated card
      router.push("/dashboard?tab=dna");
    }, 2400);
  };

  // Filters for recent dashboard projects
  const filteredRecentProjects = projects.filter((project) => {
    const query = projectSearch.toLowerCase();
    const matchesQuery =
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query));
    const matchesStatus =
      projectStatusFilter === "all" || project.status === projectStatusFilter;
    return matchesQuery && matchesStatus;
  });

  // DNA Library filtering
  const filteredDNALibrary = mockDnaList.filter((item) =>
    item.title.toLowerCase().includes(dnaSearch.toLowerCase()) ||
    item.creator.toLowerCase().includes(dnaSearch.toLowerCase())
  );

  // Research Library filtering and sorting
  const filteredFiles = files
    .filter((file) => file.name.toLowerCase().includes(fileSearch.toLowerCase()))
    .sort((a, b) => {
      if (fileSortField === "name") {
        return a.name.localeCompare(b.name);
      }
      if (fileSortField === "size") {
        return b.size - a.size;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      
      {/* ---------------- OVERVIEW TAB (MAIN DASHBOARD) ---------------- */}
      {activeTab === "overview" && (
        <div className="space-y-8 max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-2xl border border-[#ebbbb4]/45 bg-gradient-to-tr from-white to-[#fff0ee]/20 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 bg-[#bc0100]/15 px-3 py-1 rounded-full text-xs font-bold text-[#bc0100] border border-[#bc0100]/10">
                <Sparkles className="h-3 w-3 animate-pulse" /> AI Video Synthesis Engine
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-[#2b1613] font-display">
                Analyze Viral Videos.<br />
                Extract Storytelling DNA.<br />
                Generate Production-Ready Scripts.
              </h1>
              <p className="text-sm sm:text-base text-[#603e39] font-medium max-w-xl">
                Transform any successful YouTube video into a reusable storytelling framework, index your research, and generate retention-optimized scripts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Button
                onClick={() => setIsProjectModalOpen(true)}
                className="w-full sm:w-auto bg-[#bc0100] hover:bg-[#aa3000] text-white font-bold h-10 px-5 shadow-sm shadow-[#bc0100]/10 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-4.5 w-4.5" /> New Project
              </Button>
              <Button
                onClick={() => setIsAnalysisModalOpen(true)}
                variant="outline"
                className="w-full sm:w-auto border-[#ebbbb4]/50 bg-white hover:bg-[#ffe9e6] text-[#603e39] hover:text-[#bc0100] font-bold h-10 px-5 shadow-sm"
              >
                <Video className="h-4.5 w-4.5 mr-1" /> Analyze Video
              </Button>
            </div>
          </section>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Workspaces", value: projects.length, icon: FolderKanban, trend: "+2 this week", isUp: true },
              { label: "DNA Reports", value: mockDnaList.length, icon: Dna, trend: "+4 this week", isUp: true },
              { label: "Scripts Generated", value: 4, icon: FileCode, trend: "+1 this week", isUp: true },
              { label: "Credits Remaining", value: "85 / 100", icon: Sparkles, trend: "85% left", isUp: true },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="border-[#ebbbb4]/35 bg-white hover:shadow-md hover:border-[#ebbbb4] transition-all shadow-sm group">
                  <CardContent className="p-5 flex justify-between items-start">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#603e39]/65">{stat.label}</span>
                      <div className="text-2xl font-extrabold text-[#2b1613] font-display group-hover:text-[#bc0100] transition-colors">{stat.value}</div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>{stat.trend}</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#fff0ee] rounded-xl text-[#bc0100] border border-[#ebbbb4]/20 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-[#ebbbb4]/40 bg-white/70 shadow-sm flex flex-col justify-between p-6 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
                  <Video className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#2b1613] font-display">Analyze Viral Video</h3>
                <p className="text-xs text-[#603e39] leading-relaxed font-medium">
                  Paste a YouTube URL to deconstruct its emotional pacing and storytelling retention graph.
                </p>
              </div>
              <Button
                onClick={() => setIsAnalysisModalOpen(true)}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-9 text-xs justify-between"
              >
                Analyze Now <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>

            <Card className="border-[#ebbbb4]/40 bg-white/70 shadow-sm flex flex-col justify-between p-6 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 border border-[#ebbbb4]/30 text-[#bc0100]">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#2b1613] font-display">Create New Project</h3>
                <p className="text-xs text-[#603e39] leading-relaxed font-medium">
                  Establish a secure creator workspace environment to generate script documents.
                </p>
              </div>
              <Button
                onClick={() => setIsProjectModalOpen(true)}
                className="mt-6 w-full bg-[#bc0100] hover:bg-[#aa3000] text-white font-bold h-9 text-xs justify-between"
              >
                Create Project <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>

            <Card className="border-[#ebbbb4]/40 bg-white/70 shadow-sm flex flex-col justify-between p-6 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-[#0059ba]">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#2b1613] font-display">Upload Research</h3>
                <p className="text-xs text-[#603e39] leading-relaxed font-medium">
                  Feed outlines, references, or transcripts in PDF, DOCX, and TXT formats directly.
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard?tab=workspaces")}
                className="mt-6 w-full bg-[#0059ba] hover:bg-[#004e9c] text-white font-bold h-9 text-xs justify-between"
              >
                Upload Files <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>
          </div>

          {/* Split Recent Workspaces & Live AI Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Recent Projects */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#2b1613] font-display">Recent Projects</h2>
                {projects.length > 0 && (
                  <Link href="/dashboard?tab=workspaces" className="text-xs font-bold text-[#bc0100] hover:underline flex items-center gap-1">
                    Manage Workspaces <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {projects.length === 0 ? (
                <Card className="border-[#ebbbb4]/35 border-dashed bg-white/40 text-center p-10 flex flex-col items-center justify-center">
                  <FolderKanban className="h-10 w-10 text-[#956d67]/35 mb-3" />
                  <h4 className="text-sm font-bold text-[#2b1613]">No active projects</h4>
                  <p className="text-xs text-[#603e39]/70 max-w-xs mt-1 mb-5">Create a workspace to deconstruct transcripts and format scripts.</p>
                  <Button onClick={() => setIsProjectModalOpen(true)} className="bg-[#bc0100] hover:bg-[#aa3000] text-white font-bold text-xs h-8">
                    Get Started
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <Card key={project.id} className="border-[#ebbbb4]/30 bg-white/80 hover:bg-white transition-all shadow-sm">
                      <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <Link href={`/project/${project.id}`} className="font-bold text-[#2b1613] hover:text-[#bc0100] font-display text-sm truncate block">
                            {project.name}
                          </Link>
                          <p className="text-xs text-[#603e39] truncate max-w-md font-medium">
                            {project.description || "No description provided."}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${statusStyles[project.status] || statusStyles.Draft}`}>
                            {project.status}
                          </span>
                          <span className="text-[10px] text-[#603e39]/60 font-semibold hidden md:inline">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                          <Link href={`/project/${project.id}`}>
                            <Button variant="outline" className="border-[#ebbbb4]/40 hover:bg-[#ffe9e6] text-[#603e39] hover:text-[#bc0100] font-bold text-[11px] h-8 px-3.5">
                              Open Project
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: AI Activity Feed */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#2b1613] font-display flex items-center gap-1.5">
                <Clock className="h-5 w-5 text-[#bc0100]" /> AI Activity Feed
              </h2>

              <Card className="border-[#ebbbb4]/35 bg-white/70 p-4 shadow-sm">
                <div className="space-y-5">
                  {[
                    { text: "Analyzing competitor pacing...", status: "active", time: "Just now", label: "Video DNA" },
                    { text: "DNA Report completed successfully", status: "completed", time: "10m ago", label: "MrBeast Circle" },
                    { text: "Research transcript index compiled", status: "completed", time: "42m ago", label: "Sub-Hustle" },
                    { text: "Retention script template generated", status: "completed", time: "2h ago", label: "Smartphones" },
                    { text: "Subtitles SRT export package generated", status: "completed", time: "1d ago", label: "Ali Abdaal" },
                  ].map((act, idx) => (
                    <div key={idx} className="flex gap-3 text-xs relative">
                      {idx < 4 && <div className="absolute left-2 top-5 bottom-0 w-[1px] bg-[#ebbbb4]/20 -translate-x-1/2" />}
                      <div className="relative z-10 shrink-0 mt-0.5">
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          act.status === "active" ? "bg-orange-500 border-orange-400 text-white animate-pulse" : "bg-emerald-500 border-emerald-400 text-white"
                        }`}>
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        </div>
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-[#bc0100] uppercase tracking-wide">{act.label}</span>
                          <span className="text-[#603e39]/60 font-semibold">{act.time}</span>
                        </div>
                        <p className="text-xs text-[#2b1613] font-semibold truncate">{act.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Future Features Placeholders */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#2b1613] font-display">Algorithm Intelligence Models</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: "Competitor Analysis", desc: "Compare multiple competitor catalogs to identify content gaps." },
                { title: "Channel DNA mapping", desc: "Audit your own channel stats to find your highest retention segments." },
                { title: "Thumbnail Intelligence", desc: "Evaluate image brightness, contrast, and CTR models." },
                { title: "Title Intelligence", desc: "Test linguistic impact, search optimization, and curiosity hooks." },
              ].map((item, idx) => (
                <Card key={idx} className="border-[#ebbbb4]/25 bg-white/40 p-5 space-y-2 relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-widest text-[#bc0100] px-2 py-0.5 bg-[#fff0ee] border border-[#ebbbb4]/15 rounded-full">
                    Coming Soon
                  </div>
                  <h3 className="font-bold text-[#2b1613] text-sm font-display mt-2">{item.title}</h3>
                  <p className="text-[11px] text-[#603e39] font-medium leading-relaxed">{item.desc}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ---------------- WORKSPACES TAB ---------------- */}
      {activeTab === "workspaces" && (
        <div className="space-y-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#2b1613] font-display">Workspaces</h1>
              <p className="text-[#603e39] mt-1 font-medium">Manage and access your video projects.</p>
            </div>
            <Button
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-[#bc0100] hover:bg-[#aa3000] text-white gap-2 shadow-md shadow-[#bc0100]/10 cursor-pointer font-bold"
            >
              <Plus className="h-4.5 w-4.5" /> Create Workspace
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#956d67]" />
              <Input
                type="text"
                placeholder="Search workspaces..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-10 border-[#ebbbb4]/40 bg-white text-[#2b1613] placeholder:text-[#603e39]/30 focus-visible:ring-[#bc0100]"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#603e39] whitespace-nowrap">Status:</span>
              <select
                value={projectStatusFilter}
                onChange={(e) => setProjectStatusFilter(e.target.value)}
                className="bg-white border border-[#ebbbb4]/40 text-[#2b1613] font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#bc0100] cursor-pointer w-full sm:w-auto"
              >
                <option value="all">All States</option>
                <option value="Draft">Draft</option>
                <option value="Analyzing">Analyzing</option>
                <option value="Research Ready">Research Ready</option>
                <option value="Generating">Generating</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {filteredRecentProjects.length === 0 ? (
            <Card className="border-[#ebbbb4]/40 border-dashed bg-white/40 text-[#2b1613] p-12 text-center flex flex-col items-center justify-center">
              <FolderKanban className="h-16 w-16 text-[#956d67]/40 mb-4" />
              <h3 className="text-xl font-bold text-[#2b1613] mb-2 font-display">No workspaces found</h3>
              <p className="text-[#603e39]/70 text-sm max-w-sm font-medium mb-6">
                {projectSearch ? "Try clearing your search query or status filter." : "Start generating video outline templates by creating a workspace."}
              </p>
              {!projectSearch && (
                <Button onClick={() => setIsProjectModalOpen(true)} className="bg-[#bc0100] hover:bg-[#aa3000] text-white font-bold">
                  Create Workspace
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecentProjects.map((project) => (
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
                        className="h-8 w-8 text-[#956d67] hover:text-red-650 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
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

                  <CardContent className="p-6 pt-0 flex flex-col gap-2 text-xs text-[#603e39]/65 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#956d67]/60" />
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
        </div>
      )}

      {/* ---------------- DNA LIBRARY TAB ---------------- */}
      {activeTab === "dna" && (
        <div className="space-y-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#2b1613] font-display">DNA Library</h1>
              <p className="text-[#603e39] mt-1 font-medium">Catalog of deconstructed viral YouTube video scripts.</p>
            </div>
            <Button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="bg-[#bc0100] hover:bg-[#aa3000] text-white gap-2 shadow-md shadow-[#bc0100]/10 cursor-pointer font-bold"
            >
              <Video className="h-4.5 w-4.5" /> Analyze Video
            </Button>
          </div>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#956d67]" />
            <Input
              type="text"
              placeholder="Search DNA models..."
              value={dnaSearch}
              onChange={(e) => setDnaSearch(e.target.value)}
              className="pl-10 border-[#ebbbb4]/40 bg-white text-[#2b1613] placeholder:text-[#603e39]/30 focus-visible:ring-[#bc0100]"
            />
          </div>

          {filteredDNALibrary.length === 0 ? (
            <Card className="border-[#ebbbb4]/40 border-dashed bg-white/40 text-[#2b1613] p-12 text-center flex flex-col items-center justify-center">
              <Dna className="h-16 w-16 text-[#956d67]/40 mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-[#2b1613] mb-2 font-display">No DNA models found</h3>
              <p className="text-[#603e39]/70 text-sm max-w-sm font-medium mb-6">
                Try searching for another keyword or submit a new YouTube URL to deconstruct storytelling DNA.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDNALibrary.map((item) => (
                <Card
                  key={item.id}
                  className="border-[#ebbbb4]/30 bg-white/70 hover:bg-white hover:border-[#ebbbb4] text-[#2b1613] flex flex-col justify-between overflow-hidden shadow-sm transition-all"
                >
                  <div className={`h-40 bg-gradient-to-tr ${item.thumbnailBg} relative p-4 flex flex-col justify-between text-white`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <span className="relative z-10 self-start text-[10px] font-extrabold uppercase bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 tracking-widest">
                      {item.creator}
                    </span>
                    <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 self-center hover:scale-110 transition-transform cursor-pointer shadow-md">
                      <Play className="h-4.5 w-4.5 fill-white text-white ml-0.5" />
                    </div>
                    <span className="relative z-10 self-end text-[10px] font-semibold bg-black/50 px-2 py-0.5 rounded">
                      {item.views}
                    </span>
                  </div>

                  <CardHeader className="p-5">
                    <CardTitle className="text-base font-bold text-[#2b1613] font-display line-clamp-2 min-h-[48px]">
                      {item.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center bg-[#fff8f6] p-2.5 rounded-xl border border-[#ebbbb4]/25">
                      <div>
                        <div className="text-xs font-bold text-[#603e39]/65">Hook</div>
                        <div className="text-sm font-extrabold text-[#bc0100]">{item.hookScore}%</div>
                      </div>
                      <div className="border-x border-[#ebbbb4]/20">
                        <div className="text-xs font-bold text-[#603e39]/65">Retention</div>
                        <div className="text-sm font-extrabold text-[#0059ba]">{item.retentionScore}%</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#603e39]/65">Loops</div>
                        <div className="text-sm font-extrabold text-[#2b1613]">{item.openLoops}</div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0 mt-auto flex">
                    <Button
                      variant="outline"
                      onClick={() => alert(`DNA Report for "${item.title}" will show detailed pacing structures and timeline hook blocks.`)}
                      className="w-full border-[#ebbbb4]/40 hover:bg-[#ffe9e6] text-[#603e39] hover:text-[#bc0100] font-bold text-xs justify-between"
                    >
                      View DNA Blueprint <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- RESEARCH LIBRARY TAB ---------------- */}
      {activeTab === "research" && (
        <div className="space-y-8 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2b1613] font-display">Research Library</h1>
            <p className="text-[#603e39] mt-1 font-medium">Aggregated list of files uploaded across all workspaces.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#956d67]" />
              <Input
                type="text"
                placeholder="Search uploaded files..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className="pl-10 border-[#ebbbb4]/40 bg-white text-[#2b1613] placeholder:text-[#603e39]/30 focus-visible:ring-[#bc0100]"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#603e39] whitespace-nowrap">Sort by:</span>
              <select
                value={fileSortField}
                onChange={(e) => setFileSortField(e.target.value)}
                className="bg-white border border-[#ebbbb4]/40 text-[#2b1613] font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#bc0100] cursor-pointer w-full sm:w-auto"
              >
                <option value="date">Upload Date</option>
                <option value="name">File Name</option>
                <option value="size">File Size</option>
              </select>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <Card className="border-[#ebbbb4]/40 border-dashed bg-white/40 text-[#2b1613] p-12 text-center flex flex-col items-center justify-center">
              <FileText className="h-16 w-16 text-[#956d67]/40 mb-4" />
              <h3 className="text-xl font-bold text-[#2b1613] mb-2 font-display">No files indexed</h3>
              <p className="text-[#603e39]/70 text-sm max-w-sm font-medium">
                {fileSearch ? "No files match your search query." : "Upload PDF, DOCX, or TXT documentation inside a project workspaces."}
              </p>
            </Card>
          ) : (
            <Card className="border-[#ebbbb4]/30 bg-white/70 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ebbbb4]/30 text-[#603e39]/80 text-xs font-bold uppercase tracking-wider bg-[#fff0ee]/20">
                      <th className="p-4">File Name</th>
                      <th className="p-4">Workspace Project</th>
                      <th className="p-4 hidden sm:table-cell">Size</th>
                      <th className="p-4 hidden md:table-cell">Upload Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebbbb4]/10">
                    {filteredFiles.map((file) => {
                      const relatedProject = projects.find((p) => p.id === file.project_id);
                      return (
                        <tr
                          key={file.id}
                          className="hover:bg-[#ffe9e6]/20 text-[#603e39] text-sm font-semibold transition-colors group"
                        >
                          <td className="p-4 truncate max-w-xs sm:max-w-md">
                            <div className="flex items-center gap-2.5">
                              <FileText className="h-4.5 w-4.5 text-[#bc0100] shrink-0" />
                              <span className="font-bold text-[#2b1613] group-hover:text-[#bc0100] transition-colors truncate">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            {relatedProject ? (
                              <Link href={`/project/${relatedProject.id}`} className="hover:underline text-[#bc0100] font-bold">
                                {relatedProject.name}
                              </Link>
                            ) : (
                              <span className="text-[#603e39]/50">Unknown</span>
                            )}
                          </td>
                          <td className="p-4 hidden sm:table-cell text-xs text-[#603e39]/80">
                            {formatBytes(file.size)}
                          </td>
                          <td className="p-4 hidden md:table-cell text-xs text-[#603e39]/60">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-[#956d67]/60" />
                              <span>{new Date(file.created_at).toLocaleDateString()}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ---------------- PLACEHOLDER TABS (COMING SOON) ---------------- */}
      {(activeTab === "templates" || activeTab === "exports" || activeTab === "settings") && (
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0ee] text-[#bc0100] mx-auto border border-[#ebbbb4]/20 animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#2b1613] font-display">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
          </h2>
          <p className="text-sm text-[#603e39] max-w-sm mx-auto font-medium">
            This module is currently in active development. AI templates, subtitles exports, and customization filters are coming in the next release.
          </p>
          <div className="pt-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#bc0100] px-3 py-1 bg-[#fff0ee] border border-[#ebbbb4]/35 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
      )}

      {/* ---------------- MODALS / DIALOGS ---------------- */}

      {/* Create Project Modal */}
      <Dialog open={isProjectModalOpen}>
        <DialogContent onClose={() => setIsProjectModalOpen(false)} className="border-[#ebbbb4]/45 bg-white text-[#2b1613]">
          <DialogHeader>
            <DialogTitle className="text-[#2b1613] font-extrabold font-display text-xl">New Project Workspace</DialogTitle>
            <DialogDescription className="text-[#603e39]/80 text-xs font-semibold">
              Establish a secure workspace directory for your script generation pipelines.
            </DialogDescription>
          </DialogHeader>

          {projectFormError && (
            <div className="my-2 rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-800 font-semibold">
              {projectFormError}
            </div>
          )}

          <form onSubmit={handleCreateProject} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <label htmlFor="projectName" className="text-xs font-bold text-[#603e39] uppercase tracking-wider">
                Project Name
              </label>
              <Input
                id="projectName"
                type="text"
                placeholder="e.g. Finance Video Script"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="border-[#ebbbb4]/40 bg-[#fff8f6]/40 text-[#2b1613] focus-visible:ring-[#bc0100]"
                disabled={isSubmittingProject}
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
                placeholder="Enter workspace details..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="flex w-full rounded-md border border-[#ebbbb4]/40 bg-[#fff8f6]/40 px-3 py-2 text-sm text-[#2b1613] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#bc0100] focus-visible:border-[#ebbbb4] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmittingProject}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-[#ebbbb4]/20">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsProjectModalOpen(false)}
                className="border-[#ebbbb4]/45 text-[#603e39] hover:bg-[#ffe9e6] hover:text-[#bc0100]"
                disabled={isSubmittingProject}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#bc0100] text-white hover:bg-[#aa3000] font-bold shadow-md shadow-[#bc0100]/10"
                isLoading={isSubmittingProject}
              >
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Analyze Video URL Modal */}
      <Dialog open={isAnalysisModalOpen}>
        <DialogContent onClose={() => setIsAnalysisModalOpen(false)} className="border-[#ebbbb4]/45 bg-white text-[#2b1613]">
          <DialogHeader>
            <DialogTitle className="text-[#2b1613] font-extrabold font-display text-xl">Analyze Viral Video</DialogTitle>
            <DialogDescription className="text-[#603e39]/80 text-xs font-semibold">
              Enter any YouTube URL to begin extraction of retention pacing graphs and hook logic.
            </DialogDescription>
          </DialogHeader>

          {isAnalyzingVideo ? (
            <div className="py-8 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0ee] text-[#bc0100] mx-auto border border-[#ebbbb4]/20 animate-spin">
                <Dna className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2b1613] font-display">Extracting Storytelling DNA...</h4>
                <p className="text-xs text-[#603e39] mt-0.5">This takes 2-3 seconds. Pacing hooks and loops are being analyzed.</p>
              </div>
              <div className="w-full max-w-xs bg-[#fff8f6] rounded-full h-1.5 overflow-hidden border border-[#ebbbb4]/20 mx-auto">
                <div
                  className="bg-gradient-to-r from-[#FF0000] to-[#FF6B00] h-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleRunAnalysis} className="space-y-4 my-2">
              <div className="space-y-1.5">
                <label htmlFor="videoUrl" className="text-xs font-bold text-[#603e39] uppercase tracking-wider">
                  YouTube Video URL
                </label>
                <Input
                  id="videoUrl"
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="border-[#ebbbb4]/40 bg-[#fff8f6]/40 text-[#2b1613] focus-visible:ring-[#bc0100]"
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-[#ebbbb4]/20">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAnalysisModalOpen(false)}
                  className="border-[#ebbbb4]/45 text-[#603e39] hover:bg-[#ffe9e6] hover:text-[#bc0100]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/10"
                >
                  Analyze Video
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
