import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { DatePicker } from '../../ui/date-picker';
import type { Relationship } from '../../../services/database';

interface RelationshipFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Relationship;
  isEditing?: boolean;
}

const RelationshipForm = observer(({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing = false 
}: RelationshipFormProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('朋友');
  const [lastContact, setLastContact] = useState<Date | undefined>(undefined);
  const [nextContact, setNextContact] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  
  const categories = ['家人', '朋友', '同事', '同学', '熟人', '其他'];

  // Reset form when dialog opens with initialData
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setLastContact(initialData.lastContact ? new Date(initialData.lastContact) : undefined);
      setNextContact(initialData.nextContact ? new Date(initialData.nextContact) : undefined);
      setNotes(initialData.notes);
    } else {
      // Reset form for new relationship
      setName('');
      setCategory('朋友');
      setLastContact(undefined);
      setNextContact(undefined);
      setNotes('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const relationshipData: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      category,
      notes,
    };
    
    if (lastContact) {
      relationshipData.lastContact = lastContact;
    }
    
    if (nextContact) {
      relationshipData.nextContact = nextContact;
    }
    
    onSubmit(relationshipData);
    onClose();
  };


  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑联系人' : '添加新联系人'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">姓名:</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="category">分类:</label>
              <Select value={category} onValueChange={(value) => setCategory(value)}>
                <SelectTrigger id="category" className="border-primary text-primary font-medium">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="lastContact">上次联系日期:</label>
              <DatePicker
                date={lastContact}
                onDateChange={(date) => setLastContact(date)}
                placeholder="选择上次联系日期"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="nextContact">下次联系日期:</label>
              <DatePicker
                date={nextContact}
                onDateChange={(date) => setNextContact(date)}
                placeholder="选择下次联系日期"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="notes">备注:</label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-none sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              取消
            </Button>
            <Button type="submit" className="w-full sm:w-auto">{isEditing ? '保存' : '添加'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default RelationshipForm;