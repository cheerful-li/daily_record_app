import { observer } from 'mobx-react-lite';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { CalendarIcon } from '@radix-ui/react-icons';
import type { LifeMoment } from '../../../services/database';
import { formatDate } from '../../../utils/formatters';

interface MomentDetailProps {
  moment?: LifeMoment;
}

const MomentDetail = observer(({ moment }: MomentDetailProps) => {
  if (!moment) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>记忆详情</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">选择一条记录查看详情</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{moment.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-1 h-4 w-4" />
          <time dateTime={moment.date.toISOString()}>
            {formatDate(new Date(moment.date))}
          </time>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="whitespace-pre-wrap">{moment.description}</div>
          
          {moment.tags && moment.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">标签</h4>
              <div className="flex flex-wrap gap-2">
                {moment.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {moment.attachments && moment.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">附件</h4>
              <div className="space-y-2">
                {moment.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-sm">{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <div>创建于: {formatDate(new Date(moment.createdAt))}</div>
            <div>更新于: {formatDate(new Date(moment.updatedAt))}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default MomentDetail;