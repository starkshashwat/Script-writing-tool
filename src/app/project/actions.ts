"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  return data[0];
}

export async function updateProjectDetails(projectId: string, name: string, description: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ name, description })
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  return data[0];
}

export async function registerResearchFile(
  projectId: string,
  name: string,
  size: number,
  type: string,
  storagePath: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("research_files")
    .insert([
      { project_id: projectId, name, size, type, storage_path: storagePath },
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/project/${projectId}`);
  return data[0];
}

export async function deleteResearchFile(fileId: string, storagePath: string, projectId: string) {
  const supabase = await createClient();

  // Remove physical storage item from bucket
  const { error: storageError } = await supabase.storage
    .from("research-files")
    .remove([storagePath]);

  if (storageError) {
    console.error("Storage error warning:", storageError.message);
  }

  // Delete database record
  const { error } = await supabase
    .from("research_files")
    .delete()
    .eq("id", fileId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/project/${projectId}`);
}
