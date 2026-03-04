import HabitStore from './HabitStore'
import CheckInStore from './CheckInStore'
import LifeMomentStore from './LifeMomentStore'
import TaskStore from './TaskStore'
import IdeaStore from './IdeaStore'
import RelationshipStore from './RelationshipStore'
import UIStore from './UIStore'

class RootStore {
  habitStore: HabitStore
  checkInStore: CheckInStore
  lifeMomentStore: LifeMomentStore
  taskStore: TaskStore
  ideaStore: IdeaStore
  relationshipStore: RelationshipStore
  uiStore: UIStore

  constructor() {
    // Initialize all stores
    this.habitStore = new HabitStore()
    this.checkInStore = new CheckInStore()
    this.lifeMomentStore = new LifeMomentStore()
    this.taskStore = new TaskStore()
    this.ideaStore = new IdeaStore()
    this.relationshipStore = new RelationshipStore()
    this.uiStore = new UIStore()
  }
}

// Create a single instance of the root store
const rootStore = new RootStore()

export default rootStore