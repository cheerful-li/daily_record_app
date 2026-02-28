import { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useIdeaStore } from "../../../stores/StoreContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { Idea } from "../../../services/database";

interface IdeaFormProps {
  open: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (idea: Omit<Idea, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Idea;
  isEditing?: boolean;
  categories: string[];
}

const IdeaForm = observer(
  ({
    open,
    onClose,
    onOpenChange,
    onSubmit,
    initialData,
    isEditing = false,
    categories,
  }: IdeaFormProps) => {
    const ideaStore = useIdeaStore();
    const [content, setContent] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [category, setCategory] = useState<string>(
      ideaStore.lastUsedCategory
    );
    const [newCategory, setNewCategory] = useState<string>("");
    const [useNewCategory, setUseNewCategory] = useState<boolean>(false);

    // Reset form when dialog opens with initialData
    useEffect(() => {
      if (initialData) {
        setContent(initialData.content);
        setDate(new Date(initialData.date));
        setCategory(initialData.category);
        setUseNewCategory(false);
      } else {
        // Reset form for a new idea
        setContent("");
        setDate(new Date());
        setCategory(categories.length > 0 ? categories[0] : "灵感");
        setNewCategory("");
        setUseNewCategory(false);
      }
    }, [initialData, open, categories]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const selectedCategory =
        useNewCategory && newCategory.trim() ? newCategory.trim() : category;

      onSubmit({
        content,
        date,
        category: selectedCategory,
      });

      onClose();
    };

    // Format date for input
    const formatDateForInput = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    return (
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "编辑想法" : "添加新想法"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="content">内容:</label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                  placeholder="记录你的想法、创意、灵感..."
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="date">日期:</label>
                <Input
                  id="date"
                  type="date"
                  value={formatDateForInput(date)}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="category">分类:</label>
                </div>

                {!useNewCategory ? (
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      if (value === "__new__") {
                        setUseNewCategory(true);
                        setTimeout(
                          () => document.getElementById("newCategory")?.focus(),
                          50
                        );
                      } else {
                        setCategory(value);
                      }
                    }}
                  >
                    <SelectTrigger
                      id="category"
                      className="border-primary text-primary font-medium"
                    >
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
                  <div className="relative">
                    <Input
                      id="newCategory"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="输入新分类名称"
                      required={useNewCategory}
                      className="pr-8"
                      autoFocus
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
              </div>
            </div>
            <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-none sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                取消
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {isEditing ? "保存" : "添加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

export default IdeaForm;
