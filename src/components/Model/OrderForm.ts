import { IEvents } from '../base/events';
import { IOrderRequest } from '../../types';

export interface IOrderFormContract {
	address: string;
	email: string;
	phone: string;
	payment: string;
	setAddress(value: string): void;
	setPayment(value: string): void;
	setEmail(value: string): void;
	setPhone(value: string): void;
	clear(): void;
	getState(): { payment: string; email: string; phone: string; address: string };
	getOrderRequest(total: number, items: string[]): IOrderRequest;
}

export class OrderForm implements IOrderFormContract {
	payment = '';
	email = '';
	phone = '';
	address = '';

	constructor(protected events: IEvents) {}

	getState(): { payment: string; email: string; phone: string; address: string } {
		return {
			payment: this.payment,
			email: this.email,
			phone: this.phone,
			address: this.address,
		};
	}

	setAddress(value: string) {
		this.address = value;
		this.events.emit('orderForm:changed', this.getState());
	}

	setPayment(value: string) {
		this.payment = value;
		this.events.emit('orderForm:changed', this.getState());
	}

	setEmail(value: string) {
		this.email = value;
		this.events.emit('orderForm:changed', this.getState());
	}

	setPhone(value: string) {
		this.phone = value;
		this.events.emit('orderForm:changed', this.getState());
	}

	clear() {
		this.payment = '';
		this.email = '';
		this.phone = '';
		this.address = '';
		this.events.emit('orderForm:changed', this.getState());
	}

	getOrderRequest(total: number, items: string[]): IOrderRequest {
		return {
			payment: this.payment,
			email: this.email,
			phone: this.phone,
			address: this.address,
			total,
			items,
		};
	}

	validateAddress(address: string, payment?: string): string | null {
		
		if (!payment) {
			return null;
		}
		if (!address || !address.trim()) {
			return 'Необходимо указать адрес';
		}
		return null;
	}

	validatePayment(payment: string): string | null {
		if (!payment) {
			return 'Необходимо выбрать способ оплаты';
		}
		return null;
	}

	validateEmail(email: string): string | null {
		if (!email || !email.trim()) {
			return 'Необходимо указать email';
		}
		return null;
	}

	validatePhone(phone: string): string | null {
		if (!phone || !phone.trim()) {
			return 'Необходимо указать телефон';
		}

		return null;
	}

	validateAll() {
		const errors: Record<string, string> = {};
		const addressError = this.validateAddress(this.address);
		if (addressError) errors.address = addressError;
		const paymentError = this.validatePayment(this.payment);
		if (paymentError) errors.payment = paymentError;
		const emailError = this.validateEmail(this.email);
		if (emailError) errors.email = emailError;
		const phoneError = this.validatePhone(this.phone);
		if (phoneError) errors.phone = phoneError;
		const isValid = Object.keys(errors).length === 0;
		return { errors, isValid };
	}

	validatePaymentStep() {
		const errors: Record<string, string> = {};
		const paymentError = this.validatePayment(this.payment);
		if (paymentError) errors.payment = paymentError;
		const addressError = this.validateAddress(this.address, this.payment);
		if (addressError) errors.address = addressError;
		const isValid = Object.keys(errors).length === 0;
		return { errors, isValid };
	}

	validateContactsStep() {
		const errors: Record<string, string> = {};
		const emailError = this.validateEmail(this.email);
		if (emailError) errors.email = emailError;
		const phoneError = this.validatePhone(this.phone);
		if (phoneError) errors.phone = phoneError;
		const isValid = Object.keys(errors).length === 0;
		return { errors, isValid };
	}
}
