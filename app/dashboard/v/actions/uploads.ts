"use server"

import { createClient } from "@/utils/supabase/server"

export async function uploadFile(formData: FormData) {
  const supabase = createClient()

  const file = formData.get("file") as File
  const path = formData.get("path") as string

  if (!file || !path) {
    return { success: false, error: "Missing file or path" }
  }

  try {
    const { data, error } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Supabase storage error:", error)
      return { success: false, error: `Failed to upload file: ${error.message}` }
    }

    const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(data.path)

    return { success: true, url: publicUrl.publicUrl }
  } catch (error) {
    console.error("Unexpected error during file upload:", error)
    return { success: false, error: `Unexpected error: ${(error as Error).message}` }
  }
}

