
import { EventEmitter } from '../base/events';
import { ProductView } from './ProductView';
import { ProductPreview } from './ProductPreview';
import { BasketView } from './BasketView';
import { ModalView } from './ModalView';
import { PaymentModalView } from './PaymentModalView';
import { ContactsModalView } from './ContactsModalView';
import { OrderSuccessModal } from './OrderSuccessModal';
import { ApiModel } from '../Model/ApiModel';
import { BasketModel } from '../Model/BasketModel';
import { IProduct } from '../../types';
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
    this.basketView = new BasketView(
      document.querySelector('#basket') as HTMLTemplateElement,
      eventEmitter
    );
    this.modal = new ModalView(ensureElement<HTMLElement>('#modal-container'), eventEmitter);
    this.init();
    this.setupEventListeners();
  }

  private async init() {
    try {
      this.products = await this.apiModel.getProductList();
      this.dataCatalog.products = this.products;
      this.setupBasketButton();
    } catch (error) {
      console.error('AppView: Ошибка загрузки товаров:', error);
    }
  }

  private setupEventListeners() {
    this.eventEmitter.on('basket:update', () => {
      this.updateBasketCounter();
    });
    
    this.eventEmitter.on('card:select', (item: IProduct) => {
      this.openProductModal(item);
    });
    
    this.eventEmitter.on('card:addBasket', (item: IProduct) => {
      this.basketModel.addProduct(item);
      this.updateBasketCounter();
      this.modal.close();
    });
    
    this.eventEmitter.on('basket:open', () => {
      this.openBasketModal();
    });
    
    this.eventEmitter.on('order:open', () => {
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
      this.updateBasketCounter();
    });
    
    // Обработчики валидации форм
    this.eventEmitter.on('formErrors:address', (errors: any) => {
      // Здесь можно добавить логику отображения ошибок
      console.log('Form errors (address):', errors);
    });
    
    this.eventEmitter.on('formErrors:change', (errors: any) => {
      // Здесь можно добавить логику отображения ошибок
      console.log('Form errors (contacts):', errors);
    });
  }

  private renderProducts() {
    try {
      const productsContainer = ensureElement<HTMLElement>('.gallery');

      const tplCardCatalog = document.querySelector(
        '#card-catalog'
      ) as HTMLTemplateElement;

      if (!tplCardCatalog) {
        console.error('AppView: Шаблон карточки не найден');
        return;
      }

      const createCard = (product: IProduct) => {
        const card = new ProductView(tplCardCatalog, this.eventEmitter, {
          onClick: () => {
            this.eventEmitter.emit('card:select', product);
          },
        });
        return card.render(product);
      };

      productsContainer.innerHTML = '';

      this.products.forEach((product) => {
        const cardElement = createCard(product);
        productsContainer.appendChild(cardElement);
      });
    } catch (error) {
      console.error('AppView: Ошибка рендеринга товаров:', error);
    }
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
    const tplProductPreview = document.querySelector('#card-preview') as HTMLTemplateElement;
    if (!tplProductPreview) {
      console.error('AppView: Шаблон card-preview не найден');
      return;
    }
    
    const productPreview = new ProductPreview(tplProductPreview, this.eventEmitter);
    
    this.modal.content = productPreview.render(item, this.basketModel.items);
    this.modal.render();
  }
  
  private openBasketModal() {
    this.modal.content = this.basketView.render();
    this.modal.render();
  }
  
  private openOrderModal() {
    const tplOrder = document.querySelector('#order') as HTMLTemplateElement;
    if (!tplOrder) {
      console.error('AppView: Шаблон order не найден');
      return;
    }
    
    const orderModal = new PaymentModalView(tplOrder, this.eventEmitter);
    this.modal.content = orderModal.render();
    this.modal.render();
  }
  
  private openContactsModal() {
    const tplContacts = document.querySelector('#contacts') as HTMLTemplateElement;
    if (!tplContacts) {
      console.error('AppView: Шаблон contacts не найден');
      return;
    }
    
    const contactsModal = new ContactsModalView(tplContacts, this.eventEmitter);
    this.modal.content = contactsModal.render();
    this.modal.render();
  }
  
  private openSuccessModal() {
    const tplSuccess = document.querySelector('#success') as HTMLTemplateElement;
    if (!tplSuccess) {
      console.error('AppView: Шаблон success не найден');
      return;
    }
    
    const successModal = new OrderSuccessModal(tplSuccess, this.eventEmitter);
    this.modal.content = successModal.render(this.basketModel.getTotal());
    this.modal.render();
  }
}
