// Типы данных из API

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  image: string;
}

// Производный тип для отображения товара на экране
export interface ProductView extends Product {
  priceFormatted: string;
  isInCart: boolean;
}

export interface Order {
  id: string;
  items: string[];
  total: number;
  address: string;
  email: string;
  phone: string;
  payment: 'card' | 'cash';
}

export interface OrderView extends Order {
  totalFormatted: string;
  paymentLabel: string;
}

export interface User {
  address: string;
  email: string;
  phone: string;
  payment: 'card' | 'cash';
}

// Интерфейс API-клиента

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApiClient {
  get<T = unknown>(uri: string): Promise<T>;
  post<T = unknown>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

export type ApiListResponse<Type> = {
  total: number;
  items: Type[];
};

// Интерфейсы базовых классов

export type EventName = string | RegExp;
export type Subscriber = (...args: unknown[]) => void;

export interface IEvents {
  on<T = unknown>(event: EventName, callback: (data: T) => void): void;
  off(event: EventName, callback: Subscriber): void;
  emit<T = unknown>(event: string, data?: T): void;
  onAll?(callback: (event: EmitterEvent) => void): void;
  offAll?(): void;
  trigger?<T = unknown>(event: string, context?: Partial<T>): (data: T) => void;
}

export interface EmitterEvent<T = unknown> {
  eventName: string;
  data: T;
}

// События и их интерфейсы

export enum AppEvent {
  ProductAdded = 'product:added', // Товар добавлен в корзину
  ProductRemoved = 'product:removed', // Товар удалён из корзины
  OrderCreated = 'order:created', // Заказ успешно оформлен
  ProductSelected = 'product:selected', // Открыта карточка товара
  CartOpened = 'cart:opened', // Открыта корзина
  CartClosed = 'cart:closed', // Закрыта корзина
  CartCleared = 'cart:cleared', // Корзина очищена
  OrderSubmitted = 'order:submitted', // Пользователь отправил форму заказа
  OrderCancelled = 'order:cancelled', // Заказ отменён пользователем
  PaymentMethodChanged = 'payment:changed', // Изменён способ оплаты
  ModalOpened = 'modal:opened', // Открыто модальное окно
  ModalClosed = 'modal:closed', // Закрыто модальное окно
}

// Вспомогательные типы

export type SelectorCollection<T> = string | NodeListOf<Element> | T[];
export type SelectorElement<T> = T | string;
