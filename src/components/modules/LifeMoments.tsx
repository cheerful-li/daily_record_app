import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useLifeMomentStore } from "../../stores/StoreContext"
import { useConfirmDialog } from "../common/ConfirmDialog"
import type { LifeMomentFilterOptions } from "../../stores/LifeMomentStore"
import { Button } from "../ui/button"
import { PlusIcon, MixerHorizontalIcon } from "@radix-ui/react-icons"
import type { LifeMoment } from "../../services/database"
import MomentsList from "./lifeMoments/MomentsList"
import MomentForm from "./lifeMoments/MomentForm"
import MomentFilter from "./lifeMoments/MomentFilter"

// 使用从 LifeMomentStore 导入的 LifeMomentFilterOptions 类型

const LifeMoments = observer(() => {
  const lifeMomentStore = useLifeMomentStore()
  const { confirm, dialog } = useConfirmDialog()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMoment, setSelectedMoment] = useState<
    LifeMoment | undefined
  >()
  const [allTags, setAllTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false) // 控制筛选面板的显示/隐藏

  useEffect(() => {
    lifeMomentStore.loadLifeMoments()
  }, [lifeMomentStore])

  // 直接使用 lifeMomentStore 的 computed 属性
  const filteredMoments = lifeMomentStore.filteredLifeMoments

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
    // 不再需要手动调用筛选器
  }

  const handleEditMoment = async (
    moment: Omit<LifeMoment, "id" | "createdAt" | "updatedAt">
  ) => {
    if (selectedMoment?.id) {
      console.log('开始更新生活点滴:', { id: selectedMoment.id, data: moment })
      await lifeMomentStore.updateLifeMoment(selectedMoment.id, moment)
      // 重新加载所有生活点滴数据
      await lifeMomentStore.loadLifeMoments()
      // 不再需要手动调用筛选器
      console.log('更新后的生活点滴数据:', lifeMomentStore.lifeMoments)
    }
  }

  const handleDeleteMoment = async (momentId: number | undefined) => {
    if (momentId) {
      confirm({
        title: '删除生活记录',
        description: '确定要删除这条记录吗？此操作无法撤销。',
        confirmText: '删除',
        cancelText: '取消',
        variant: 'destructive',
        onConfirm: async () => {
          await lifeMomentStore.deleteLifeMoment(momentId)
          if (selectedMoment?.id === momentId) {
            setSelectedMoment(undefined)
          }
        },
      })
    }
  }

  const handleEditClick = (moment: LifeMoment) => {
    setSelectedMoment(moment)
    setIsEditDialogOpen(true)
  }

  // 删除了handleSelectMoment函数，不再需要详情查看功能

  const handleFilterChange = (options: LifeMomentFilterOptions) => {
    lifeMomentStore.setFilterOptions(options)
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
      {dialog}
    </div>
  )
})

export default LifeMoments