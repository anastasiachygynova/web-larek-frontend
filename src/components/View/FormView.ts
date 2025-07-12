import { IEvents } from '../base/events';

export class FormView {
	form: HTMLFormElement;
	inputs: HTMLInputElement[];
	submitButton: HTMLButtonElement;
	errors: HTMLElement;
	protected events: IEvents;

	constructor(
		template: HTMLTemplateElement,
		events: IEvents,
		selectors: {
			form: string;
			input: string;
			button: string;
			errors: string;
		}
	) {
		this.events = events;
		const formElement = template.content.querySelector(selectors.form);
		if (!formElement) {
			throw new Error(
				`Form element with selector ${selectors.form} not found in template`
			);
		}
		this.form = (formElement as HTMLFormElement).cloneNode(
			true
		) as HTMLFormElement;
		this.inputs = Array.from(this.form.querySelectorAll(selectors.input));
		this.submitButton = this.form.querySelector(selectors.button);
		this.errors = this.form.querySelector(selectors.errors);
	}

	set valid(value: boolean) {
		this.submitButton.disabled = !value;
	}

	setError(message: string) {
		if (this.errors) {
			this.errors.textContent = message;
			if (message) {
				this.errors.style.display = 'block';
			} else {
				this.errors.style.display = 'none';
			}
		}
	}

	clearError() {
		this.setError('');
	}

	get formElement() {
		return this.form;
	}
	get errorElement() {
		return this.errors;
	}
	get submitBtn() {
		return this.submitButton;
	}
	render() {
		return this.form;
	}
}
