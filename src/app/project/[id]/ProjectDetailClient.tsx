"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  FolderKanban,
  UploadCloud,
  File,
  Download,
  Trash2,
  Calendar,
  HardDrive,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Save,
  FileText,
  Dna,
  FileSpreadsheet,
  Video,
  ExternalLink,
  ChevronDown,
  Sparkles,
  LayoutTemplate,
  FileCode,
  Share2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateProjectStatus,
  updateProjectDetails,
  registerResearchFile,
  deleteResearchFile,
} from "../actions";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  storage_path: string;
  created_at: string;
}

interface ProjectDetailClientProps {
  project: Project;
  initialFiles: FileMetadata[];
}

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const statusOptions = [
  "Draft",
  "Analyzing",
  "Research Ready",
  "Generating",
  "Completed",
  "Failed",
];

const statusStyles: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  Analyzing: "bg-purple-50 text-purple-700 border-purple-200",
  "Research Ready": "bg-emerald-50 text-emerald-750 border-emerald-200",
  Generating: "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-[#fff0ee] text-[#bc0100] border-[#ebbbb4]/40",
  Failed: "bg-red-50 text-red-750 border-red-200",
};

export function ProjectDetailClient({ project: initialProject, initialFiles }: ProjectDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [project, setProject] = React.useState<Project>(initialProject);
  const [files, setFiles] = React.useState<FileMetadata[]>(initialFiles);
  const [activeTab, setActiveTab] = React.useState("overview");

  // Edit states for Overview
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(project.name);
  const [editDesc, setEditDesc] = React.useState(project.description || "");
  const [isSavingDetails, setIsSavingDetails] = React.useState(false);
  const [detailsError, setDetailsError] = React.useState<string | null>(null);

  // Status picker state
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  // Upload States
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadingFile, setUploadingFile] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState<string | null>(null);

  // File action states
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setProject(initialProject);
    setEditName(initialProject.name);
    setEditDesc(initialProject.description || "");
  }, [initialProject]);

  React.useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsError(null);
    setIsSavingDetails(true);

    if (!editName.trim()) {
      setDetailsError("Workspace name is required.");
      setIsSavingDetails(false);
      return;
    }

    try {
      const updated = await updateProjectDetails(project.id, editName, editDesc);
      setProject(updated);
      setIsEditing(false);
    } catch (err: any) {
      setDetailsError(err.message || "Failed to update details.");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateProjectStatus(project.id, newStatus);
      setProject(updated);
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);
    setUploadSuccess(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      await uploadFile(droppedFiles[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await uploadFile(selectedFiles[0]);
    }
  };

  const uploadFile = async (file: globalThis.File) => {
    // PDF, DOCX, and TXT only
    const allowedExtensions = ["pdf", "docx", "txt"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(fileExtension)) {
      setUploadError("Invalid file type. Only PDF, DOCX, and TXT uploads are supported.");
      return;
    }

    // 50MB Size Constraint
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File exceeds the 50MB size limit.");
      return;
    }

    setUploadingFile(file.name);
    setUploadProgress(10);

    try {
      // Get current authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to upload research documents.");
      }

      setUploadProgress(30);

      // Path format: research-files/{user-id}/{project-id}/{timestamp}-{filename}
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${user.id}/${project.id}/${Date.now()}-${sanitizedName}`;

      const { error: storageError } = await supabase.storage
        .from("research-files")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        throw new Error(storageError.message);
      }

      setUploadProgress(70);

      // Save to database
      const dbRecord = await registerResearchFile(
        project.id,
        file.name,
        file.size,
        file.type,
        storagePath
      );

      setFiles([dbRecord, ...files]);
      setUploadSuccess(`Successfully uploaded "${file.name}"`);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file.");
    } finally {
      setUploadingFile(null);
      setUploadProgress(0);
      const fileInput = document.getElementById("file-upload-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleDownload = async (file: FileMetadata) => {
    setDownloadingId(file.id);
    try {
      const { data, error } = await supabase.storage
        .from("research-files")
        .createSignedUrl(file.storage_path, 60);

      if (error) {
        throw new Error(error.message);
      }

      if (data?.signedUrl) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = file.name;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      alert(err.message || "Failed to generate download link.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteFile = async (file: FileMetadata) => {
    if (!confirm(`Are you sure you want to permanently delete "${file.name}"?`)) {
      return;
    }

    setDeletingId(file.id);
    try {
      await deleteResearchFile(file.id, file.storage_path, project.id);
      setFiles(files.filter((f) => f.id !== file.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete file.");
    } finally {
      setDeletingId(null);
    }
  };

  const tabList = [
    { id: "overview", label: "Overview", icon: FolderKanban },
    { id: "research", label: "Research", icon: FileText },
    { id: "dna", label: "DNA Report", icon: Dna },
    { id: "blueprint", label: "Blueprint", icon: LayoutTemplate },
    { id: "script", label: "Script", icon: FileCode },
    { id: "thumbnail", label: "Thumbnail Ideas", icon: Sparkles },
    { id: "title", label: "Title Ideas", icon: Sparkles },
    { id: "exports", label: "Exports", icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#2b1613] relative overflow-hidden flex flex-col">
      <div className="grid-pattern" />
      <div className="noise-bg" />

      {/* Persistent Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#ebbbb4]/40 px-4 md:px-8 py-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#603e39] hover:bg-[#ffe9e6]/50 hover:text-[#bc0100] rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#603e39]/60 font-bold uppercase tracking-wider hidden sm:flex">
            <span>Workspaces</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <span className="font-extrabold text-[#2b1613] truncate font-display text-lg">
            {project.name}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-bold uppercase tracking-wide ml-2 ${statusStyles[project.status] || statusStyles.Draft}`}>
            {project.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" className="border-[#ebbbb4]/40 bg-white hover:bg-[#ffe9e6] hover:text-[#bc0100] text-[#603e39] font-bold text-xs h-9 px-4">
              Dashboard Hub
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6 relative z-10">
        
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-[#ebbbb4]/30 overflow-x-auto gap-2 md:gap-4 no-scrollbar">
          {tabList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[#bc0100] text-[#bc0100]"
                    : "border-transparent text-[#603e39]/65 hover:text-[#bc0100] hover:border-[#ebbbb4]/40"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#bc0100]" : "text-[#956d67]/60"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Workspace Active Tab Content View */}
        <div className="flex-1">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Project metadata details */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-[#ebbbb4]/40 bg-white/90 backdrop-blur-md shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-[#ebbbb4]/20 pb-4">
                    <div>
                      <CardTitle className="text-xl font-bold font-display text-[#2b1613]">Workspace Details</CardTitle>
                      <CardDescription className="text-[#603e39] font-medium text-xs">Configure your project metadata and identifiers.</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="border-[#ebbbb4]/40 text-[#603e39] hover:bg-[#ffe9e6] hover:text-[#bc0100] font-bold text-xs h-9 px-3 gap-1.5"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit Details
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    {detailsError && (
                      <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-red-850 font-semibold">
                        {detailsError}
                      </div>
                    )}

                    {isEditing ? (
                      <form onSubmit={handleSaveDetails} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#603e39] uppercase tracking-wider">Workspace Name</label>
                          <Input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border-[#ebbbb4]/40 bg-[#fff8f6]/40 text-[#2b1613] focus-visible:ring-[#bc0100] focus-visible:border-[#ebbbb4]"
                            disabled={isSavingDetails}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#603e39] uppercase tracking-wider">Description</label>
                          <textarea
                            rows={4}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="flex w-full rounded-md border border-[#ebbbb4]/40 bg-[#fff8f6]/40 px-3 py-2 text-sm text-[#2b1613] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#bc0100] focus-visible:border-[#ebbbb4] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isSavingDetails}
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setEditName(project.name);
                              setEditDesc(project.description || "");
                              setIsEditing(false);
                            }}
                            className="border-[#ebbbb4]/40 text-[#603e39] hover:bg-[#ffe9e6] hover:text-[#bc0100] text-xs h-9 px-4"
                            disabled={isSavingDetails}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-[#bc0100] hover:bg-[#aa3000] text-white font-bold text-xs h-9 px-4 gap-1.5"
                            isLoading={isSavingDetails}
                          >
                            <Save className="h-3.5 w-3.5" /> Save Changes
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-5">
                        <div>
                          <h4 className="text-xs font-bold text-[#603e39]/60 uppercase tracking-wider mb-1">Name</h4>
                          <p className="text-base font-bold text-[#2b1613]">{project.name}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#603e39]/60 uppercase tracking-wider mb-1">Description</h4>
                          <p className="text-sm font-medium text-[#603e39] whitespace-pre-wrap leading-relaxed">
                            {project.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Status updates & settings */}
              <div className="space-y-6">
                <Card className="border-[#ebbbb4]/40 bg-white/90 backdrop-blur-md shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-[#2b1613] font-display text-base">Pipeline Status</h3>
                      <p className="text-xs text-[#603e39]/80 mt-1 font-semibold">Track and update the workspace synthesis stage.</p>
                    </div>

                    <div className="relative">
                      <select
                        value={project.status}
                        onChange={handleStatusChange}
                        disabled={isUpdatingStatus}
                        className="w-full bg-[#fff8f6] border border-[#ebbbb4]/40 text-[#2b1613] font-bold text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#bc0100] appearance-none cursor-pointer"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-[#956d67] pointer-events-none" />
                    </div>

                    <div className="h-[1px] bg-[#ebbbb4]/20" />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-[#603e39] font-bold">
                        <span>Creation Date</span>
                        <span className="text-[#2b1613] font-extrabold">{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-[#603e39] font-bold">
                        <span>Research Files</span>
                        <span className="text-[#2b1613] font-extrabold">{files.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-[#603e39] font-bold">
                        <span>Total Size</span>
                        <span className="text-[#2b1613] font-extrabold">
                          {formatBytes(files.reduce((acc, curr) => acc + curr.size, 0))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "research" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Drag & Drop Uploader */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#2b1613] font-display">Upload Documents</h2>
                  <p className="text-xs text-[#603e39] mt-1 font-semibold">Feed your workspace project with text and PDF documentation.</p>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer min-h-[260px] ${
                    isDragging
                      ? "border-[#bc0100] bg-[#ffe9e6]/40 shadow-sm"
                      : "border-[#ebbbb4]/40 bg-white/60 hover:border-[#bc0100]/40 hover:bg-[#ffe9e6]/20"
                  }`}
                  onClick={() => document.getElementById("file-upload-input")?.click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={!!uploadingFile}
                  />

                  <UploadCloud className={`h-12 w-12 mb-4 transition-transform duration-300 ${
                    isDragging ? "text-[#bc0100] scale-110" : "text-[#956d67]/60 group-hover:text-[#bc0100] group-hover:-translate-y-1"
                  }`} />

                  <p className="text-sm font-bold text-[#2b1613]">Drag & Drop files here</p>
                  <p className="text-xs text-[#603e39] mt-1 font-medium">or click to browse from device</p>
                  
                  <p className="text-[10px] text-[#603e39]/50 mt-6 font-bold uppercase tracking-wide">
                    Supported: PDF, DOCX, TXT (Max 50MB)
                  </p>
                </div>

                {uploadingFile && (
                  <Card className="border-[#ebbbb4]/40 bg-white/80 p-4 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#603e39]">
                      <span className="truncate max-w-[200px]">Uploading: {uploadingFile}</span>
                      <span className="text-[#bc0100] font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#fff8f6] rounded-full h-1.5 overflow-hidden border border-[#ebbbb4]/20">
                      <div
                        className="bg-[#bc0100] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </Card>
                )}

                {uploadError && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-850 shadow-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-650 mt-0.5" />
                    <p className="leading-tight font-semibold">{uploadError}</p>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-850 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-650 mt-0.5" />
                    <p className="leading-tight font-semibold">{uploadSuccess}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Files table listing */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[#2b1613] font-display">Research Files ({files.length})</h2>
                  <div className="flex items-center gap-1.5 text-xs text-[#603e39] font-bold">
                    <HardDrive className="h-3.5 w-3.5 text-[#956d67]" />
                    <span>Total storage: {formatBytes(files.reduce((acc, curr) => acc + curr.size, 0))}</span>
                  </div>
                </div>

                {files.length === 0 ? (
                  <Card className="border-[#ebbbb4]/40 border-dashed bg-white/40 text-[#2b1613] p-12 text-center flex flex-col items-center justify-center">
                    <File className="h-16 w-16 text-[#956d67]/40 mb-4" />
                    <h3 className="text-lg font-bold text-[#2b1613] mb-1 font-display">No research materials uploaded</h3>
                    <p className="text-[#603e39]/70 text-sm max-w-xs font-semibold">
                      Feed document outlines, articles, or transcripts to enable deconstruction reports.
                    </p>
                  </Card>
                ) : (
                  <Card className="border-[#ebbbb4]/30 bg-white/70 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#ebbbb4]/30 text-[#603e39]/80 text-xs font-bold uppercase tracking-wider bg-[#fff0ee]/20">
                            <th className="p-4">File Name</th>
                            <th className="p-4 hidden sm:table-cell">Size</th>
                            <th className="p-4 hidden md:table-cell">Uploaded</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebbbb4]/10">
                          {files.map((file) => (
                            <tr
                              key={file.id}
                              className="hover:bg-[#ffe9e6]/20 text-[#603e39] text-sm group transition-colors font-semibold"
                            >
                              <td className="p-4 max-w-[200px] sm:max-w-xs truncate">
                                <div className="flex items-center gap-2.5">
                                  <File className="h-4.5 w-4.5 text-[#bc0100] shrink-0" />
                                  <span className="font-bold text-[#2b1613] group-hover:text-[#bc0100] transition-colors truncate font-display">
                                    {file.name}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 hidden sm:table-cell text-xs font-bold text-[#603e39]/75">
                                {formatBytes(file.size)}
                              </td>
                              <td className="p-4 hidden md:table-cell text-xs text-[#603e39]/60">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDownload(file)}
                                    className="h-8 w-8 text-[#956d67] hover:text-[#bc0100] hover:bg-[#ffe9e6] rounded-md cursor-pointer transition-colors"
                                    disabled={downloadingId === file.id}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteFile(file)}
                                    className="h-8 w-8 text-[#956d67] hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                                    disabled={deletingId === file.id}
                                    isLoading={deletingId === file.id}
                                  >
                                    {deletingId !== file.id && <Trash2 className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "dna" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2b1613] font-display flex items-center gap-2">
                    <Dna className="h-6 w-6 text-[#bc0100] animate-pulse" /> Viral DNA Analysis
                  </h2>
                  <p className="text-sm text-[#603e39] font-medium">Deconstructed structure and behavioral logic model of references.</p>
                </div>
                <Button className="bg-[#bc0100] hover:bg-[#aa3000] text-white font-bold text-xs gap-1.5 shadow-md shadow-[#bc0100]/10">
                  <Sparkles className="h-3.5 w-3.5 animate-bounce" /> Run Analysis
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-[#ebbbb4]/40 bg-white/70 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#603e39]/65">Retention Dynamics</span>
                    <span className="text-xs font-bold text-[#bc0100] px-2 py-0.5 bg-[#fff0ee] border border-[#ebbbb4]/20 rounded-full">Inactive</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[#ffe9e6]/50 rounded-full w-3/4" />
                    <div className="h-2 bg-[#ffe9e6]/50 rounded-full w-5/6" />
                    <div className="h-2 bg-[#ffe9e6]/50 rounded-full w-2/3" />
                  </div>
                  <p className="text-xs text-[#603e39] leading-relaxed">
                    Once documents are loaded and analyzed, this visual curve displays projected retention dropoffs and hook opportunities.
                  </p>
                </Card>

                <Card className="border-[#ebbbb4]/40 bg-white/70 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#603e39]/65">Hook Optimization</span>
                    <span className="text-xs font-bold text-[#0059ba] px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full">Pending</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[#ffe9e6]/30 rounded w-full" />
                    <div className="h-4 bg-[#ffe9e6]/30 rounded w-11/12" />
                  </div>
                  <p className="text-xs text-[#603e39] leading-relaxed">
                    Identifies key psychological openings from references to capture user attention within the crucial first 3 seconds.
                  </p>
                </Card>

                <Card className="border-[#ebbbb4]/40 bg-white/70 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#603e39]/65">Cadence & Pacing</span>
                    <span className="text-xs font-bold text-[#aa3000] px-2 py-0.5 bg-orange-50 border border-orange-100 rounded-full">Awaiting Data</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 bg-[#ffe9e6]/40 rounded-full w-2/5" />
                    <div className="h-2.5 bg-[#ffe9e6]/40 rounded-full w-3/5" />
                  </div>
                  <p className="text-xs text-[#603e39] leading-relaxed">
                    Measures verbal tempo, sound effects, visual pacing, and narrative blocks deconstructed from viral patterns.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "blueprint" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2b1613] font-display flex items-center gap-2">
                    <LayoutTemplate className="h-6 w-6 text-[#bc0100]" /> Video Blueprint Editor
                  </h2>
                  <p className="text-sm text-[#603e39] font-medium">Configure sections, beats, visual cues, and outline anchors.</p>
                </div>
                <Button className="bg-[#bc0100] hover:bg-[#aa3000] text-white font-bold text-xs gap-1.5 shadow-md shadow-[#bc0100]/10">
                  Generate Outline
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="border-[#ebbbb4]/40 bg-white/70 p-5 col-span-3 space-y-4">
                  <h3 className="font-bold text-sm text-[#2b1613]">Structural Outlines</h3>
                  <div className="border border-[#ebbbb4]/20 rounded-lg p-8 text-center text-xs text-[#603e39]/70 font-semibold bg-[#fff8f6]/30">
                    No structural blueprint generated yet. Run the DNA Analysis to automatically layout video narrative anchors.
                  </div>
                </Card>

                <Card className="border-[#ebbbb4]/40 bg-white/70 p-5 space-y-4 h-fit">
                  <h3 className="font-bold text-sm text-[#2b1613]">Cadence Controls</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-[#603e39] font-bold mb-1">
                        <span>Target Duration</span>
                        <span>8m 30s</span>
                      </div>
                      <div className="w-full bg-[#fff8f6] h-1.5 rounded-full overflow-hidden border border-[#ebbbb4]/20">
                        <div className="bg-[#bc0100] w-2/3 h-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#603e39] font-bold mb-1">
                        <span>Pacing Velocity</span>
                        <span>Moderate</span>
                      </div>
                      <div className="w-full bg-[#fff8f6] h-1.5 rounded-full overflow-hidden border border-[#ebbbb4]/20">
                        <div className="bg-[#bc0100] w-1/2 h-full" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "script" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2b1613] font-display flex items-center gap-2">
                    <FileCode className="h-6 w-6 text-[#bc0100]" /> Script Builder
                  </h2>
                  <p className="text-sm text-[#603e39] font-medium">Dual-column script editor with narrative and visual directions.</p>
                </div>
                <Button className="bg-[#bc0100] hover:bg-[#aa3000] text-white font-bold text-xs gap-1.5 shadow-md shadow-[#bc0100]/10">
                  Compose Script
                </Button>
              </div>

              <div className="border border-[#ebbbb4]/35 bg-white/75 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0ee] text-[#bc0100] mx-auto">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-[#2b1613] text-lg font-display">Script Editor Awaiting Blueprint</h3>
                <p className="text-xs text-[#603e39] max-w-sm mx-auto leading-relaxed">
                  Generate the outline blueprint first. The Script editor lets you write visuals on the left and voiceovers on the right.
                </p>
              </div>
            </div>
          )}

          {activeTab === "thumbnail" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2b1613] font-display flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-[#bc0100] animate-pulse" /> Thumbnail Intelligence
                  </h2>
                  <p className="text-sm text-[#603e39] font-medium">AI generated thumbnail ideas, concepts, and CTR predictions.</p>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-extrabold uppercase tracking-widest text-[#bc0100] px-2.5 py-1 bg-[#fff0ee] border border-[#ebbbb4]/25 rounded-full">
                  Coming Soon
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Story-Driven Split Concept", desc: "Before vs After split composition with high contrast elements.", ctr: "Expected CTR: 8.4%" },
                  { title: "Extreme Close-Up Expression", desc: "De-saturated background with hyper-detailed emotional focus.", ctr: "Expected CTR: 7.9%" },
                  { title: "Curiosity Loop Visual", desc: "Revealing an unexpected object partially hidden behind a red circle.", ctr: "Expected CTR: 9.1%" }
                ].map((idea, idx) => (
                  <Card key={idx} className="border-[#ebbbb4]/35 bg-white/70 p-5 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="h-32 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border border-[#ebbbb4]/15">
                      <Sparkles className="h-8 w-8 text-[#956d67]/40 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-[#2b1613] font-display text-sm">{idea.title}</h3>
                      <p className="text-xs text-[#603e39] leading-relaxed font-medium">{idea.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-[#ebbbb4]/10 flex justify-between items-center text-[10px] font-extrabold text-[#bc0100] uppercase tracking-wide">
                      <span>{idea.ctr}</span>
                      <span className="px-2 py-0.5 bg-[#fff0ee] rounded">Draft</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "title" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2b1613] font-display flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-[#bc0100] animate-pulse" /> Title Hook Generator
                  </h2>
                  <p className="text-sm text-[#603e39] font-medium">Linguistic curiosity loops, search optimization, and impact scores.</p>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-extrabold uppercase tracking-widest text-[#bc0100] px-2.5 py-1 bg-[#fff0ee] border border-[#ebbbb4]/25 rounded-full">
                  Coming Soon
                </span>
              </div>

              <div className="space-y-4 max-w-3xl">
                {[
                  { title: "I Survived 100 Days In A Circle (Standard)", score: 98, type: "Curiosity Loop" },
                  { title: "Why Nobody Survives This 100 Day Circle Challenge", score: 92, type: "Fear of Missing Out" },
                  { title: "100 Days. 1 Circle. $500,000.", score: 95, type: "Extreme Stakes" }
                ].map((idea, idx) => (
                  <Card key={idx} className="border-[#ebbbb4]/30 bg-white/80 p-4 hover:bg-white transition-all shadow-sm flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-[#0059ba] uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                        {idea.type}
                      </span>
                      <p className="font-bold text-[#2b1613] font-display text-sm">{idea.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-bold text-[#603e39]/60 uppercase">Impact Score</div>
                      <div className="text-lg font-extrabold text-[#bc0100] font-display">{idea.score}%</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "exports" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-[#2b1613] font-display flex items-center gap-2">
                  <Share2 className="h-6 w-6 text-[#bc0100]" /> Share & Export
                </h2>
                <p className="text-sm text-[#603e39] font-medium">Export formats, transcript metadata, SRT subtitles, and script templates.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                {[
                  { title: "Visual Storyboard", desc: "Download PDF formatted visual cues and frame breakdowns.", format: "PDF Outline" },
                  { title: "Teleprompter Script", desc: "Export plain text formatted voiceover block for direct prompter injection.", format: "TXT File" },
                  { title: "Algorithm Metadata", desc: "Download tags, video descriptions, and CTR title models.", format: "JSON Package" },
                ].map((item) => (
                  <Card key={item.title} className="border-[#ebbbb4]/40 bg-white/80 p-5 flex flex-col justify-between shadow-sm">
                    <div className="space-y-2">
                      <h3 className="font-bold text-[#2b1613] font-display text-sm">{item.title}</h3>
                      <p className="text-xs text-[#603e39] leading-relaxed">{item.desc}</p>
                    </div>
                    <Button variant="outline" className="border-[#ebbbb4]/40 hover:bg-[#ffe9e6] hover:text-[#bc0100] text-[#603e39] text-xs font-bold w-full mt-4 justify-between">
                      Export {item.format} <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
