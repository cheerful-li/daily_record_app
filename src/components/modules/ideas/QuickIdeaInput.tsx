import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useIdeaStore } from "../../../stores/StoreContext";
import { Card, CardContent } from "../../ui/card";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import type { Idea } from "../../../services/database";

interface QuickIdeaInputProps {
  onSubmit: (idea: Omit<Idea, "id" | "createdAt" | "updatedAt">) => void;
  categories: string[];
}

const QuickIdeaInput = observer(
  ({ onSubmit, categories }: QuickIdeaInputProps) => {
    const ideaStore = useIdeaStore();
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<string>(
      ideaStore.lastUsedCategory ||
        (categories.length > 0 ? categories[0] : "灵感")
    );
    const [newCategory, setNewCategory] = useState<string>("");
    const [useNewCategory, setUseNewCategory] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleCategoryChange = (value: string) => {
      if (value === "__new__") {
        setUseNewCategory(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else {
        setCategory(value);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (content.trim() === "") return;

      // 使用新分类或现有分类
      const selectedCategory =
        useNewCategory && newCategory.trim() ? newCategory.trim() : category;

      onSubmit({
        content,
        date: new Date(),
        category: selectedCategory,
        tags: [],
      });

      // Reset form
      setContent("");
      if (useNewCategory) {
        setUseNewCategory(false);
        setNewCategory("");
      }
    };

    return (
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="记录你的想法、创意、灵感..."
                className="min-h-[120px]"
                required
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              {!useNewCategory ? (
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      <>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="__new__"
                          className="text-primary font-medium"
                        >
                          + 添加新分类
                        </SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="灵感">灵感</SelectItem>
                        <SelectItem
                          value="__new__"
                          className="text-primary font-medium"
                        >
                          + 添加新分类
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <div className="relative w-40">
                  <Input
                    ref={inputRef}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="新分类名称"
                    className="pr-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-8 p-0"
                    onClick={() => setUseNewCategory(false)}
                  >
                    <Cross2Icon className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="flex-1"
                disabled={
                  content.trim() === "" ||
                  (useNewCategory && newCategory.trim() === "")
                }
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                添加想法
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
);

export default QuickIdeaInput;
