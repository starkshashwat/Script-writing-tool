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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { registerUploadedFile, deleteFileRecord } from "../actions";

interface Project {
  id: string;
  name: string;
  description: string | null;
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

export function ProjectDetailClient({ project, initialFiles }: ProjectDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [files, setFiles] = React.useState<FileMetadata[]>(initialFiles);
  
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
    setFiles(initialFiles);
  }, [initialFiles]);

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
    // 50MB Size Constraint
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File exceeds the 50MB size limit.");
      return;
    }

    setUploadingFile(file.name);
    setUploadProgress(10); // Start state indicator

    try {
      // Get current authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to upload video reference files.");
      }

      setUploadProgress(30);

      // Construct a safe, collision-free storage path: user_id/project_id/timestamp-filename
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${user.id}/${project.id}/${Date.now()}-${sanitizedName}`;

      // Upload file directly to Supabase Storage
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

      // Register file metadata record in database
      const dbRecord = await registerUploadedFile(
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
      // Reset input element
      const fileInput = document.getElementById("file-upload-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleDownload = async (file: FileMetadata) => {
    setDownloadingId(file.id);
    try {
      // Secure Signed URL creation (valid for 60 seconds)
      const { data, error } = await supabase.storage
        .from("research-files")
        .createSignedUrl(file.storage_path, 60);

      if (error) {
        throw new Error(error.message);
      }

      if (data?.signedUrl) {
        // Trigger browser download link open
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = file.name;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      alert(err.message || "Failed to generate download URL.");
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
      await deleteFileRecord(file.id, file.storage_path, project.id);
      setFiles(files.filter((f) => f.id !== file.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete file.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#603e39]/60 uppercase tracking-wider">
          <Link href="/dashboard" className="hover:text-[#bc0100] transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#956d67]/40" />
          <Link href="/dashboard/projects" className="hover:text-[#bc0100] transition-colors">Workspaces</Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#956d67]/40" />
          <span className="text-[#603e39] truncate max-w-xs">{project.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2b1613] flex items-center gap-2.5 font-display">
              <FolderKanban className="h-7 w-7 text-[#bc0100]" />
              {project.name}
            </h1>
            <p className="text-[#603e39] font-medium max-w-2xl">{project.description || "No description provided."}</p>
          </div>
          <Link href="/dashboard/projects">
            <Button variant="outline" className="border-[#ebbbb4]/40 bg-white hover:bg-[#ffe9e6] text-[#603e39] hover:text-[#bc0100] font-bold gap-2 shadow-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Workspaces
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: File Upload Dropzone */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#2b1613] font-display">Upload Video Assets</h2>
          
          {/* Dropzone Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer min-h-[260px] ${
              isDragging
                ? "border-[#bc0100] bg-[#ffe9e6]/40 shadow-sm shadow-[#bc0100]/10"
                : "border-[#ebbbb4]/40 bg-white/60 hover:border-[#bc0100]/40 hover:bg-[#ffe9e6]/20"
            }`}
            onClick={() => document.getElementById("file-upload-input")?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              disabled={!!uploadingFile}
            />
            
            <UploadCloud className={`h-12 w-12 mb-4 transition-transform duration-300 ${
              isDragging ? "text-[#bc0100] scale-110" : "text-[#956d67]/60 group-hover:text-[#bc0100] group-hover:-translate-y-1"
            }`} />
            
            <p className="text-sm font-bold text-[#2b1613]">
              Drag & Drop file here
            </p>
            <p className="text-xs text-[#603e39] mt-1 font-medium">
              or click to browse from device
            </p>
            
            <p className="text-[10px] text-[#603e39]/50 mt-6 font-bold uppercase tracking-wide">
              Max file size: 50MB (MP4, CSV, TXT, PDF, etc.)
            </p>
          </div>

          {/* Upload Status Panels */}
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
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-850 shadow-sm animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-650 mt-0.5" />
              <p className="leading-tight font-semibold">{uploadError}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-850 shadow-sm animate-in fade-in duration-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-650 mt-0.5" />
              <p className="leading-tight font-semibold">{uploadSuccess}</p>
            </div>
          )}
        </div>

        {/* Right Column: Files List Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#2b1613] font-display">Workspace Files ({files.length})</h2>
            <div className="flex items-center gap-1.5 text-xs text-[#603e39] font-semibold">
              <HardDrive className="h-3.5 w-3.5 text-[#956d67]" />
              <span>
                Total size:{" "}
                {formatBytes(files.reduce((acc, curr) => acc + curr.size, 0))}
              </span>
            </div>
          </div>

          {files.length === 0 ? (
            <Card className="border-[#ebbbb4]/40 border-dashed bg-white/40 text-[#2b1613] p-12 text-center flex flex-col items-center justify-center">
              <File className="h-16 w-16 text-[#956d67]/40 mb-4" />
              <h3 className="text-lg font-bold text-[#2b1613] mb-1 font-display">No files uploaded</h3>
              <p className="text-[#603e39]/70 text-sm max-w-xs font-medium">
                Drag a strategy or video document into the zone on the left to start organizing your files.
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
                        className="hover:bg-[#ffe9e6]/20 text-[#603e39] text-sm group transition-colors font-medium"
                      >
                        <td className="p-4 max-w-[200px] sm:max-w-xs truncate">
                          <div className="flex items-center gap-2.5">
                            <File className="h-4.5 w-4.5 text-[#bc0100] shrink-0" />
                            <span className="font-bold text-[#2b1613] group-hover:text-[#bc0100] transition-colors truncate font-display">
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-xs font-bold text-[#603e39]/70">
                          {formatBytes(file.size)}
                        </td>
                        <td className="p-4 hidden md:table-cell text-xs text-[#603e39]/60">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(file.created_at).toLocaleDateString()}
                            </span>
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
    </div>
  );
}
