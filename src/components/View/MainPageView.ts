import { EventEmitter } from '../base/events';
import { ProductView } from './ProductView';
import { IProduct } from '../../types';
import { ensureElement } from '../../utils/utils';

export class MainPageView {
  private products: IProduct[] = [];
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.setupBasketButton();
  }

  setProducts(products: IProduct[]) {
    this.products = products.filter(product => product && product.id && product.title);
    this.renderProducts();
  }

  private renderProducts() {
    try {
      const productsContainer = ensureElement<HTMLElement>('.gallery');

      const tplCardCatalog = document.querySelector(
        '#card-catalog'
      ) as HTMLTemplateElement;

      if (!tplCardCatalog) {
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
        if (product && product.id && product.title) {
          const cardElement = createCard(product);
          productsContainer.appendChild(cardElement);
        }
      });
    } catch (error) {
      // Ошибка рендеринга товаров
    }
  }

  private setupBasketButton() {
    const basketButton = document.querySelector('.header__basket');
    if (basketButton) {
      basketButton.addEventListener('click', () => {
        this.eventEmitter.emit('basket:open');
      });
    }
  }

  updateBasketCounter(count: number) {
    const counter = document.querySelector('.header__basket-counter');
    if (counter) {
      counter.textContent = count.toString();
    }
  }
} 