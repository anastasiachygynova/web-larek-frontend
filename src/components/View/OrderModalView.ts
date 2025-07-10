import { IEvents } from '../base/events';
import { FormView } from './FormView';

export interface IOrder {
	formOrder: HTMLFormElement;
	buttonAll: HTMLButtonElement[];
	paymentSelection: string;
	formErrors: HTMLElement;
	render(): HTMLElement;
}

export interface IContactsModal {
	formContacts: HTMLFormElement;
	inputAll: HTMLInputElement[];
	buttonSubmit: HTMLButtonElement;
	formErrors: HTMLElement;
	render(): HTMLElement;
}

export class OrderModalView {
	private container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	show(content: HTMLElement) {
		this.container.innerHTML = '';
		this.container.appendChild(content);
	}
}

export class PaymentModalView extends FormView {
	buttonAll: HTMLButtonElement[];
	paymentSelection = '';
	private touchedAddress = false;

	constructor(template: HTMLTemplateElement, events: IEvents) {
		super(template, events, {
			form: '.form',
			input: '.form__input',
			button: '.order__button',
			errors: '.form__errors'
		});
		this.buttonAll = Array.from(this.form.querySelectorAll('.button_alt'));
		this.buttonAll.forEach((item) => {
			item.addEventListener('click', () => {
				this.touchedAddress = true;
				this.events.emit('payment:select', { method: item.name });
				this.updateButtonState();
			});
		});
		this.form.addEventListener('input', (event: Event) => {
			const target = event.target as HTMLInputElement;
			if (target && target.name === 'address') {
				this.events.emit('order:changeAddress', {
					field: 'address',
					value: target.value,
				});
			}
		});
		this.form.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			if (this.submitButton.disabled) {
				return;
			}
			this.events.emit('contacts:open');
		});
	}

	updatePaymentSelection(method: string) {
		this.paymentSelection = method;
		this.buttonAll.forEach((btn) => {
			btn.classList.toggle('button_alt-active', btn.name === method);
		});
	}

	updateButtonState() {
		const address = this.inputs.find((i) => i.name === 'address')?.value.trim() || '';
		const paymentSelected = this.buttonAll.some((btn) => btn.classList.contains('button_alt-active'));
		let valid = true;
		let error = '';

		if (!address) {
			valid = false;
			if (this.touchedAddress) error = 'Необходимо указать адрес';
		} else if (!paymentSelected) {
			valid = false;
			error = 'Необходимо выбрать способ оплаты';
		}

		this.setError(error);
		this.submitButton.disabled = !valid;
	}
}

export class ContactsModalView extends FormView {
	private touchedEmail = false;
	private touchedPhone = false;

	constructor(template: HTMLTemplateElement, events: IEvents) {
		super(template, events, {
			form: '.form',
			input: '.form__input',
			button: '.button',
			errors: '.form__errors'
		});
		this.inputs.forEach((item) => {
			item.addEventListener('input', (event) => {
				const target = event.target as HTMLInputElement;
				const field = target.name;
				const value = target.value;
				this.events.emit(`contacts:changeInput`, { field, value });
				this.updateButtonState();
			});
			item.addEventListener('blur', (event) => {
				const target = event.target as HTMLInputElement;
				if (target.name === 'email') {
					this.touchedEmail = true;
				} else if (target.name === 'phone') {
					this.touchedPhone = true;
				}
				this.updateButtonState();
			});
		});
		this.form.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.events.emit('success:open');
		});
		this.updateButtonState();
	}

	validateEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	validatePhone(phone: string): boolean {
		
		const digits = phone.replace(/\D/g, '');
		return digits.length >= 10;
	}

	updateButtonState() {
		const email = this.inputs.find((i) => i.name === 'email')?.value.trim() || '';
		const phone = this.inputs.find((i) => i.name === 'phone')?.value.trim() || '';
		let valid = true;
		let error = '';

		if (!email) {
			valid = false;
			if (phone) error = 'Необходимо указать email';
		} else if (!this.validateEmail(email)) {
			valid = false;
			if (this.touchedEmail) error = 'Некорректный email';
		} else if (!phone) {
			valid = false;
			if (this.touchedPhone) error = 'Необходимо указать телефон';
		} else if (!this.validatePhone(phone)) {
			valid = false;
			if (this.touchedPhone) error = 'Некорректный телефон';
		}

		this.setError(error);
		this.submitButton.disabled = !valid;
	}
}
