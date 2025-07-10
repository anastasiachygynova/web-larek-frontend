import { EventEmitter } from '../base/events';
import { ProductPreview } from '../View/ProductPreview';
import { BasketView } from '../View/BasketView';
import { ModalView } from '../View/ModalView';
import { PaymentModalView, ContactsModalView } from '../View/OrderModalView';
import { OrderSuccessModal } from '../View/OrderSuccessModal';
import { ApiModel } from '../Model/ApiModel';
import { BasketModel } from '../Model/BasketModel';
import { OrderForm } from '../Model/OrderForm';
import { IProduct } from '../../types';
import { ensureElement } from '../../utils/utils';
import { DataCatalog } from '../Model/DataCatalog';
import { OrderModalView } from '../View/OrderModalView';

export class AppPresenter {
	private products: IProduct[] = [];
	private basketView: BasketView;
	private eventEmitter: EventEmitter;
	private apiModel: ApiModel;
	private basketModel: BasketModel;
	private dataCatalog: DataCatalog;
	private modal: ModalView;
	private orderForm: OrderForm;
	private currentPaymentModalView: any = null;
	private currentContactsModalView: any = null;

	constructor(
		eventEmitter: EventEmitter,
		apiModel: ApiModel,
		basketModel: BasketModel,
		dataModel: DataCatalog
	) {
		this.eventEmitter = eventEmitter;
		this.apiModel = apiModel;
		this.basketModel = basketModel;
		this.dataCatalog = dataModel;
		this.orderForm = new OrderForm(eventEmitter);
		const headerButton = document.querySelector(
			'.header__basket'
		) as HTMLButtonElement;
		const headerCounter = document.querySelector(
			'.header__basket-counter'
		) as HTMLElement;
		this.basketView = new BasketView(
			document.querySelector('#basket') as HTMLTemplateElement,
			eventEmitter,
			headerButton,
			headerCounter
		);
		this.modal = new ModalView(
			ensureElement<HTMLElement>('#modal-container'),
			eventEmitter
		);
		this.init();
		this.setupEventListeners();
	}

	private isValidProduct(item: IProduct): boolean {
		return !!item && !!item.id && !!item.title;
	}

	private async init() {
		try {
			this.products = await this.apiModel.getProductList();
			this.products = this.products.filter(this.isValidProduct);
			this.dataCatalog.products = this.products;
			this.setupBasketButton();
		} catch (error) {
			// Ошибка загрузки товаров
		}
	}

	private setupEventListeners() {
		const on = this.eventEmitter.on.bind(this.eventEmitter);

		on('basket:update', this.updateBasketCounter.bind(this));
		on('card:select', (item: IProduct) => this.isValidProduct(item) && this.openProductModal(item));
		on('card:addBasket', (item: IProduct) => {
			if (this.isValidProduct(item)) {
				this.basketModel.addProduct(item);
				this.updateBasketCounter();
				this.modal.close();
			}
		});
		on('basket:open', this.openBasketModal.bind(this));
		on('order:open', () => {
			this.fillOrderForm();
			this.openOrderModal();
		});
		on('contacts:open', this.openContactsModal.bind(this));
		on('success:open', this.openSuccessModal.bind(this));
		on('success:close', () => {
			this.modal.close();
			this.basketModel.clear();
			this.orderForm.clear();
			this.updateBasketCounter();
		});
		on('order:paymentSelection', (button: HTMLButtonElement) => {
			this.orderForm.setPayment(button.name);
			this.currentPaymentModalView?.updateButtonState();
		});
		on('order:changeAddress', (data: { field: string; value: string }) => {
			if (data.field === 'address') {
				this.orderForm.setAddress(data.value);
				this.currentPaymentModalView?.updateButtonState();
			}
		});
		on('contacts:changeInput', (data: { field: string; value: string }) => {
			if (data.field === 'email') this.orderForm.setEmail(data.value);
			else if (data.field === 'phone') this.orderForm.setPhone(data.value);
		});
		on('formErrors:address', (errors: any) => {
			this.currentPaymentModalView && this.handleFormErrors(errors, this.currentPaymentModalView.buttonSubmit);
		});
		on('formErrors:change', (payload: any) => {
			this.currentContactsModalView && this.handleFormErrors(payload.errors, this.currentContactsModalView.buttonSubmit, payload.isValid);
		});
		on('card:removeBasket', (item: IProduct) => {
			if (this.isValidProduct(item)) {
				this.basketModel.removeProduct(item);
				this.updateBasketCounter();
				this.openProductModal(item);
			}
		});
	}

	private createBasketItemElement(item: IProduct, index: number, tplCardBasket: HTMLTemplateElement): HTMLElement | null {
		if (!this.isValidProduct(item)) return null;
		const cardElement = tplCardBasket.content.querySelector('.basket__item').cloneNode(true) as HTMLElement;
		cardElement.querySelector('.basket__item-index').textContent = String(index + 1);
		cardElement.querySelector('.card__title').textContent = item.title;
		cardElement.querySelector('.card__price').textContent = `${item.price ?? 0} синапсов`;
		cardElement.querySelector('.basket__item-delete').addEventListener('click', () => {
			this.basketModel.removeProduct(item);
			this.updateBasketCounter();
			this.openBasketModal();
		});
		return cardElement;
	}

	private setupBasketButton() {
		const basketButton = document.querySelector('.header__basket');
		if (basketButton) {
			basketButton.addEventListener('click', () => {
				this.eventEmitter.emit('basket:open');
			});
			this.updateBasketCounter();
		}
	}

