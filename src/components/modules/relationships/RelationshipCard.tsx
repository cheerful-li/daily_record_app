import { observer } from 'mobx-react-lite'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../ui/card'
import { Button } from '../../ui/button'
import { 
  PersonIcon, 
  CalendarIcon, 
  Pencil1Icon, 
  TrashIcon,
  ChatBubbleIcon
} from '@radix-ui/react-icons'
import type { Relationship } from '../../../services/database'
import { formatSimpleDate } from '../../../utils/formatters'

interface RelationshipCardProps {
  relationship: Relationship;
  onEdit: (relationship: Relationship) => void;
  onDelete: (relationshipId: number | undefined) => void;
  onUpdateContact: (relationship: Relationship) => void;
}

const RelationshipCard = observer(({ 
  relationship, 
  onEdit, 
  onDelete, 
  onUpdateContact
}: RelationshipCardProps) => {

  const isContactDue = () => {
    if (!relationship.nextContact) return false
    const nextContact = new Date(relationship.nextContact)
    const today = new Date()
    return nextContact <= today
  }

  const getDaysUntilNextContact = () => {
    if (!relationship.nextContact) return null
    
    const nextContact = new Date(relationship.nextContact)
    const today = new Date()
    const diffTime = nextContact.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const getContactText = () => {
    const days = getDaysUntilNextContact()
    
    if (days === null) return null
    
    if (days < 0) {
      return `逾期 ${Math.abs(days)} 天`
    } else if (days === 0) {
      return `今天应联系`
    } else {
      return `${days} 天后联系`
    }
  }

  const contactText = getContactText()
  const contactDue = isContactDue()

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PersonIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{relationship.name}</CardTitle>
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
              {relationship.category}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {contactText && (
          <div className={`flex items-center mb-2 text-sm ${contactDue ? 'text-red-500' : 'text-muted-foreground'}`}>
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{contactText}</span>
          </div>
        )}
        {relationship.lastContact && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <ChatBubbleIcon className="h-4 w-4 mr-1" />
            <span>上次联系: {formatSimpleDate(new Date(relationship.lastContact))}</span>
          </div>
        )}
        {relationship.notes && (
          <p className="text-sm">{relationship.notes}</p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onUpdateContact(relationship)}
          >
            <ChatBubbleIcon className="mr-1 h-4 w-4" />
            记录联系
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(relationship)}
            >
              <Pencil1Icon className="h-4 w-4 mr-1" />
              编辑
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(relationship.id)}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
})

export default RelationshipCard