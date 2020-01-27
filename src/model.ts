import { EventMessage, AggregateRoot, Command } from './types'
import cuid, { isCuid } from 'cuid'

export class Order implements AggregateRoot {
  id = ''
  version: number = -1
  finished = false
  items: number = 0
  events: EventMessage[] = []
  static readonly AGGREGATE_NAME = 'ORDER'

  eventHandlers: { [key: string]: (event: EventMessage) => void } = {}
  commandHandlers: { [key: string]: (command: Command) => void } = {}
  constructor() {
    this.apply = this.apply.bind(this)
    this.register = this.register.bind(this)
    this.addItems = this.addItems.bind(this)
    this.removeItems = this.removeItems.bind(this)
    this.applyCreatedEvent = this.applyCreatedEvent.bind(this)
    this.applyFinishedEvent = this.applyFinishedEvent.bind(this)
    this.applyAddItemsEvent = this.applyAddItemsEvent.bind(this)
    this.applyRemoveItemsEvent = this.applyRemoveItemsEvent.bind(this)

    this.register('ORDER_CREATED', this.applyCreatedEvent)
    this.register('ORDER_FINISHED', this.applyFinishedEvent)
    this.register('ORDER_ADD_ITEMS', this.applyAddItemsEvent)
    this.register('ORDER_REMOVE_ITEMS', this.applyRemoveItemsEvent)
  }

  apply(event: EventMessage) {
    this.eventHandlers[event.name](event)
    this.version = event.index
    this.events.push(event)
  }

  register(name: string, handler: (event: EventMessage) => void) {
    this.eventHandlers[name] = handler;
  }

  create(id = cuid()) {
    if (!isCuid(id)) {
      throw new Error('Id is not valid.')
    }
    this.apply(makeCreateEventMessage(
      id,
      0
    ))
  }

  addItems(items: []) {
    if (this.finished) {
      throw new Error('Cannot add items to finished order.')
    }
    this.apply(makeAddItems(this.id, this.version + 1, items))
  }

  removeItems(items: []) {
    if (this.items < items.length) {
      throw new Error('Cannot remove more items that in order.')
    }
    if (this.finished) {
      throw new Error('Cannot remove items from finished order.')
    }
    this.apply(makeRemoveItems(this.id, this.version + 1, items))
  }

  finish() {
    if (this.finished) {
      throw new Error('Order already finished.')
    }
    this.apply(makeFinishEvent(this.id, this.version + 1))
  }

  private applyCreatedEvent(event: EventMessage) {
    this.id = event.id
  }

  private applyFinishedEvent(event: EventMessage) {
    this.finished = true
  }

  private applyAddItemsEvent(event: EventMessage) {
    this.items += event.payload.items.length
  }

  private applyRemoveItemsEvent(event: EventMessage) {
    this.items -= event.payload.items.length
  }
}

function makeCreateEventMessage (id: string, index: number): EventMessage {
  return {
    name: 'ORDER_CREATED',
    id,
    index,
    payload: {}
  }
}

function makeFinishEvent (id: string, index: number): EventMessage {
  return {
    name: 'ORDER_FINISHED',
    id,
    index,
    payload: {}
  }
}

function makeAddItems (id: string, index: number, items: []): EventMessage {
  return {
    name: 'ORDER_ADD_ITEMS',
    id,
    index,
    payload: {
      items
    }
  }
}

function makeRemoveItems (id: string, index: number, items: []): EventMessage {
  return {
    name: 'ORDER_REMOVE_ITEMS',
    id,
    index,
    payload: {
      items
    }
  }
}