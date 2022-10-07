export class MessageQueue {
  elements: ObjectType
  head: number
  tail: number
  constructor () {
    this.elements = {}
    this.head = 0
    this.tail = 0
  }

  enqueue (element: ObjectType) {
    this.elements[this.tail] = element
    this.tail++
  }

  dequeue () {
    const item = this.elements[this.head]
    delete this.elements[this.head]
    this.head++
    return item
  }

  peek () {
    return this.elements[this.head]
  }

  exist (message: ObjectType) {
    for (const key in this.elements) {
      const isPresent = Object.is(JSON.stringify(this.elements[key]), JSON.stringify(message))
      if (isPresent) {
        return true
      }
    }

    return false
  }

  get length () {
    return this.tail - this.head
  }

  get isEmpty () {
    return this.length === 0
  }
}
