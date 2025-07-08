import { IEvents } from '../base/events';


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

// Единый интерфейс для управления заказом
export interface IOrderModal {
  currentStep: 'payment' | 'contacts';
  paymentView: PaymentModalView;
  contactsView: ContactsModalView;
  setStep(step: 'payment' | 'contacts'): void;
  render(): HTMLElement;
}


export class OrderModalView implements IOrderModal {
  currentStep: 'payment' | 'contacts' = 'payment';
  paymentView: PaymentModalView;
  contactsView: ContactsModalView;

  constructor(
    paymentTemplate: HTMLTemplateElement,
    contactsTemplate: HTMLTemplateElement,
    protected events: IEvents
  ) {
    this.paymentView = new PaymentModalView(paymentTemplate, events);
    this.contactsView = new ContactsModalView(contactsTemplate, events);
  }

  setStep(step: 'payment' | 'contacts') {
    this.currentStep = step;
  }

  render(): HTMLElement {
    if (this.currentStep === 'payment') {
      return this.paymentView.render();
    } else {
      return this.contactsView.render();
    }
  }
}


export class PaymentModalView implements IOrder {
	formOrder: HTMLFormElement;
	buttonAll: HTMLButtonElement[];
	buttonSubmit: HTMLButtonElement;
	formErrors: HTMLElement;

	constructor(template: HTMLTemplateElement, protected events: IEvents) {
		this.formOrder = template.content
			.querySelector('.form')
			.cloneNode(true) as HTMLFormElement;
		this.buttonAll = Array.from(this.formOrder.querySelectorAll('.button_alt'));
		this.buttonSubmit = this.formOrder.querySelector('.order__button');
		this.formErrors = this.formOrder.querySelector('.form__errors');

		this.buttonAll.forEach((item) => {
			item.addEventListener('click', () => {
				this.paymentSelection = item.name;
				this.events.emit('order:paymentSelection', item);
			});
		});

		this.formOrder.addEventListener('input', (event: Event) => {
			const target = event.target as HTMLInputElement;
			if (target && target.name === 'address') {
				this.events.emit('order:changeAddress', { field: 'address', value: target.value });
			}
		});

		this.formOrder.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			if (this.buttonSubmit.disabled) {
				return;
			}
			this.events.emit('contacts:open');
		});
	}

	set paymentSelection(paymentMethod: string) {
		this.buttonAll.forEach((item) => {
			item.classList.toggle('button_alt-active', item.name === paymentMethod);
		});
	}

	set valid(value: boolean) {
		this.buttonSubmit.disabled = !value;
	}

	render() {
		return this.formOrder;
	}
}


export class ContactsModalView implements IContactsModal {
  formContacts: HTMLFormElement;
  inputAll: HTMLInputElement[];
  buttonSubmit: HTMLButtonElement;
  formErrors: HTMLElement;

  constructor(template: HTMLTemplateElement, protected events: IEvents) {
    this.formContacts = template.content.querySelector('.form').cloneNode(true) as HTMLFormElement;
    this.inputAll = Array.from(this.formContacts.querySelectorAll('.form__input'));
    this.buttonSubmit = this.formContacts.querySelector('.button');
    this.formErrors = this.formContacts.querySelector('.form__errors');

    this.inputAll.forEach(item => {
      item.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        const field = target.name;
        const value = target.value;
        this.events.emit(`contacts:changeInput`, { field, value });
      });
    });

    this.formContacts.addEventListener('submit', (event: Event) => {
      event.preventDefault();
      this.events.emit('success:open');
    });
  }

  set valid(value: boolean) {
    this.buttonSubmit.disabled = !value;
  }

  render() {
    return this.formContacts;
  }
} 