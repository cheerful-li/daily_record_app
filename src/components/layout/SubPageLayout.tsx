import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { ChevronLeftIcon } from '@radix-ui/react-icons'

interface SubPageLayoutProps {
  title: string;
  children: ReactNode;
  backTo?: string; // 返回路径，默认'/app/habits'
  headerAction?: ReactNode; // 标题栏右侧自定义操作按钮
  className?: string;
}

export default function SubPageLayout({ 
  title, 
  children, 
  backTo = '..',
  headerAction,
  className = ''
}: SubPageLayoutProps) {
  const navigate = useNavigate()
  
  const handleBack = () => {
    navigate(backTo)
  }
  
  return (
    <div className={`w-full py-2 sm:py-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-1 px-2 h-8"
            aria-label="返回"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>返回</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
        </div>
        <div className="md:block hidden">
          {headerAction}
        </div>
      </div>
      
      {children}
    </div>
  )
}