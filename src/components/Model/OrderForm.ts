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
	getOrderRequest(total: number, items: string[]): IOrderRequest;
}

export class OrderForm implements IOrderFormContract {
	payment = '';
	email = '';
	phone = '';
	address = '';

	constructor(protected events: IEvents) {}

	setAddress(value: string) {
		this.address = value;
	}

	setPayment(value: string) {
		this.payment = value;
	}

	setEmail(value: string) {
		this.email = value;
	}

	setPhone(value: string) {
		this.phone = value;
	}

	clear() {
		this.payment = '';
		this.email = '';
		this.phone = '';
		this.address = '';
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
}
