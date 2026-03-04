import { observer } from 'mobx-react-lite'
import { HeartFilledIcon, GitHubLogoIcon } from '@radix-ui/react-icons'
import { cn } from '../../lib/utils'

interface FooterProps {
  className?: string;
}

const Footer = observer(({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn("border-t py-6 md:py-0 bg-gradient-to-r from-[color:var(--primary)/0.05] to-[color:var(--accent)/0.05] shadow-inner", className)}>
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Daily Record © {currentYear} • Made with
          <HeartFilledIcon className="mx-1 inline h-4 w-4 text-red-500" />
          by <span className="font-medium text-primary">You</span>
        </p>
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            target="_blank" 
            rel="noreferrer" 
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubLogoIcon className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  )
})

export default Footer