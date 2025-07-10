import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';
import { AppPresenter } from '../Presenter/AppPresenter';
import { ApiModel } from '../Model/ApiModel';
import { BasketModel } from '../Model/BasketModel';
import { DataCatalog } from '../Model/DataCatalog';


export class MainPageView {
  private eventEmitter: EventEmitter;
  private appPresenter: AppPresenter;

  constructor(eventEmitter: EventEmitter, apiModel: ApiModel, basketModel: BasketModel, dataCatalog: DataCatalog) {
    this.eventEmitter = eventEmitter;
    this.appPresenter = new AppPresenter(eventEmitter, apiModel, basketModel, dataCatalog);
    this.setupBasketButton();
  }

  setProducts(cards: HTMLElement[]) {
    this.renderProducts(cards);
  }

  private renderProducts(cards: HTMLElement[]) {
    try {
      const productsContainer = ensureElement<HTMLElement>('.gallery');
      productsContainer.innerHTML = '';
      cards.forEach((card) => {
        productsContainer.appendChild(card);
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

