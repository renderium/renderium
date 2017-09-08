class Scheduler {
  constructor (tasks = {}) {
    this.tasks = tasks
  }

  plan (name) {
    this.tasks[name] = true
  }

  complete (name) {
    this.tasks[name] = false
  }

  should (name) {
    return Boolean(this.tasks[name])
  }
}

export default Scheduler
