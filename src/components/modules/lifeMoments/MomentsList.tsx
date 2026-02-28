import { observer } from 'mobx-react-lite';
import type { LifeMoment } from '../../../services/database';
import MomentCard from './MomentCard';

interface MomentsListProps {
  moments: LifeMoment[];
  onEdit: (moment: LifeMoment) => void;
  onDelete: (momentId: number | undefined) => void;
}

const MomentsList = observer(({ moments, onEdit, onDelete }: MomentsListProps) => {
  if (moments.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <p className="mt-4 text-lg font-semibold">暂无记录</p>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            点击添加按钮来创建第一条生活记录
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {moments.map((moment) => (
        <MomentCard
          key={moment.id}
          moment={moment}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

export default MomentsList;