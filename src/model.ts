import {
  EventMessage,
  AggregateRoot,
  EventNames,
  OrderCreatedEvent,
  OrderFinishedEvent,
  AddItemsToOrderEvent,
  RemoveItemsFromOrderEvent
} from './types'
import cuid, { isCuid } from 'cuid'

export class Order implements AggregateRoot {
  id = ''
  version: number = -1
  finished = false
  items: number = 0
  events: EventMessage[] = []
  static readonly AGGREGATE_NAME = 'ORDER'

  eventHandlers: { [key: string]: (event: EventMessage) => void } = {}
  constructor() {
    this.apply = this.apply.bind(this)
    this.applyCreatedEvent = this.applyCreatedEvent.bind(this)
    this.applyFinishedEvent = this.applyFinishedEvent.bind(this)
    this.applyAddItemsEvent = this.applyAddItemsEvent.bind(this)
    this.applyRemoveItemsEvent = this.applyRemoveItemsEvent.bind(this)

    this.register(EventNames.ORDER_CREATED, e => this.applyCreatedEvent(e as OrderCreatedEvent))
    this.register(EventNames.ORDER_FINISHED, e => this.applyFinishedEvent(e as OrderFinishedEvent) )
    this.register(EventNames.ORDER_ADD_ITEMS, e => this.applyAddItemsEvent(e as AddItemsToOrderEvent))
    this.register(EventNames.ORDER_REMOVE_ITEMS, e => this.applyRemoveItemsEvent(e as RemoveItemsFromOrderEvent))
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

  private applyCreatedEvent(event: OrderCreatedEvent) {
    this.id = event.id
  }

  private applyFinishedEvent(event: OrderFinishedEvent) {
    this.finished = true
  }

  private applyAddItemsEvent(event: AddItemsToOrderEvent) {
    this.items += event.payload.items.length
  }

  private applyRemoveItemsEvent(event: RemoveItemsFromOrderEvent) {
    this.items -= event.payload.items.length
  }
}

function makeCreateEventMessage (id: string, index: number): OrderCreatedEvent {
  return {
    name: EventNames.ORDER_CREATED,
    id,
    index,
    payload: {}
  }
}

function makeFinishEvent (id: string, index: number): OrderFinishedEvent {
  return {
    name: EventNames.ORDER_FINISHED,
    id,
    index,
    payload: {}
  }
}

function makeAddItems (id: string, index: number, items: []): AddItemsToOrderEvent {
  return {
    name: EventNames.ORDER_ADD_ITEMS,
    id,
    index,
    payload: {
      items
    }
  }
}

function makeRemoveItems (id: string, index: number, items: []): RemoveItemsFromOrderEvent {
  return {
    name: EventNames.ORDER_REMOVE_ITEMS,
    id,
    index,
    payload: {
      items
    }
  }
}