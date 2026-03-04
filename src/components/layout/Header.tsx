import { observer } from 'mobx-react-lite'
import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '../../stores/StoreContext'
import { Button } from '../ui/button'
import { MoonIcon, SunIcon, CheckCircledIcon, ClockIcon, CalendarIcon, PersonIcon, LightningBoltIcon, PieChartIcon } from '@radix-ui/react-icons'
import { cn } from '../../lib/utils'

interface HeaderProps {
  className?: string;
}

const navItems = [
  { path: '/app/habits', id: 'habits', label: '微习惯', icon: CheckCircledIcon },
  { path: '/app/life-moments', id: 'lifeMoments', label: '生活点滴', icon: ClockIcon },
  { path: '/app/tasks', id: 'tasks', label: '待办事项', icon: CalendarIcon },
  { path: '/app/relationships', id: 'relationships', label: '社交关系', icon: PersonIcon },
  { path: '/app/ideas', id: 'ideas', label: '灵感想法', icon: LightningBoltIcon },
  { path: '/app/statistics', id: 'statistics', label: '统计数据', icon: PieChartIcon },
]

const Header = observer(({ className }: HeaderProps) => {
  const uiStore = useUIStore()
  const location = useLocation()

  const toggleTheme = () => {
    uiStore.toggleTheme()
  }

  return (
    <header className={cn("sticky top-0 z-30 w-full border-b bg-gradient-to-r from-background to-background/90 backdrop-blur-md shadow-sm", className)}>
      <div className="max-w-[1200px] w-full mx-auto flex items-center px-4 h-16 overflow-hidden">
        <Link to="/app/habits" className="text-xl font-bold gradient-text mr-4 whitespace-nowrap hover:opacity-80 transition-opacity">
          Daily Record
        </Link>

        <nav className="flex-1 hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="ml-auto" aria-label="Toggle theme">
          {uiStore.theme === 'light' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  )
})

export default Header
