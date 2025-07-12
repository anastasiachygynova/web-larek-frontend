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
import { DataCatalog } from '../Model/DataCatalog';
import { OrderModalView } from '../View/OrderModalView';
import { HeaderView } from '../View/HeaderView';
import { MainPageView } from '../View/MainPageView';
import { ProductView } from '../View/ProductView';

export class AppPresenter {
	private basketView: BasketView;
	private eventEmitter: EventEmitter;
	private apiModel: ApiModel;
	private basketModel: BasketModel;
	private dataCatalog: DataCatalog;
	private modal: ModalView;
	private orderForm: OrderForm;
	private headerView: HeaderView;
	private currentPaymentModalView: PaymentModalView | null = null;
	private currentContactsModalView: ContactsModalView | null = null;
	private mainPageView: MainPageView;
	private tplCardCatalog: HTMLTemplateElement;
	private tplProductPreview: HTMLTemplateElement;
	private tplCardBasket: HTMLTemplateElement;
	private tplOrder: HTMLTemplateElement;
	private tplContacts: HTMLTemplateElement;
	private tplSuccess: HTMLTemplateElement;
	private orderModalView: OrderModalView;

	constructor(
		eventEmitter: EventEmitter,
		apiModel: ApiModel,
		basketModel: BasketModel,
		dataModel: DataCatalog,
		orderForm: OrderForm,
		basketView: BasketView,
		modalView: ModalView,
		headerView: HeaderView,
		mainPageView: MainPageView,
		tplCardCatalog: HTMLTemplateElement,
		templates: {
			tplProductPreview: HTMLTemplateElement;
			tplCardBasket: HTMLTemplateElement;
			tplOrder: HTMLTemplateElement;
			tplContacts: HTMLTemplateElement;
			tplSuccess: HTMLTemplateElement;
		},
		modalContent: HTMLElement
	) {
		this.eventEmitter = eventEmitter;
		this.apiModel = apiModel;
		this.basketModel = basketModel;
		this.dataCatalog = dataModel;
		this.orderForm = orderForm;
		this.basketView = basketView;
		this.modal = modalView;
		this.headerView = headerView;
		this.mainPageView = mainPageView;
		this.tplCardCatalog = tplCardCatalog;
		this.tplProductPreview = templates.tplProductPreview;
		this.tplCardBasket = templates.tplCardBasket;
		this.tplOrder = templates.tplOrder;
		this.tplContacts = templates.tplContacts;
		this.tplSuccess = templates.tplSuccess;
		this.orderModalView = new OrderModalView(modalContent);
		this.init();
		this.setupEventListeners();
	}

	private async init() {
		try {
			const products = await this.apiModel.getProductList();
			this.dataCatalog.products = products;

			const cards = this.dataCatalog.products.map((product) => {
				const card = new ProductView(this.tplCardCatalog, this.eventEmitter, {
					onClick: () => this.eventEmitter.emit('card:select', product),
				});
				return card.render(product);
			});
			this.mainPageView.setProducts(cards);
			this.setupBasketButton();
		} catch (error) {
			console.error('Ошибка загрузки товаров:', error);
		}
	}

