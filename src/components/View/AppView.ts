import { EventEmitter } from '../base/events';
import { ProductPreview } from './ProductPreview';
import { BasketView } from './BasketView';
import { ModalView } from './ModalView';
import { PaymentModalView, ContactsModalView } from './OrderModalView';
import { OrderSuccessModal } from './OrderSuccessModal';
import { ApiModel } from '../Model/ApiModel';
import { BasketModel } from '../Model/BasketModel';
import { OrderForm } from '../Model/OrderForm';
import { IProduct, IOrderRequest } from '../../types';
import { ensureElement } from '../../utils/utils';
import { DataCatalog } from '../Model/DataCatalog';

export class AppView {
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
		this.basketView = new BasketView(
			document.querySelector('#basket') as HTMLTemplateElement,
			eventEmitter
		);
		this.modal = new ModalView(
			ensureElement<HTMLElement>('#modal-container'),
			eventEmitter
		);
		this.init();
		this.setupEventListeners();
	}

	private async init() {
		try {
			this.products = await this.apiModel.getProductList();
			this.products = this.products.filter(
				(product) => product && product.id && product.title
			);
			this.dataCatalog.products = this.products;
			this.setupBasketButton();
		} catch (error) {
			// Ошибка загрузки товаров
		}
	}

	private setupEventListeners() {
		this.eventEmitter.on('basket:update', () => {
			this.updateBasketCounter();
		});

		this.eventEmitter.on('card:select', (item: IProduct) => {
			if (item && item.id && item.title) {
				this.openProductModal(item);
			}
		});

		this.eventEmitter.on('card:addBasket', (item: IProduct) => {
			if (item && item.id) {
				this.basketModel.addProduct(item);
				this.updateBasketCounter();
				this.modal.close();
			}
		});

		this.eventEmitter.on('basket:open', () => {
			this.openBasketModal();
		});

		this.eventEmitter.on('order:open', () => {
			this.fillOrderForm();
			this.openOrderModal();
		});

		this.eventEmitter.on('contacts:open', () => {
			this.openContactsModal();
		});

		this.eventEmitter.on('success:open', () => {
			this.openSuccessModal();
		});

		this.eventEmitter.on('success:close', () => {
			this.modal.close();
			this.basketModel.clear();
			this.orderForm.clear();
			this.updateBasketCounter();
		});


		this.eventEmitter.on(
			'order:paymentSelection',
			(button: HTMLButtonElement) => {
				this.orderForm.setPayment(button.name);
				if (this.currentPaymentModalView) {
					const isValid = this.orderForm.validateAddressAndPayment();
					this.currentPaymentModalView.valid = isValid;
				}
			}
		);

		this.eventEmitter.on(
			'order:changeAddress',
			(data: { field: string; value: string }) => {
				if (data.field === 'address') {
					this.orderForm.setAddress(data.value);
					if (this.currentPaymentModalView) {
						const isValid = this.orderForm.validateAddressAndPayment();
						this.currentPaymentModalView.valid = isValid;
					}
				}
			}
		);

		this.eventEmitter.on(
			'contacts:changeInput',
			(data: { field: string; value: string }) => {
				if (data.field === 'email') {
					this.orderForm.setEmail(data.value);
				} else if (data.field === 'phone') {
					this.orderForm.setPhone(data.value);
				}
				if (this.currentContactsModalView) {
					const isValid = this.orderForm.validateContacts();
					this.currentContactsModalView.valid = isValid;
				}
			}
		);

		this.eventEmitter.on('order:ready', (orderRequest: any) => {
			this.submitOrder(orderRequest);
		});

		// Обработчики валидации форм
		this.eventEmitter.on('formErrors:address', (errors: any) => {
			if (this.currentPaymentModalView) {
				this.handleFormErrors(errors, this.currentPaymentModalView.buttonSubmit);
			}
		});

		this.eventEmitter.on('formErrors:change', (payload: any) => {
			if (this.currentContactsModalView) {
				this.handleFormErrors(payload.errors, this.currentContactsModalView.buttonSubmit, payload.isValid);
			}
		});

		this.eventEmitter.on('card:removeBasket', (item: IProduct) => {
			if (item && item.id) {
				this.basketModel.removeProduct(item);
				this.updateBasketCounter();
				
				this.openProductModal(item);
			}
		});
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
		const counter = document.querySelector('.header__basket-counter');
		if (counter) {
			counter.textContent = this.basketModel.getCount().toString();
		}
	}

	private openProductModal(item: IProduct) {
		if (!item || !item.id || !item.title) {
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
		const itemElements: HTMLElement[] = [];

		const tplCardBasket = document.querySelector(
			'#card-basket'
		) as HTMLTemplateElement;
		if (!tplCardBasket) {
			return;
		}

		basketItems.forEach((item, index) => {
			if (!item || !item.id || !item.title) {
				return;
			}

			const cardElement = tplCardBasket.content
				.querySelector('.basket__item')
				.cloneNode(true) as HTMLElement;

			const indexElement = cardElement.querySelector('.basket__item-index');
			const titleElement = cardElement.querySelector('.card__title');
			const priceElement = cardElement.querySelector('.card__price');
			const deleteButton = cardElement.querySelector('.basket__item-delete');

			if (indexElement) indexElement.textContent = String(index + 1);
			if (titleElement) titleElement.textContent = item.title;
			if (priceElement)
				priceElement.textContent = `${item.price ?? 0} синапсов`;

			if (deleteButton) {
				deleteButton.addEventListener('click', () => {
					this.basketModel.removeProduct(item);
					this.updateBasketCounter();
					this.openBasketModal();
				});
			}

			itemElements.push(cardElement);
		});

		this.basketView.items = itemElements;
		this.basketView.updateTotalPrice(this.basketModel.getTotal());

		this.modal.content = this.basketView.render();
		this.modal.render();
	}

	private openOrderModal() {
		const tplOrder = this.getTemplate('#order');
		if (!tplOrder) return;
		const orderModal = new PaymentModalView(tplOrder, this.eventEmitter);
		this.currentPaymentModalView = orderModal;
		this.modal.content = orderModal.render();
		this.modal.render();
		const isValid = this.orderForm.validateAddressAndPayment();
		if (this.currentPaymentModalView) {
			this.currentPaymentModalView.valid = isValid;
		}
	}

	private openContactsModal() {
		const tplContacts = this.getTemplate('#contacts');
		if (!tplContacts) return;
		const contactsModal = new ContactsModalView(tplContacts, this.eventEmitter);
		this.currentContactsModalView = contactsModal;
		this.modal.content = contactsModal.render();
		this.modal.render();
		const isValid = this.orderForm.validateContacts();
		if (this.currentContactsModalView) {
			this.currentContactsModalView.valid = isValid;
		}
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

		const basketItems = this.basketModel.items;

		const validItems = basketItems.filter((item) => item && item.id);
		const itemIds = validItems.map((item) => item.id);
		const total = this.basketModel.getTotal();

		this.orderForm.setItems(itemIds);
		this.orderForm.setTotal(total);
	}

	private async submitOrder(orderRequest: IOrderRequest) {
		try {
			if (!orderRequest.items || orderRequest.items.length === 0) {
				throw new Error('Корзина пуста');
			}
			await this.apiModel.placeOrder(orderRequest);
			this.eventEmitter.emit('success:open');
		} catch (error) {
			const errorsElement = document.querySelector(
				'.form__errors'
			) as HTMLElement;
			if (errorsElement) {
				let errorMessage = 'Ошибка при оформлении заказа';

				if (error instanceof Error) {
					errorMessage = error.message;
				} else if (typeof error === 'string') {
					errorMessage = error;
				} else if (error && typeof error === 'object' && 'message' in error) {
					errorMessage = String(error.message);
				}

				errorsElement.textContent = errorMessage;
				errorsElement.style.display = 'block';
			}
		}
	}

	private showFormErrors(errors: Record<string, string>) {
		const errorsElement = document.querySelector('.form__errors') as HTMLElement;
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



	private handleFormErrors(errors: Record<string, string>, button: HTMLButtonElement | null, isValid?: boolean) {
		if (button) {
			button.disabled = typeof isValid === 'boolean' ? !isValid : Object.keys(errors).length !== 0;
		}
		this.showFormErrors(errors);
	}
}
