"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

type ImageEditorProps = {
  image: string
  onSave: (editedImage: string) => void
  aspectRatio?: number
}

const ImageEditor: React.FC<ImageEditorProps> = ({ image, onSave, aspectRatio = 1 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, 0)
      if (croppedImage) {
        onSave(croppedImage)
      } else {
        throw new Error("Failed to crop image")
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Failed to crop image", variant: "destructive" })
    }
  }, [croppedAreaPixels, onSave, image])

  return (
    <div className="flex flex-col items-center">
      <div className="h-[300px] w-full relative mb-4">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <Button onClick={showCroppedImage} className="w-full">
        Save
      </Button>
    </div>
  )
}

export default ImageEditor

async function getCroppedImg(imageSrc: string, pixelCrop: any, rotation = 0): Promise<string | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return null
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate(getRadianAngle(rotation))
  ctx.translate(-safeArea / 2, -safeArea / 2)

  ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5)

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y,
  )

  return canvas.toDataURL("image/jpeg")
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.src = url
  })
}

