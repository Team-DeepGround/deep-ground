import React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TechStack {
  id: number;
  name: string;
}

export interface TechStackSelectorProps {
  availableTags: TechStack[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export default function TechStackSelector({
  availableTags,
  selectedTags,
  onToggle,
}: TechStackSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="border rounded-md p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => onToggle(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
        <div className="border-t pt-3 mt-2">
          <p className="text-sm text-muted-foreground mb-2">
            기술 스택 선택 (다중 선택 가능)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableTags.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag.name}`}
                  checked={selectedTags.includes(tag.name)}
                  onCheckedChange={() => onToggle(tag.name)}
                />
                <label
                  htmlFor={`tag-${tag.name}`}
                  className={cn("text-sm cursor-pointer", selectedTags.includes(tag.name) ? "font-semibold" : "")}
                >
                  {tag.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
