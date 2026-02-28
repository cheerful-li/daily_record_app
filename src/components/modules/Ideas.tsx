import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useIdeaStore } from "../../stores/StoreContext";
import { Button } from "../ui/button";
import { PlusIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import type { Idea } from "../../services/database";
import IdeasList from "./ideas/IdeasList";
import IdeaForm from "./ideas/IdeaForm";
import IdeaFilter from "./ideas/IdeaFilter";
import QuickIdeaInput from "./ideas/QuickIdeaInput";

interface FilterOptions {
  searchText: string;
  category: string;
  dateRange: {
    from: string;
    to: string;
  };
}

const Ideas = observer(() => {
  const ideaStore = useIdeaStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | undefined>();
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchText: "",
    category: "all",
    dateRange: {
      from: "",
      to: "",
    },
  });
  const [showFilters, setShowFilters] = useState(false); // 控制筛选面板的显示/隐藏
  const [showQuickInput, setShowQuickInput] = useState(false); // 控制快速输入框的显示/隐藏
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (showQuickInput) setShowQuickInput(false);
  };

  const toggleQuickInput = () => {
    setShowQuickInput(!showQuickInput);
    if (showFilters) setShowFilters(false);
  };

  useEffect(() => {
    ideaStore.loadIdeas();
  }, [ideaStore]);

  // Update filtered ideas when store data changes or filter changes
  useEffect(() => {
    applyFilters();
  }, [ideaStore.ideas, filterOptions]);

  // Extract unique categories from ideas
  // 将分类提取为一个独立函数，方便复用
  const extractCategories = () => {
    const uniqueCategories = new Set<string>();
    ideaStore.ideas.forEach((idea) => {
      uniqueCategories.add(idea.category);
    });
    setCategories(Array.from(uniqueCategories));
  };

  // 首次加载和数据变化时更新分类
  useEffect(() => {
    extractCategories();
  }, [ideaStore.ideas]);

  const handleAddIdea = async (
    idea: Omit<Idea, "id" | "createdAt" | "updatedAt">
  ) => {
    await ideaStore.addIdea(idea);
    // 重新提取分类列表，确保新添加的分类能立即反映到UI中
    extractCategories();
    // 重新应用筛选器，刷新列表
    applyFilters();
  };

  const handleEditIdea = async (
    idea: Omit<Idea, "id" | "createdAt" | "updatedAt">
  ) => {
    if (selectedIdea?.id) {
      await ideaStore.updateIdea(selectedIdea.id, idea);
      // 重新提取分类列表，确保编辑后的分类变化能立即反映到UI中
      extractCategories();
      // 重新应用筛选器，刷新列表
      applyFilters();
    }
  };

  const handleDeleteIdea = async (ideaId: number | undefined) => {
    if (ideaId) {
      if (confirm("确定要删除这个想法吗？")) {
        await ideaStore.deleteIdea(ideaId);
      }
    }
  };

  const handleEditClick = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsEditDialogOpen(true);
  };

  const handleFilterChange = (options: FilterOptions) => {
    setFilterOptions(options);
  };

  const applyFilters = () => {
    let filtered = [...ideaStore.ideas];

    // Filter by search text (in content)
    if (filterOptions.searchText) {
      const searchLower = filterOptions.searchText.toLowerCase();
      filtered = filtered.filter((idea) =>
        idea.content.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (filterOptions.category !== "all") {
      filtered = filtered.filter(
        (idea) => idea.category === filterOptions.category
      );
    }

    // Filter by date range
    if (filterOptions.dateRange.from) {
      const fromDate = new Date(filterOptions.dateRange.from);
      filtered = filtered.filter((idea) => new Date(idea.date) >= fromDate);
    }

    if (filterOptions.dateRange.to) {
      const toDate = new Date(filterOptions.dateRange.to);
      // Set time to end of day for inclusive comparison
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((idea) => new Date(idea.date) <= toDate);
    }

    // Sort by date, most recent first
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setFilteredIdeas(filtered);
  };

  return (
    <div className="container mx-auto pb-20 md:pb-0">
      <div className="mb-4 flex items-center justify-between flex-wrap">
        <h1 className="text-3xl font-bold hidden md:block">灵感想法</h1>
        <Button
          onClick={() => {
            setIsEditDialogOpen(false);
            setShowQuickInput(true);
          }}
          className="ml-auto hidden md:flex"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>添加想法</span>
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-[1fr_2fr] grid-cols-1">
        {/* Quick Idea Input & Filters - 桌面端显示，移动端隐藏 */}
        <div className="space-y-4 md:space-y-6 order-1 hidden md:block">
          {/* Quick Idea Input */}
          <QuickIdeaInput
            onSubmit={handleAddIdea}
            categories={categories.length > 0 ? categories : ["灵感"]}
          />

          {/* Filters */}
          <IdeaFilter
            onFilterChange={handleFilterChange}
            categories={categories}
          />
        </div>

        {/* 移动端筛选面板 - 条件显示 */}
        {showFilters && (
          <div className="md:hidden mb-4 fixed bottom-26 left-4 right-4 z-30 bg-background border rounded-md shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">筛选灵感想法</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                关闭
              </Button>
            </div>
            <IdeaFilter
              onFilterChange={handleFilterChange}
              categories={categories}
            />
          </div>
        )}

        {/* 移动端快速输入框 - 条件显示 */}
        {showQuickInput && (
          <div className="md:hidden mb-4 fixed bottom-26 left-4 right-4 z-30 bg-background border rounded-md shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">快速添加想法</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickInput(false)}
              >
                关闭
              </Button>
            </div>
            <QuickIdeaInput
              onSubmit={(idea) => {
                handleAddIdea(idea);
                setShowQuickInput(false);
              }}
              categories={categories.length > 0 ? categories : ["灵感"]}
            />
          </div>
        )}

        {/* Ideas List */}
        <div className="order-1 md:order-2">
          {ideaStore.loading ? (
            <p>加载中...</p>
          ) : (
            <IdeasList
              ideas={filteredIdeas}
              onEdit={handleEditClick}
              onDelete={handleDeleteIdea}
            />
          )}
        </div>
      </div>

      {/* Edit Idea Dialog */}
      {/* 底部操作栏 - 仅移动端显示 */}
      <div className="fixed bottom-12 left-0 right-0 bg-background border-t p-4 flex justify-around z-30 md:hidden">
        <Button
          variant="outline"
          onClick={() => {
            setShowFilters(!showFilters);
            setShowQuickInput(false);
          }}
          className="flex-1 mr-2"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          筛选
        </Button>
        <Button
          onClick={() => {
            setShowQuickInput(!showQuickInput);
            setShowFilters(false);
          }}
          className="flex-1 ml-2"
          variant="outline"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          添加想法
        </Button>
      </div>

      <IdeaForm
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onOpenChange={(open) => !open && setIsEditDialogOpen(false)}
        onSubmit={handleEditIdea}
        initialData={selectedIdea}
        isEditing={true}
        categories={categories.length > 0 ? categories : ["灵感"]}
      />
    </div>
  );
});

export default Ideas;
