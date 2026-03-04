import { observer } from 'mobx-react-lite'
import { Card, CardHeader, CardContent, CardFooter } from '../../ui/card'
import { Button } from '../../ui/button'
import { 
  CalendarIcon, 
  Pencil1Icon, 
  TrashIcon,
  LightningBoltIcon
} from '@radix-ui/react-icons'
import type { Idea } from '../../../services/database'
import { formatDate } from '../../../utils/formatters'

interface IdeaCardProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  onDelete: (ideaId: number | undefined) => void;
}

const IdeaCard = observer(({ idea, onEdit, onDelete }: IdeaCardProps) => {
  const truncateContent = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LightningBoltIcon className="h-4 w-4 text-yellow-500" />
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
              {idea.category}
            </span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
            <time dateTime={new Date(idea.date).toISOString()}>
              {formatDate(new Date(idea.date))}
            </time>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="whitespace-pre-line text-sm">
          {truncateContent(idea.content)}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(idea)}
          >
            <Pencil1Icon className="h-4 w-4 mr-1" />
            编辑
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={() => onDelete(idea.id)}
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            删除
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
})

export default IdeaCard