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
	private currentPaymentModalView: PaymentModalView | null = null;
	private currentContactsModalView: ContactsModalView | null = null;
	private orderModalView: OrderModalView;

	constructor(
		private eventEmitter: EventEmitter,
		private apiModel: ApiModel,
		private basketModel: BasketModel,
		private dataCatalog: DataCatalog,
		private orderForm: OrderForm,
		private basketView: BasketView,
		private modal: ModalView,
		private headerView: HeaderView,
		private mainPageView: MainPageView,
		private tplCardCatalog: HTMLTemplateElement,
		private templates: {
			tplProductPreview: HTMLTemplateElement;
			tplCardBasket: HTMLTemplateElement;
			tplOrder: HTMLTemplateElement;
			tplContacts: HTMLTemplateElement;
			tplSuccess: HTMLTemplateElement;
		},
		modalContent: HTMLElement
	) {
		this.orderModalView = new OrderModalView(modalContent);
		this.init();
		this.setupEventListeners();
	}

	private async init() {
		try {
			const products = await this.apiModel.getProductList();
			this.dataCatalog.products = products;
			this.mainPageView.setProducts(
				products.map(product =>
					new ProductView(this.tplCardCatalog, this.eventEmitter, {
						onClick: () => this.eventEmitter.emit('card:select', product),
					}).render(product)
				)
			);
			this.updateBasketCounter();
		} catch (error) {
			console.error('Ошибка загрузки товаров:', error);
		}
	}

	private setupEventListeners() {
		const on = this.eventEmitter.on.bind(this.eventEmitter);

		this.basketModel.eventEmitter.on('basket:changed', this.handleBasketChanged);

		on('card:select', (item: IProduct) => this.handleCardSelect(item));
		on('card:addBasket', (item: IProduct) => this.handleAddToBasket(item));
		on('basket:open', this.updateBasketModal);
		on('order:open', this.handleOrderOpen);
		on('contacts:open', this.openContactsModal);
		on('success:open', this.openSuccessModal);
		on('success:close', this.handleSuccessClose);
		on('modal:close', this.handleModalClose);
		on('payment:select', ({ method }: { method: string }) => this.handlePaymentSelect(method));
		on('order:changeAddress', ({ field, value }: { field: string; value: string }) => this.handleChangeAddress(field, value));
		on('contacts:changeInput', ({ field, value }: { field: string; value: string }) => this.handleContactsInput(field, value));
		on('card:removeBasket', (item: IProduct) => this.handleRemoveFromBasket(item));
	}

	// --- Обработчики событий ---

	private handleBasketChanged = () => {
		this.updateBasketCounter();
		if (this.modal.content?.classList.contains('basket')) {
			this.updateBasketModal();
		}
	};

	private handleCardSelect = (item: IProduct) => {
		if (this.dataCatalog.isValidProduct(item)) this.openProductModal(item);
	};

	private handleAddToBasket = (item: IProduct) => {
		if (this.dataCatalog.isValidProduct(item)) {
			this.basketModel.addProduct(item);
			this.modal.close();
		}
	};

	private handleOrderOpen = () => {
		this.basketModel.cleanInvalidItems();
		this.openOrderModal();
	};

	private handleSuccessClose = () => {
		this.modal.close();
		this.basketModel.clear();
		this.orderForm.clear();
		this.updateBasketCounter();
		if (this.modal.content?.classList.contains('basket')) {
			this.updateBasketModal();
		}
	};

	private handleModalClose = () => {
		this.currentPaymentModalView?.clearError();
		this.currentContactsModalView?.clearError();
	};

	private handlePaymentSelect = (method: string) => {
		this.orderForm.setPayment(method);
		this.updatePaymentModalValidation();
	};

	private handleChangeAddress = (field: string, value: string) => {
		if (field === 'address') {
			this.orderForm.setAddress(value);
			this.updatePaymentModalValidation();
		}
	};

	private handleContactsInput = (field: string, value: string) => {
		if (field === 'email') this.orderForm.setEmail(value);
		else if (field === 'phone') this.orderForm.setPhone(value);
		this.updateContactsModalValidation();
	};

	private handleRemoveFromBasket = (item: IProduct) => {
		if (this.dataCatalog.isValidProduct(item)) {
			this.basketModel.removeProduct(item);
			this.openProductModal(item);
		}
	};

	// --- Вспомогательные методы ---

	private updateBasketCounter = () => {
		this.headerView.updateBasketCounter(this.basketModel.getCount());
	};

	private updateBasketModal = () => {
		this.basketModel.cleanInvalidItems();
		const basketItems = this.basketModel.items;
		this.basketView.setItems(
			basketItems,
			(item) => {
				this.basketModel.removeProduct(item);
				this.updateBasketCounter();
				this.updateBasketModal();
			},
			this.templates.tplCardBasket
		);
		this.basketView.updateTotalPrice(this.basketModel.getTotal());
		this.modal.content = this.basketView.render();
		this.modal.render();
	};

	private openProductModal(item: IProduct) {
		const productPreview = new ProductPreview(
			this.templates.tplProductPreview,
			this.eventEmitter
		);
		this.modal.content = productPreview.render(item, this.basketModel.items);
		this.modal.render();
	}

	private openOrderModal = () => {
		const paymentView = new PaymentModalView(this.templates.tplOrder, this.eventEmitter);
		const contactsView = new ContactsModalView(this.templates.tplContacts, this.eventEmitter);

		this.currentPaymentModalView = paymentView;
		this.currentContactsModalView = contactsView;

		paymentView.clearError();
		contactsView.clearError();
		this.orderForm.clear();

		this.orderModalView.show(paymentView.render());

		paymentView.form.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			if (this.orderForm.validatePaymentStep().isValid) {
				this.orderModalView.show(contactsView.render());
			}
		});

		contactsView.form.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			if (this.orderForm.validateContactsStep().isValid) {
				this.eventEmitter.emit('success:open');
			}
		});

		this.updatePaymentModalValidation();
		this.modal.open();
	};

	private openContactsModal = () => {
		const contactsModal = new ContactsModalView(
			this.templates.tplContacts,
			this.eventEmitter
		);
		this.currentContactsModalView = contactsModal;
		this.modal.content = contactsModal.render();
		this.modal.render();
	};

	private openSuccessModal = () => {
		const successModal = new OrderSuccessModal(
			this.templates.tplSuccess,
			this.eventEmitter
		);
		this.modal.content = successModal.render(this.basketModel.getTotal());
		this.modal.render();
	};

	private updatePaymentModalValidation() {
		if (this.currentPaymentModalView) {
			this.currentPaymentModalView.updatePaymentSelection(this.orderForm.payment || '');
			const { errors, isValid } = this.orderForm.validatePaymentStep();
			const errorMsg = !this.orderForm.address
				? errors.address || ''
				: errors.payment || errors.address || '';
			this.currentPaymentModalView.setError(errorMsg);
			this.currentPaymentModalView.setSubmitEnabled(isValid);
		}
	}

	private updateContactsModalValidation() {
		if (this.currentContactsModalView) {
			const { errors, isValid } = this.orderForm.validateContactsStep();
			this.currentContactsModalView.setError(errors.email || errors.phone || '');
			this.currentContactsModalView.setSubmitEnabled(isValid);
		}
	}
}
