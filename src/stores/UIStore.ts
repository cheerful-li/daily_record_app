import { makeAutoObservable } from 'mobx';

type Theme = 'light' | 'dark';
type ModuleLoadingState = {
  [key: string]: boolean;
};

class UIStore {
  theme: Theme = 'light';
  sidebarOpen = true;
  activeModule: string = 'habits';
  isModuleLoading: ModuleLoadingState = {
    habits: false,
    lifeMoments: false,
    tasks: false,
    relationships: false,
    ideas: false,
    statistics: false
  };
  
  constructor() {
    makeAutoObservable(this);
    this.initTheme();
  }
  
  private initTheme() {
    // Check if user has previously set a theme preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme) {
      this.theme = savedTheme;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
    
    // Apply theme to document
    this.applyTheme();
  }
  
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }
  
  private applyTheme() {
    if (this.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  setActiveModule(module: string) {
    this.activeModule = module;
  }
  
  setModuleLoading(module: string, isLoading: boolean) {
    this.isModuleLoading[module] = isLoading;
  }
  
  get isCurrentModuleLoading() {
    return this.isModuleLoading[this.activeModule];
  }
}

export default UIStore;