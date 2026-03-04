import { observer } from 'mobx-react-lite'
import type { Relationship } from '../../../services/database'
import RelationshipCard from './RelationshipCard'

interface RelationshipsListProps {
  relationships: Relationship[];
  onEdit: (relationship: Relationship) => void;
  onDelete: (relationshipId: number | undefined) => void;
  onUpdateContact: (relationship: Relationship) => void;
}

const RelationshipsList = observer(({ 
  relationships, 
  onEdit, 
  onDelete,
  onUpdateContact
}: RelationshipsListProps) => {
  if (relationships.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <p className="mt-4 text-lg font-semibold">暂无联系人</p>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            点击添加按钮来创建第一个联系人
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {relationships.map((relationship) => (
        <RelationshipCard
          key={relationship.id}
          relationship={relationship}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateContact={onUpdateContact}
        />
      ))}
    </div>
  )
})

export default RelationshipsList