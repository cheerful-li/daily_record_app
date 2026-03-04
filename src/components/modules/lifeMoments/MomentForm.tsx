import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Button } from "../../ui/button"
import type { LifeMoment } from "../../../services/database"

interface MomentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    moment: Omit<LifeMoment, "id" | "createdAt" | "updatedAt">
  ) => void;
  initialData?: LifeMoment;
  isEditing?: boolean;
  availableTags?: string[];
}

const MomentForm = observer(
  ({
    open,
    onClose,
    onSubmit,
    initialData,
    isEditing = false,
    availableTags = [],
  }: MomentFormProps) => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState<Date>(new Date())
    const [tagsInput, setTagsInput] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    // Reset form when dialog opens with initialData
    useEffect(() => {
      if (initialData) {
        setTitle(initialData.title)
        setDescription(initialData.description)
        setDate(new Date(initialData.date))
        setTagsInput(initialData.tags.join(", "))
        setSelectedTags(initialData.tags)
      } else {
        // Reset form for a new moment
        setTitle("")
        setDescription("")
        setDate(new Date())
        setTagsInput("")
        setSelectedTags([])
      }
    }, [initialData, open])

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      // Process tags: split by comma, trim whitespace, and remove empty entries
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "")

      // Include selected tags, ensuring no duplicates and only strings
      // 先合并标签，然后去重，确保只有字符串
      const uniqueTags = Array.from(new Set([...tags, ...selectedTags]))
      const allTags = uniqueTags.map(tag => String(tag)) // 确保所有标签都是字符串类型

      // 处理日期，确保是有效的Date对象
      const safeDate = new Date(date.getTime())
      
      // 确保附件是简单数组
      const safeAttachments = (initialData?.attachments || []).map(att => String(att))
      
      // 准备安全的数据对象
      const safeData = {
        title: String(title),
        description: String(description),
        date: safeDate,
        tags: allTags,
        attachments: safeAttachments,
      }
      
      // 提交处理后的安全数据
      onSubmit(safeData)
      
      // 调试输出
      console.log('提交的安全数据:', safeData)

      onClose()
    }

    const handleTagClick = (tag: string) => {
      // Toggle tag selection
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter((t) => t !== tag))
      } else {
        setSelectedTags([...selectedTags, tag])

        // Also remove from tagsInput if it's there
        const currentTags = tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== "" && t !== tag)
        setTagsInput(currentTags.join(", "))
      }
    }

    // Format date for input
    const formatDateForInput = (date: Date) => {
      return date.toISOString().split("T")[0]
    }

    return (
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "编辑记录" : "添加新记录"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title">标题:</label>
                <Input
                  id="title"
                  value={title}
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                  required
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
                <label htmlFor="description">描述:</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="可选描述..."
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="tags">标签 (用逗号分隔或从下方选择):</label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="家庭, 旅行, 工作..."
                />

                {availableTags.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      可用标签:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {availableTags.map((tag, index) => (
                        <Button
                          key={index}
                          variant={
                            selectedTags.includes(tag) ? "secondary" : "outline"
                          }
                          size="sm"
                          className={`text-xs h-7 rounded-full ${
                            selectedTags.includes(tag)
                              ? "bg-primary text-primary-foreground font-medium ring-1 ring-primary"
                              : ""
                          }`}
                          onClick={() => handleTagClick(tag)}
                          type="button"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className=" grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button variant="default" type="submit">
                {isEditing ? "保存" : "添加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
)

export default MomentForm
