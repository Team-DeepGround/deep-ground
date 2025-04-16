"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileIcon, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // 최대 파일 크기 (MB)
  multiple?: boolean
  buttonText?: string
}

export default function FileUpload({
  onFileSelect,
  accept = "*",
  maxSize = 10, // 기본 최대 크기 10MB
  multiple = false,
  buttonText = "파일 선택",
}: FileUploadProps) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isImage = (file: File) => file.type.startsWith("image/")

  const handleFileSelect = (file: File) => {
    // 파일 크기 검증
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: `파일 크기는 ${maxSize}MB를 초과할 수 없습니다.`,
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // 이미지 파일인 경우 미리보기 생성
    if (isImage(file)) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }

    // 업로드 시뮬레이션
    simulateUpload(file)
  }

  const simulateUpload = (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            onFileSelect(file)
          }, 300)
        }
        return newProgress
      })
    }, 200)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      handleFileSelect(file)

      // 입력값 초기화 (같은 파일 다시 선택 가능하도록)
      e.target.value = ""
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadProgress(0)
    setIsUploading(false)
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">파일을 드래그 앤 드롭하거나</p>
            <Button type="button" onClick={handleButtonClick}>
              {buttonText}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {previewUrl ? (
                <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="h-12 w-12 object-cover rounded" />
              ) : (
                <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
                  <FileIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {isUploading ? (
              <div className="w-6 h-6 relative">
                <svg
                  className="animate-spin h-6 w-6 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Button variant="ghost" size="icon" onClick={handleClearFile}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-1" />
              <p className="text-xs text-right mt-1 text-muted-foreground">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
