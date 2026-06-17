"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(name: string, description: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      { name, description, user_id: user.id },
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  return data[0];
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch files in the project to clean up physical storage
  const { data: files } = await supabase
    .from("files")
    .select("storage_path")
    .eq("project_id", projectId);

  if (files && files.length > 0) {
    const filePaths = files.map((f) => f.storage_path);
    const { error: storageError } = await supabase.storage
      .from("research-files")
      .remove(filePaths);

    if (storageError) {
      console.error("Storage delete warning:", storageError.message);
    }
  }

  // Delete project (cascades database files deletion)
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

export async function registerUploadedFile(
  projectId: string,
  name: string,
  size: number,
  type: string,
  storagePath: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("files")
    .insert([
      { project_id: projectId, name, size, type, storage_path: storagePath },
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard");
  return data[0];
}

export async function deleteFileRecord(fileId: string, storagePath: string, projectId: string) {
  const supabase = await createClient();

  // Remove physical storage item
  const { error: storageError } = await supabase.storage
    .from("research-files")
    .remove([storagePath]);

  if (storageError) {
    console.error("Storage error warning:", storageError.message);
  }

  // Delete DB entry
  const { error } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard");
}
