export enum CommandNames {
  CreateOrder = 'CreateOrder',
  FinishOrder = 'FinishOrder',
  AddItemsToOrder = 'AddItemsToOrder',
  RemoveItemsFromOrder = 'RemoveItemsFromOrder'
}

export interface Command {
  name: string;
  id: string;
  payload: any;
  accepted: Date;
  created: Date;
}

export interface CreateOrder extends Command {
  name: CommandNames.CreateOrder
}

export interface FinishOrder extends Command {
  name: CommandNames.FinishOrder
}

export interface AddItemsToOrder extends Command {
  payload: {
    items: []
  };
  name: CommandNames.AddItemsToOrder
}

export interface RemoveItemsFromOrder extends Command {
  payload: {
    items: []
  };
  name: CommandNames.RemoveItemsFromOrder
}

export interface EventMessage {
  name: string;
  index: number;
  payload: any;
  id: string;
}

export enum EventNames {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_FINISHED = 'ORDER_FINISHED',
  ORDER_ADD_ITEMS = 'ORDER_ADD_ITEMS',
  ORDER_REMOVE_ITEMS = 'ORDER_REMOVE_ITEMS'
}

export interface OrderCreatedEvent extends EventMessage {
  name: EventNames.ORDER_CREATED;
}

export interface OrderFinishedEvent extends EventMessage {
  name: EventNames.ORDER_FINISHED;
}

export interface AddItemsToOrderEvent extends EventMessage {
  name: EventNames.ORDER_ADD_ITEMS;
  payload: {
    items: []
  }
}

export interface RemoveItemsFromOrderEvent extends EventMessage {
  name: EventNames.ORDER_REMOVE_ITEMS;
  payload: {
    items: []
  }
}

export interface CommandHandler {
  handle: (command: Command) => void;
}

export interface AggregateRoot {
  id: string;
  version: number;
  apply(event: EventMessage): void;
  register(name: string, handler: (event: EventMessage) => void): void;
}
