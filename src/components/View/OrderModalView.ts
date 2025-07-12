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
	private currentAddress = '';
	private currentPayment = '';

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
				this.currentPayment = item.name;
				this.events.emit('payment:select', { method: item.name });
			});
		});
		this.form.addEventListener('input', (event: Event) => {
			const target = event.target as HTMLInputElement;
			if (target && target.name === 'address') {
				this.currentAddress = target.value;
				this.events.emit('order:changeAddress', {
					field: 'address',
					value: target.value,
				});
			}
		});
		this.form.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.events.emit('order:submit');
		});
	}

	updatePaymentSelection(method: string) {
		this.buttonAll.forEach((btn) => {
			btn.classList.toggle('button_alt-active', btn.name === method);
		});
	}

	setError(error: string) {
		super.setError(error);
	}

	setSubmitEnabled(enabled: boolean) {
		this.submitButton.disabled = !enabled;
	}
}

export class ContactsModalView extends FormView {
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
				this.events.emit('contacts:changeInput', { field, value });
			});
		});
		this.form.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.events.emit('contacts:submit');
		});
	}

	setError(error: string) {
		super.setError(error);
	}

	setSubmitEnabled(enabled: boolean) {
		this.submitButton.disabled = !enabled;
	}
}
