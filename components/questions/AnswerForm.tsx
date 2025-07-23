import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/file-upload";
import { X } from "lucide-react";

export default function AnswerForm({ answerContent, setAnswerContent, uploadedImages, handleImageUpload, removeImage, handleSubmitAnswer, loading }) {
  return (
    <Card>
      <CardHeader>
        <div className="font-bold text-lg">답변 작성하기</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="답변을 작성해주세요..."
          value={answerContent}
          onChange={(e) => setAnswerContent(e.target.value)}
          rows={6}
        />
        <div className="space-y-2">
          <Label htmlFor="answer-images">이미지 첨부</Label>
          <FileUpload
            onFilesSelect={handleImageUpload}
            accept="image/*"
            maxSize={5}
            multiple={true}
            buttonText="이미지 선택"
          />
          {uploadedImages.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="uploaded-image-list">첨부된 이미지 ({uploadedImages.length})</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Uploaded ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-xs truncate mt-1">{image.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmitAnswer} disabled={loading}>답변 등록하기</Button>
      </CardFooter>
    </Card>
  );
} 