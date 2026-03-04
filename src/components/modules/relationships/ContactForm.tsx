import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog'
import { Textarea } from '../../ui/textarea'
import { Button } from '../../ui/button'
import { DatePicker } from '../../ui/date-picker'
import type { Relationship } from '../../../services/database'

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (relationshipId: number | undefined, lastContact: Date, nextContact?: Date, notes?: string) => void;
  relationship?: Relationship;
}

const ContactForm = observer(({ open, onClose, onSubmit, relationship }: ContactFormProps) => {

  const [lastContact, setLastContact] = useState<Date>(new Date())
  const [nextContact, setNextContact] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState('')

  // Calculate suggested next contact date based on relationship category
  const suggestNextContact = () => {
    const today = new Date()
    const nextDate = new Date(today)
    
    switch (relationship?.category) {
      case '家人':
        // For family, suggest once a week
        nextDate.setDate(today.getDate() + 7)
        break
      case '朋友':
        // For friends, suggest once every two weeks
        nextDate.setDate(today.getDate() + 14)
        break
      case '同事':
        // For colleagues, suggest once every month
        nextDate.setMonth(today.getMonth() + 1)
        break
      case '同学':
        // For classmates, suggest once every month
        nextDate.setMonth(today.getMonth() + 1)
        break
      default:
        // Default is once every month
        nextDate.setMonth(today.getMonth() + 1)
    }
    
    setNextContact(nextDate)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSubmit(relationship?.id, lastContact, nextContact, notes)
    onClose()
  }

  if (!relationship) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>记录与 {relationship.name} 的联系</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="lastContact">联系日期:</label>
              <DatePicker
                date={lastContact}
                onDateChange={(date) => date && setLastContact(date)}
                placeholder="选择联系日期"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="nextContact">下次联系日期:</label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={suggestNextContact}
                >
                  建议日期
                </Button>
              </div>
              <DatePicker
                date={nextContact}
                onDateChange={setNextContact}
                placeholder="选择下次联系日期"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="notes">联系记录:</label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="记录联系内容、话题、计划等..."
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-none sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              取消
            </Button>
            <Button type="submit" className="w-full sm:w-auto">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})

export default ContactForm