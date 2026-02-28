import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import type { CheckIn, Habit } from '../../../services/database';
import { formatCheckInStatus } from '../../../utils/formatters';

interface CheckInFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (checkIn: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>) => void;
  habit?: Habit;
  status: 'completed' | 'half-completed' | 'skipped';
}

const CheckInForm = observer(({ open, onClose, onSubmit, habit, status }: CheckInFormProps) => {
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habit?.id) {
      return;
    }
    
    onSubmit({
      habitId: habit.id,
      date: new Date(),
      status,
      note,
    });
    
    setNote('');
    onClose();
  };

  if (!habit) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {habit.name} - {formatCheckInStatus(status)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="note">备注：</label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加今天的记录..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">提交</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default CheckInForm;