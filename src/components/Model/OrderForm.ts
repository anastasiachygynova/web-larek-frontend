import { IEvents } from '../base/events';
import { FormErrors, IOrderRequest } from '../../types';

export interface IOrderFormContract {
  items: string[];
  address: string;
  email: string;
  phone: string;
  total: number;
  payment: string;
  formErrors: FormErrors;
  setAddress(value: string): void;
  setPayment(value: string): void;
  setEmail(value: string): void;
  setPhone(value: string): void;
  setItems(items: string[]): void;
  setTotal(total: number): void;
  clear(): void;
  validateAddressAndPayment(): boolean;
  validateContacts(): boolean;
  getOrderRequest(): IOrderRequest;
}

export class OrderForm implements IOrderFormContract {
  payment = '';
  email = '';
  phone = '';
  address = '';
  total = 0;
  items: string[] = [];
  formErrors: FormErrors = {};

  constructor(protected events: IEvents) {}

  setAddress(value: string) {
    this.address = value;
    if (this.validateAddressAndPayment()) {
      this.events.emit('order:ready', this.getOrderRequest());
    }
  }

  setPayment(value: string) {
    this.payment = value;
    if (this.validateAddressAndPayment()) {
      this.events.emit('order:ready', this.getOrderRequest());
    }
  }

  setEmail(value: string) {
    this.email = value;
    if (this.validateContacts()) {
      this.events.emit('order:ready', this.getOrderRequest());
    }
  }

  setPhone(value: string) {
    this.phone = value.startsWith('8') ? '+7' + value.slice(1) : value;
    if (this.validateContacts()) {
      this.events.emit('order:ready', this.getOrderRequest());
    }
  }

  setItems(items: string[]) {
    this.items = items;
  }

  setTotal(total: number) {
    this.total = total;
  }

  clear() {
    this.payment = '';
    this.email = '';
    this.phone = '';
    this.address = '';
    this.total = 0;
    this.items = [];
    this.formErrors = {};
  }

  validateAddressAndPayment(): boolean {
    const regexp = /^[а-яА-ЯёЁa-zA-Z0-9\s/.,-]{7,}$/;
    const errors: FormErrors = {};
    
    if (!this.address.trim()) {
      errors.address = 'Укажите адрес';
    } else if (!regexp.test(this.address)) {
      errors.address = 'Укажите корректный адрес';
    }
    
    if (!this.payment) {
      errors.payment = 'Выберите способ оплаты';
    }
    
    this.formErrors = errors;
    this.events.emit('formErrors:address', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  validateContacts(): boolean {
    const regexpEmail = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    const regexpPhone = /^((8|\+7)[- ]?)?(\(?\d{3}\)?[- ]?)?[\d- ]{10}$/;
    const errors: FormErrors = {};
    
    if (!this.email.trim()) {
      errors.email = 'Укажите email';
    } else if (!regexpEmail.test(this.email)) {
      errors.email = 'Введите корректный email';
    }
    
    if (!this.phone.trim()) {
      errors.phone = 'Укажите номер телефона';
    } else if (!regexpPhone.test(this.phone)) {
      errors.phone = 'Введите корректный номер телефона';
    }
    
    this.formErrors = errors;
    this.events.emit('formErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  getOrderRequest(): IOrderRequest {
    return {
      payment: this.payment,
      email: this.email,
      phone: this.phone,
      address: this.address,
      total: this.total,
      items: this.items,
    };
  }
}
