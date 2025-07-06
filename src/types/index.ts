// Интерфейс для карточки товара
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

// Интерфейс для действий
export interface IActions {
  onClick: (event: MouseEvent) => void;
}

// Интерфейс для формы заказа
export interface IOrderForm {
  address?: string;
  phone?: string;
  email?: string;
  payment?: string;
  total?: string | number;
}

// Заказ
export interface IOrder extends IOrderForm {
  items: string[];
}

// Заказ для отправки на сервер
export interface IOrderRequest {
  email: string;
  phone: string;
  payment: string;
  address: string;
  items: string[];
  total: number;
}

// Результат оформления заказа
export interface IOrderResult {
  id: string;
  total: number;
}

// Тип ошибок формы
export type FormErrors = Partial<Record<keyof IOrder, string>>;