	private updateBasketCounter() {
		if (this.basketView.headerCounter) {
			this.basketView.headerCounter.textContent = this.basketModel
				.getCount()
				.toString();
		}
	}

	private openProductModal(item: IProduct) {
		if (!this.isValidProduct(item)) {
			return;
		}

		const tplProductPreview = document.querySelector(
			'#card-preview'
		) as HTMLTemplateElement;
		if (!tplProductPreview) {
			return;
		}

		const productPreview = new ProductPreview(
			tplProductPreview,
			this.eventEmitter
		);

		this.modal.content = productPreview.render(item, this.basketModel.items);
		this.modal.render();
	}

	private openBasketModal() {
		this.basketModel.cleanInvalidItems();
		const basketItems = this.basketModel.items;
		const tplCardBasket = this.getTemplate('#card-basket');
		if (!tplCardBasket) return;
		const itemElements = basketItems
			.map((item, index) => this.createBasketItemElement(item, index, tplCardBasket))
			.filter(Boolean) as HTMLElement[];
		this.basketView.items = itemElements;
		this.basketView.updateTotalPrice(this.basketModel.getTotal());
		this.modal.content = this.basketView.render();
		this.modal.render();
	}

	private openOrderModal() {
		const modalContent = document.querySelector(
			'#modal-container .modal__content'
		) as HTMLElement;
		const orderModalView = new OrderModalView(modalContent);

		const tplOrder = this.getTemplate('#order');
		const tplContacts = this.getTemplate('#contacts');
		const paymentView = new PaymentModalView(tplOrder, this.eventEmitter);
		const contactsView = new ContactsModalView(tplContacts, this.eventEmitter);

		this.currentPaymentModalView = paymentView;

		const presenter = new OrderModalPresenter(
			orderModalView,
			paymentView,
			contactsView,
			this.orderForm,
			this.eventEmitter
		);
		presenter.start();
		this.modal.open();
	}

	private openContactsModal() {
		const tplContacts = this.getTemplate('#contacts');
		if (!tplContacts) return;
		const contactsModal = new ContactsModalView(tplContacts, this.eventEmitter);
		this.currentContactsModalView = contactsModal;
		this.modal.content = contactsModal.render();
		this.modal.render();
	}

	private openSuccessModal() {
		const tplSuccess = document.querySelector(
			'#success'
		) as HTMLTemplateElement;
		if (!tplSuccess) {
			return;
		}

		const successModal = new OrderSuccessModal(tplSuccess, this.eventEmitter);
		this.modal.content = successModal.render(this.basketModel.getTotal());
		this.modal.render();
	}

	private fillOrderForm() {
		this.basketModel.cleanInvalidItems();
	}

	private showFormErrors(errors: Record<string, string>) {
		const errorsElement = document.querySelector(
			'.form__errors'
		) as HTMLElement;
		if (errorsElement) {
			if (Object.keys(errors).length > 0) {
				const errorMessages = Object.values(errors).join(', ');
				errorsElement.textContent = errorMessages;
				errorsElement.style.display = 'block';
			} else {
				errorsElement.textContent = '';
				errorsElement.style.display = 'none';
			}
		}
	}

	private getTemplate(selector: string): HTMLTemplateElement | null {
		const tpl = document.querySelector(selector) as HTMLTemplateElement;
		return tpl || null;
	}

	private handleFormErrors(
		errors: Record<string, string>,
		button: HTMLButtonElement | null,
		isValid?: boolean
	) {
		if (button) {
			button.disabled =
				typeof isValid === 'boolean'
					? !isValid
					: Object.keys(errors).length !== 0;
		}
		if (
			this.currentContactsModalView &&
			typeof this.currentContactsModalView.setError === 'function'
		) {
			const errorMessages = Object.values(errors).filter(Boolean).join(', ');
			if (Object.keys(errors).length > 0) {
				this.currentContactsModalView.setError(errorMessages);
			} else if (isValid) {
				if (typeof this.currentContactsModalView.clearError === 'function') {
					this.currentContactsModalView.clearError();
				}
			}
		} else {
			this.showFormErrors(errors);
		}
	}
}

class OrderModalPresenter {
	private view: OrderModalView;
	private paymentView: PaymentModalView;
	private contactsView: ContactsModalView;
	private orderForm: OrderForm;
	private eventEmitter: EventEmitter;

	constructor(
		view: OrderModalView,
		paymentView: PaymentModalView,
		contactsView: ContactsModalView,
		orderForm: OrderForm,
		eventEmitter: EventEmitter
	) {
		this.view = view;
		this.paymentView = paymentView;
		this.contactsView = contactsView;
		this.orderForm = orderForm;
		this.eventEmitter = eventEmitter;

		this.paymentView.formElement.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.showContacts();
		});
		this.contactsView.formElement.addEventListener('submit', (e: Event) => {
			e.preventDefault();
		});

		this.eventEmitter.on('payment:select', (payload: { method: string }) => {
			this.orderForm.setPayment(payload.method);
			this.paymentView.updatePaymentSelection(this.orderForm.payment);
			this.paymentView.updateButtonState();
		});

		this.eventEmitter.on('formErrors:address', (errors: any) => {
			const isValid =
				Object.keys(errors).length === 0 &&
				!!this.orderForm.payment &&
				!!this.orderForm.address;
			this.paymentView.valid = isValid;
		});
	}

	start() {
		this.showPayment();
		this.paymentView.updateButtonState();
	}

	showPayment() {
		this.view.show(this.paymentView.render());
	}

	showContacts() {
		this.view.show(this.contactsView.render());
	}
}