	private setupEventListeners() {
		const on = this.eventEmitter.on.bind(this.eventEmitter);

		this.basketModel.eventEmitter.on('basket:changed', () => {
			this.updateBasketCounter();
			if (
				this.modal.content &&
				this.modal.content.classList.contains('basket')
			) {
				this.openBasketModal();
			}
		});

		on(
			'card:select',
			(item: IProduct) =>
				this.dataCatalog.isValidProduct(item) && this.openProductModal(item)
		);
		on('card:addBasket', (item: IProduct) => {
			if (this.dataCatalog.isValidProduct(item)) {
				this.basketModel.addProduct(item);
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
			if (
				this.modal.content &&
				this.modal.content.classList.contains('basket')
			) {
				this.openBasketModal();
			}
		});
		on('modal:close', () => {
			if (this.currentPaymentModalView) {
				this.currentPaymentModalView.clearError();
			}
			if (this.currentContactsModalView) {
				this.currentContactsModalView.clearError();
			}
		});

		on('payment:select', (payload: { method: string }) => {
			this.orderForm.setPayment(payload.method);
			this.updatePaymentModalValidation();
		});

		on('order:changeAddress', (data: { field: string; value: string }) => {
			if (data.field === 'address') {
				this.orderForm.setAddress(data.value);
				this.updatePaymentModalValidation();
			}
		});

		on('contacts:changeInput', (data: { field: string; value: string }) => {
			if (data.field === 'email') this.orderForm.setEmail(data.value);
			else if (data.field === 'phone') this.orderForm.setPhone(data.value);
			this.updateContactsModalValidation();
		});

		on('card:removeBasket', (item: IProduct) => {
			if (this.dataCatalog.isValidProduct(item)) {
				this.basketModel.removeProduct(item);
				this.openProductModal(item);
			}
		});
	}

	private updatePaymentModalValidation() {
		if (this.currentPaymentModalView) {
			this.currentPaymentModalView.updatePaymentSelection(
				this.orderForm.payment || ''
			);
			const { errors, isValid } = this.orderForm.validatePaymentStep();

			let errorMsg = '';
			if (!this.orderForm.address) {
				errorMsg = errors.address || '';
			} else {
				errorMsg = errors.payment || errors.address || '';
			}
			this.currentPaymentModalView.setError(errorMsg);
			this.currentPaymentModalView.setSubmitEnabled(isValid);
		}
	}

	private updateContactsModalValidation() {
		if (this.currentContactsModalView) {
			const { errors, isValid } = this.orderForm.validateContactsStep();
			this.currentContactsModalView.setError(
				errors.email || errors.phone || ''
			);
			this.currentContactsModalView.setSubmitEnabled(isValid);
		}
	}

	private setupBasketButton() {
		this.headerView.updateBasketCounter(this.basketModel.getCount());
	}

	private updateBasketCounter() {
		this.headerView.updateBasketCounter(this.basketModel.getCount());
	}

	private openProductModal(item: IProduct) {
		if (!this.dataCatalog.isValidProduct(item)) {
			return;
		}

		const productPreview = new ProductPreview(
			this.tplProductPreview,
			this.eventEmitter
		);

		this.modal.content = productPreview.render(item, this.basketModel.items);
		this.modal.render();
	}

	private openBasketModal() {
		this.basketModel.cleanInvalidItems();
		const basketItems = this.basketModel.items;

		this.basketView.setItems(
			basketItems,
			(item) => {
				this.basketModel.removeProduct(item);
				this.updateBasketCounter();
				this.refreshBasketModal();
			},
			this.tplCardBasket
		);
		this.basketView.updateTotalPrice(this.basketModel.getTotal());
		this.modal.content = this.basketView.render();
		this.modal.render();
	}

	private refreshBasketModal() {
		const basketItems = this.basketModel.items;
		this.basketView.setItems(
			basketItems,
			(item) => {
				this.basketModel.removeProduct(item);
				this.updateBasketCounter();
				this.refreshBasketModal();
			},
			this.tplCardBasket
		);
		this.basketView.updateTotalPrice(this.basketModel.getTotal());
		this.modal.content = this.basketView.render();
		this.modal.render();
	}

	private openOrderModal() {
		const paymentView = new PaymentModalView(this.tplOrder, this.eventEmitter);
		const contactsView = new ContactsModalView(
			this.tplContacts,
			this.eventEmitter
		);

		this.currentPaymentModalView = paymentView;
		this.currentContactsModalView = contactsView;

		// Сброс ошибок и состояния формы перед показом
		paymentView.clearError();
		contactsView.clearError();
		this.orderForm.clear();

		this.orderModalView.show(paymentView.render());

		paymentView.form.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			const { isValid } = this.orderForm.validatePaymentStep();
			if (isValid) {
				this.orderModalView.show(contactsView.render());
			}
		});

		contactsView.form.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			const { isValid } = this.orderForm.validateContactsStep();
			if (isValid) {
				this.eventEmitter.emit('success:open');
			}
		});

		this.updatePaymentModalValidation();
		this.modal.open();
	}

	private openContactsModal() {
		const contactsModal = new ContactsModalView(
			this.tplContacts,
			this.eventEmitter
		);
		this.currentContactsModalView = contactsModal;
		this.modal.content = contactsModal.render();
		this.modal.render();
	}

	private openSuccessModal() {
		const successModal = new OrderSuccessModal(
			this.tplSuccess,
			this.eventEmitter
		);
		this.modal.content = successModal.render(this.basketModel.getTotal());
		this.modal.render();
	}

	private fillOrderForm() {
		this.basketModel.cleanInvalidItems();
	}
}
