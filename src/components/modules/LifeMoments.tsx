import { useState, useEffect, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { useLifeMomentStore } from "../../stores/StoreContext"
import { Button } from "../ui/button"
import { PlusIcon, MixerHorizontalIcon } from "@radix-ui/react-icons"
import type { LifeMoment } from "../../services/database"
import MomentsList from "./lifeMoments/MomentsList"
import MomentForm from "./lifeMoments/MomentForm"
import MomentFilter from "./lifeMoments/MomentFilter"

interface FilterOptions {
  searchText: string;
  tags: string[];
  fromDate?: Date;
  toDate?: Date;
}

const LifeMoments = observer(() => {
  const lifeMomentStore = useLifeMomentStore()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMoment, setSelectedMoment] = useState<
    LifeMoment | undefined
  >()
  const [filteredMoments, setFilteredMoments] = useState<LifeMoment[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchText: "",
    tags: [],
  })
  const [showFilters, setShowFilters] = useState(false) // 控制筛选面板的显示/隐藏

  useEffect(() => {
    lifeMomentStore.loadLifeMoments()
  }, [lifeMomentStore])

  // 定义 applyFilters 函数
  const applyFilters = useCallback(() => {
    let filtered = [...lifeMomentStore.lifeMoments]

    // Filter by search text (in title or description)
    if (filterOptions.searchText) {
      const searchLower = filterOptions.searchText.toLowerCase()
      filtered = filtered.filter(
        (moment) =>
          moment.title.toLowerCase().includes(searchLower) ||
          moment.description.toLowerCase().includes(searchLower)
      )
    }

    // Filter by tags
    if (filterOptions.tags.length > 0) {
      filtered = filtered.filter((moment) =>
        filterOptions.tags.some((tag) => moment.tags.includes(tag))
      )
    }

    // Filter by date range
    if (filterOptions.fromDate) {
      filtered = filtered.filter(
        (moment) => new Date(moment.date) >= filterOptions.fromDate!
      )
    }

    if (filterOptions.toDate) {
      filtered = filtered.filter(
        (moment) => new Date(moment.date) <= filterOptions.toDate!
      )
    }

    // Sort by date, most recent first
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    setFilteredMoments(filtered)
  }, [lifeMomentStore.lifeMoments, filterOptions])

  // Update filtered moments when store data changes or filter changes
  useEffect(() => {
    applyFilters()
  }, [lifeMomentStore.lifeMoments, filterOptions, applyFilters])

  // Extract all unique tags from moments
  useEffect(() => {
    const tags = new Set<string>()
    lifeMomentStore.lifeMoments.forEach((moment) => {
      moment.tags.forEach((tag) => tags.add(tag))
    })
    setAllTags(Array.from(tags))
  }, [lifeMomentStore.lifeMoments])

  const handleAddMoment = async (
    moment: Omit<LifeMoment, "id" | "createdAt" | "updatedAt">
  ) => {
    await lifeMomentStore.addLifeMoment(moment)
    // 重新应用筛选器，刷新列表
    applyFilters()
  }

  const handleEditMoment = async (
    moment: Omit<LifeMoment, "id" | "createdAt" | "updatedAt">
  ) => {
    if (selectedMoment?.id) {
      console.log('开始更新生活点滴:', { id: selectedMoment.id, data: moment })
      await lifeMomentStore.updateLifeMoment(selectedMoment.id, moment)
      // 重新加载所有生活点滴数据
      await lifeMomentStore.loadLifeMoments()
      // 重新应用筛选器，刷新列表
      applyFilters()
      console.log('更新后的生活点滴数据:', lifeMomentStore.lifeMoments)
    }
  }

  const handleDeleteMoment = async (momentId: number | undefined) => {
    if (momentId) {
      if (confirm("确定要删除这条记录吗？")) {
        await lifeMomentStore.deleteLifeMoment(momentId)
        if (selectedMoment?.id === momentId) {
          setSelectedMoment(undefined)
        }
      }
    }
  }

  const handleEditClick = (moment: LifeMoment) => {
    setSelectedMoment(moment)
    setIsEditDialogOpen(true)
  }

  // 删除了handleSelectMoment函数，不再需要详情查看功能

  const handleFilterChange = (options: FilterOptions) => {
    setFilterOptions(options)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="container mx-auto pb-20 md:pb-0">
      <div className="mb-4 flex items-center justify-between flex-wrap">
        <h1 className="text-3xl font-bold hidden md:block">生活点滴</h1>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="ml-auto hidden md:flex"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>添加记录</span>
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-[1fr_3fr] grid-cols-1">
        {/* Filters - 桌面端显示，移动端隐藏 */}
        <div className="hidden md:block order-1">
          <MomentFilter
            onFilterChange={handleFilterChange}
            availableTags={allTags}
          />
        </div>

        {/* 移动端筛选面板 - 条件显示 */}
        {showFilters && (
          <div className="md:hidden mb-4 fixed bottom-26 left-4 right-4 z-30 bg-background border rounded-md shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">筛选</h3>
              <Button variant="ghost" size="sm" onClick={toggleFilters}>
                关闭
              </Button>
            </div>
            <MomentFilter
              onFilterChange={handleFilterChange}
              availableTags={allTags}
            />
          </div>
        )}

        {/* Moments List */}
        <div className="order-2 mb-4 md:mb-0 col-span-1 md:col-span-1">
          {lifeMomentStore.loading ? (
            <p>加载中...</p>
          ) : (
            <MomentsList
              moments={filteredMoments}
              onEdit={handleEditClick}
              onDelete={handleDeleteMoment}
            />
          )}
        </div>
      </div>

      {/* 底部操作栏 - 仅移动端显示 */}
      <div className="fixed bottom-12 left-0 right-0 bg-background border-t p-4 flex justify-around z-30 md:hidden">
        <Button
          variant="outline"
          onClick={toggleFilters}
          className="flex-1 mr-2"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          筛选
        </Button>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="flex-1 ml-2"
          variant="outline"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          添加记录
        </Button>
      </div>

      {/* Add Moment Dialog */}
      <MomentForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddMoment}
        availableTags={allTags}
      />

      {/* Edit Moment Dialog */}
      <MomentForm
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditMoment}
        initialData={selectedMoment}
        isEditing={true}
        availableTags={allTags}
      />
    </div>
  )
})

export default LifeMoments