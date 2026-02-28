import { observer } from 'mobx-react-lite';
import type { Idea } from '../../../services/database';
import IdeaCard from './IdeaCard';

interface IdeasListProps {
  ideas: Idea[];
  onEdit: (idea: Idea) => void;
  onDelete: (ideaId: number | undefined) => void;
}

const IdeasList = observer(({ ideas, onEdit, onDelete }: IdeasListProps) => {
  if (ideas.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <p className="mt-4 text-lg font-semibold">暂无灵感记录</p>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            点击添加按钮来记录你的第一个灵感
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

export default IdeasList;