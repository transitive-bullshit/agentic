import inquirer from 'inquirer'

class HumanFeedback {
  private completions: string[]
  private selectedCompletion: string

  // Process the completions returned by the AI
  process(completions: string[]) {
    this.completions = completions
    return this
  }

  // Request feedback from the user
  async requestFeedback() {
    const choices = this.completions.map((completion, index) => ({
      name: completion,
      value: index
    }))

    const feedback = await inquirer.prompt([
      {
        type: 'list',
        name: 'userResponse',
        message: 'Pick the best completion:',
        choices: [...choices, new inquirer.Separator(), 'Retry', 'Decline']
      }
    ])

    switch (feedback.userResponse) {
      case 'Retry':
        return true
      case 'Decline':
        return process.exit(0)
      default:
        this.selectedCompletion = this.completions[feedback.userResponse]
        return false
    }
  }

  // Return the selected completion
  getResult() {
    return this.selectedCompletion
  }
}

export { HumanFeedback }
