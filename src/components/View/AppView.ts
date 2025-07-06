import { EventEmitter } from '../base/events';
import { ProductView } from './ProductView';
import { ProductPreview } from './ProductPreview';
import { BasketView } from './BasketView';
import { ModalView } from './ModalView';
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
}
