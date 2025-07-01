import { Order } from '../../types';

export class OrderForm {
	private address: string = '';
	private payment: 'card' | 'cash' = 'card';
	private email: string = '';
	private phone: string = '';

	constructor() {
		//
	}

	setDeliveryAddress(address: string): void {}

	setPaymentMethod(payment: 'card' | 'cash'): void {}

	validateContacts(email: string, phone: string): boolean {}

	validateOrder(address: string, payment: string): boolean {}

	getOrderData(): {
		address: string;
		payment: 'card' | 'cash';
		email: string;
		phone: string;
	} {}
}
