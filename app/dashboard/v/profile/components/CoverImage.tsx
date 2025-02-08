"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateProfile } from "../../actions/users";
import { uploadFile } from "../../actions/uploads";
import { toast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

export function CoverImage({
  url,
  isEditable,
  userId,
}: {
  url?: string;
  isEditable: boolean;
  userId: string;
}) {
  const [coverImage, setCoverImage] =
    useState(url || "");

  return (
    <div className="relative h-48 bg-muted">
      {coverImage && (
        <img
          src={
            coverImage ||
            "/placeholder.svg"
          }
          alt="Cover"
          className="w-full h-full object-cover"
        />
      )}
      {isEditable && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={async () => {
              const file =
                await new Promise<File | null>(
                  (resolve) => {
                    const input =
                      document.createElement(
                        "input"
                      );
                    input.type = "file";
                    input.accept =
                      "image/*";
                    input.onchange = (
                      e
                    ) =>
                      resolve(
                        (
                          e.target as HTMLInputElement
                        ).files?.[0] ||
                          null
                      );
                    input.click();
                  }
                );

              if (file) {
                try {
                  const formData =
                    new FormData();
                  formData.append(
                    "file",
                    file
                  );
                  formData.append(
                    "path",
                    `media/cover-images/${userId}/${file.name}`
                  );
                  const result =
                    await uploadFile(
                      formData
                    );
                  if (
                    result.success &&
                    result.url
                  ) {
                    const updateResult =
                      await updateProfile(
                        userId,
                        {
                          cover_image_url:
                            result.url,
                        }
                      );
                    if (
                      updateResult.success
                    ) {
                      setCoverImage(
                        result.url
                      );
                      toast({
                        title:
                          "Cover image updated successfully!",
                      });
                    } else {
                      throw new Error(
                        updateResult.error
                      );
                    }
                  } else {
                    throw new Error(
                      result.error ||
                        "Failed to upload image"
                    );
                  }
                } catch (error) {
                  console.error(
                    "Error uploading cover image:",
                    error
                  );
                  toast({
                    title:
                      "Error uploading cover image",
                    variant:
                      "destructive",
                  });
                }
              }
            }}
            className="transition-colors duration-200  "
          >
            <Upload className="mr-2 w-4 " />
            Change Cover
          </Button>
        </div>
      )}
    </div>
  );
}
