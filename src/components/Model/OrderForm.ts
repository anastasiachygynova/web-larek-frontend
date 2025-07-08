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
		this.validateAddressAndPayment();
	}

	setPayment(value: string) {
		this.payment = value;
		this.validateAddressAndPayment();
	}

	setEmail(value: string) {
		this.email = value;
		this.validateContacts();
	}

	setPhone(value: string) {
		const digits = value.replace(/\D/g, '');
		if (value.startsWith('+7') && /^\+7\d{10}$/.test(value)) {
			this.phone = value;
		} else if (digits.length === 11 && digits.startsWith('7')) {
			this.phone = '+7' + digits.slice(1);
		} else {
			this.phone = '';
		}
		this.validateContacts();
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

	private handleValidation(
		errors: FormErrors,
		eventName: string
	): boolean {
		this.formErrors = errors;
		this.events.emit(eventName, this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateAddressAndPayment(): boolean {
		const errors: FormErrors = {};
		const addressTrimmed = this.address.trim();

		if (!addressTrimmed) {
			errors.address = 'Необходимо указать адрес';
		} else if (addressTrimmed.length < 10) {
			errors.address = 'Адрес должен содержать минимум 10 символов';
		}

		if (Object.keys(errors).length === 0) {
			if (!this.payment) {
				errors.payment = 'Необходимо указать способ оплаты';
			}
		}

		return this.handleValidation(errors, 'formErrors:address');
	}

	validateContacts(): boolean {
		const errors: FormErrors = {};

		const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;

		if (!this.email.trim()) {
			return false;
		} else if (!emailRegex.test(this.email.trim())) {
			errors.email = 'Введите корректный email';
		}

		function isValidPhone(phone: string): boolean {
			return /^\+7\d{10}$/.test(phone);
		}

		if (!this.phone.trim()) {
			return false;
		} else if (!isValidPhone(this.phone)) {
			errors.phone = 'Введите номер в формате +7XXXXXXXXXX';
		}

		const isValid = (
			this.email.trim() &&
			this.phone.trim() &&
			Object.keys(errors).length === 0
		);

		this.formErrors = errors;
		this.events.emit('formErrors:change', { errors: this.formErrors, isValid });
		return isValid;
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
