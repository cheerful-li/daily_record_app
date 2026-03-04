import { observer } from 'mobx-react-lite'
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card'
import { 
  PersonIcon, 
  CalendarIcon, 
  ClockIcon, 
  ChatBubbleIcon,
  InfoCircledIcon
} from '@radix-ui/react-icons'
import type { Relationship } from '../../../services/database'
import { formatDate } from '../../../utils/formatters'

interface RelationshipDetailProps {
  relationship?: Relationship;
}

const RelationshipDetail = observer(({ relationship }: RelationshipDetailProps) => {
  if (!relationship) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>联系人详情</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">选择一个联系人查看详情</p>
        </CardContent>
      </Card>
    )
  }

  const getDaysUntilNextContact = () => {
    if (!relationship.nextContact) return null
    
    const nextContact = new Date(relationship.nextContact)
    const today = new Date()
    const diffTime = nextContact.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const getContactStatus = () => {
    const days = getDaysUntilNextContact()
    
    if (days === null) return null
    
    if (days < 0) {
      return {
        text: `已逾期 ${Math.abs(days)} 天`,
        className: 'text-red-500'
      }
    } else if (days === 0) {
      return {
        text: `今天应联系`,
        className: 'text-yellow-500'
      }
    } else if (days <= 7) {
      return {
        text: `${days} 天后联系`,
        className: 'text-yellow-500'
      }
    } else {
      return {
        text: `${days} 天后联系`,
        className: 'text-green-500'
      }
    }
  }

  const contactStatus = getContactStatus()

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PersonIcon className="h-5 w-5 text-primary" />
          <CardTitle>{relationship.name}</CardTitle>
        </div>
        <div className="flex items-center mt-1 text-sm">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
            <InfoCircledIcon className="mr-1 h-3.5 w-3.5" />
            {relationship.category}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {relationship.lastContact && (
            <div className="flex items-center text-sm text-muted-foreground">
              <ChatBubbleIcon className="mr-2 h-4 w-4" />
              <span>上次联系: {formatDate(new Date(relationship.lastContact))}</span>
            </div>
          )}
          
          {relationship.nextContact && (
            <div className="flex items-center text-sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>
                下次联系: {formatDate(new Date(relationship.nextContact))}
                {contactStatus && (
                  <span className={`ml-2 font-medium ${contactStatus.className}`}>
                    ({contactStatus.text})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {relationship.notes && (
          <div className="space-y-1">
            <h3 className="text-sm font-medium">备注</h3>
            <p className="text-sm whitespace-pre-wrap">{relationship.notes}</p>
          </div>
        )}
        
        <div className="border-t pt-4 text-xs text-muted-foreground">
          <div className="flex items-center mb-1">
            <ClockIcon className="mr-1 h-3.5 w-3.5" />
            创建于: {formatDate(new Date(relationship.createdAt))}
          </div>
          <div className="flex items-center">
            <ClockIcon className="mr-1 h-3.5 w-3.5" />
            更新于: {formatDate(new Date(relationship.updatedAt))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default RelationshipDetail