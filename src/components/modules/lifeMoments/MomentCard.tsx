import { observer } from 'mobx-react-lite'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../ui/card'
import { Button } from '../../ui/button'
import { CalendarIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import type { LifeMoment } from '../../../services/database'
import { formatDate } from '../../../utils/formatters'

interface MomentCardProps {
  moment: LifeMoment;
  onEdit: (moment: LifeMoment) => void;
  onDelete: (momentId: number | undefined) => void;
}

const MomentCard = observer(({ moment, onEdit, onDelete }: MomentCardProps) => {
  // Function to truncate description if it's too long
  const truncateDescription = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{moment.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-1 h-4 w-4" />
          <time dateTime={new Date(moment.date).toISOString()}>
            {formatDate(new Date(moment.date))}
          </time>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm">{truncateDescription(moment.description)}</p>
        {moment.tags && moment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {moment.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-end w-full gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(moment)
            }}
          >
            <Pencil1Icon className="h-4 w-4 mr-1" />
            编辑
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(moment.id)
            }}
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            删除
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
})

export default MomentCard