import process from 'node:process'
import readline from 'node:readline'

import { bold, cyan, gray, green, red, yellow } from 'colorette'

import { SPACE } from '@/constants'

import { TaskEvent, TaskStatus } from './event'
import { SYMBOLS } from './symbols'

const consoleBuffer: any[] = []

const originalWrite = process.stdout.write
process.stdout.write = function (str: any) {
  consoleBuffer.push(str)
  return originalWrite.call(process.stdout, str)
}

const SPINNER_INTERVAL = 100
const INACTIVITY_THRESHOLD = 2000 // 2 seconds

function getSpinnerSymbol() {
  return SYMBOLS.SPINNER[
    Math.floor(Date.now() / SPINNER_INTERVAL) % SYMBOLS.SPINNER.length
  ]
}

export class TerminalTaskTracker {
  private events: Record<string, any[]> = { root: [] }
  private interval: NodeJS.Timeout | null = null
  private inactivityTimeout: NodeJS.Timeout | null = null
  private truncateOutput = false
  private renderTasks = true
  private outputs: Array<string | Uint8Array> = []

  constructor() {
    if (!process.stderr.isTTY) {
      // If stderr is not a TTY, don't render any dynamic output...
      return
    }

    this.start()
  }

  renderOutput() {
    const output = this.outputs.join('')
    process.stderr.write(output)
  }

  handleKeyPress = (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit()
    }

    if (key.ctrl && key.name === 'e') {
      this.toggleOutputTruncation()
    }

    if (key.ctrl && key.name === 'o') {
      this.renderTasks = !this.renderTasks
    }
  }

  start() {
    this.interval = setInterval(() => {
      this.render()
    }, SPINNER_INTERVAL)

    readline.emitKeypressEvents(process.stdin)

    process.stdin.setRawMode(true)

    process.stdin.on('keypress', this.handleKeyPress)

    this.startInactivityTimeout()
  }

  close() {
    if (this.interval) {
      clearInterval(this.interval)
    }

    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout)
    }

    process.stdin.setRawMode(false)

    // Remove the keypress listener:
    process.stdin.off('keypress', this.handleKeyPress)

    process.stderr.write('\n')
    process.stderr.write('\n')
    process.stderr.write('Completed all tasks.\n')
    process.stderr.write('\n')
    process.stderr.write('stdout:\n')
    process.stderr.write('\n')
    process.stderr.write(consoleBuffer.join(''))

    // Restore the original `process.stdout.write()` function:
    process.stdout.write = originalWrite

    // Pause the reading of stdin so that the Node.js process will exit once done:
    process.stdin.pause()
  }

  stringify(value: any) {
    if (this.truncateOutput) {
      const json = JSON.stringify(value)
      if (json.length < 40) {
        return json
      }

      return json.slice(0, 20) + '...' + json.slice(-20)
    }

    return JSON.stringify(value)
  }

  toggleOutputTruncation() {
    this.truncateOutput = !this.truncateOutput
  }

  startInactivityTimeout() {
    this.inactivityTimeout = setTimeout(() => {
      // Check if all tasks are completed:
      const allTasksCompleted = Object.values(this.events).every((events) =>
        events.every((event) => event.status !== TaskStatus.RUNNING)
      )

      if (allTasksCompleted) {
        this.close()
      } else {
        this.startInactivityTimeout()
      }
    }, INACTIVITY_THRESHOLD)
  }

  addEvent(event: TaskEvent) {
    const { parent = 'root', taskId, name, status, inputs, output } = event
    if (!this.events[parent]) {
      this.events[parent] = []
    }

    const existingEventIndex = this.events[parent].findIndex(
      (e) => e.taskId === taskId
    )

    if (existingEventIndex !== -1) {
      // If the event already exists, update its status and output:
      this.events[parent][existingEventIndex].status = status
      this.events[parent][existingEventIndex].output = output
    } else {
      // If the event does not exist, add it to the array:
      this.events[parent].push({ taskId, name, status, inputs })
    }
  }

  private getStatusSymbolColor(
    status: TaskStatus
  ): [string, (text: string) => string] {
    switch (status) {
      case TaskStatus.SUCCEEDED:
        return [SYMBOLS.CIRCLE, green]
      case TaskStatus.FAILED:
        return [SYMBOLS.CROSS, red]
      case TaskStatus.RETRYING:
        return [SYMBOLS.WARNING, yellow]
      case TaskStatus.RUNNING:
      default:
        return [getSpinnerSymbol(), cyan]
    }
  }

  renderTree(node: string, level = 0) {
    const indent = SPACE.repeat(level * 2)
    let lines: string[] = []

    if (this.events[node]) {
      this.events[node].forEach(({ name, status, output, inputs }) => {
        const [statusSymbol, color] = this.getStatusSymbolColor(status)

        lines.push(
          indent +
            color(statusSymbol) +
            SPACE +
            bold(name) +
            gray('(' + this.stringify(inputs) + ')')
        )

        if (this.events[name]) {
          lines = lines.concat(
            this.renderTree(name, level + 1).map((line, index, arr) => {
              if (index === arr.length - 1) {
                return indent + gray(SYMBOLS.BAR) + line
              }

              return indent + gray(SYMBOLS.BAR) + line
            })
          )
        }

        let line = ''
        if (this.events[name]) {
          line = indent + gray(SYMBOLS.BAR_END)
        }

        if (output) {
          if (status === TaskStatus.SUCCEEDED) {
            const formattedOutput = this.stringify(output)
            line +=
              indent +
              '  ' +
              gray(SYMBOLS.RIGHT_ARROW + SPACE + formattedOutput)
          } else if (status === TaskStatus.FAILED) {
            line +=
              indent + '  ' + gray(SYMBOLS.RIGHT_ARROW + SPACE + red(output))
          } else if (status === TaskStatus.RETRYING) {
            line +=
              indent + '  ' + gray(SYMBOLS.RIGHT_ARROW + SPACE + yellow(output))
          }
        }

        lines.push(line)
      })
    }

    return lines
  }

  clearAndSetCursorPosition() {
    process.stderr.cursorTo(0, 0)
    process.stderr.clearScreenDown()
  }

  clearPreviousRender(linesCount: number) {
    for (let i = 0; i < linesCount; i++) {
      process.stderr.moveCursor(0, -1)
      process.stderr.clearLine(1)
    }
  }

  writeToConsole(lines: string[]) {
    if (lines.length > 0) {
      process.stderr.write(lines.join('\n'))
    }
  }

  render() {
    this.clearAndSetCursorPosition()
    const lines = this.renderTree('root')
    if (this.renderTasks) {
      this.clearPreviousRender(lines.length + 1)
      this.writeToConsole(lines)
    } else {
      this.clearPreviousRender(lines.length + 1)
      this.writeToConsole(consoleBuffer)
    }
  }
}

export const defaultTaskTracker = new TerminalTaskTracker()
