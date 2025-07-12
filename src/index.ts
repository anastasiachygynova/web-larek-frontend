import './scss/styles.scss';
import { ApiModel } from './components/Model/ApiModel';
import { BasketModel } from './components/Model/BasketModel';
import { DataCatalog } from './components/Model/DataCatalog';
import { OrderForm } from './components/Model/OrderForm';
import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { BasketView } from './components/View/BasketView';
import { ModalView } from './components/View/ModalView';
import { HeaderView } from './components/View/HeaderView';
import { AppPresenter } from './components/Presenter/AppPresenter';
import { MainPageView } from './components/View/MainPageView';

const tplCardCatalog = document.querySelector('#card-catalog') as HTMLTemplateElement;
const tplBasket = document.querySelector('#basket') as HTMLTemplateElement;
const tplProductPreview = document.querySelector('#card-preview') as HTMLTemplateElement;
const tplCardBasket = document.querySelector('#card-basket') as HTMLTemplateElement;
const tplOrder = document.querySelector('#order') as HTMLTemplateElement;
const tplContacts = document.querySelector('#contacts') as HTMLTemplateElement;
const tplSuccess = document.querySelector('#success') as HTMLTemplateElement;
const modalContainer = document.querySelector('#modal-container') as HTMLElement;
const modalContent = document.querySelector('#modal-container .modal__content') as HTMLElement;
const pageWrapper = document.querySelector('.page__wrapper') as HTMLElement;
const headerElement = document.querySelector('.header') as HTMLElement;
const galleryContainer = document.querySelector('.gallery') as HTMLElement;
const basketCounter = document.querySelector('.header__basket-counter') as HTMLElement;

const apiModel = new ApiModel(CDN_URL, API_URL);
const events = new EventEmitter();
const dataCatalog = new DataCatalog(events);
const basketModel = new BasketModel(events);
const orderForm = new OrderForm(events);
const mainPageView = new MainPageView(galleryContainer, basketCounter);

const basketView = new BasketView(tplBasket, events);
const modalView = new ModalView(modalContainer, pageWrapper, events);
const headerView = new HeaderView(headerElement, events);

new AppPresenter(
  events,         // EventEmitter
  apiModel,       // ApiModel
  basketModel,    // BasketModel
  dataCatalog,    // DataCatalog
  orderForm,      // OrderForm
  basketView,     // BasketView
  modalView,      // ModalView
  headerView,     // HeaderView
  mainPageView,   // MainPageView
  tplCardCatalog, // HTMLTemplateElement
  {               // templates object
    tplProductPreview,
    tplCardBasket,
    tplOrder,
    tplContacts,
    tplSuccess
  },
  modalContent    // HTMLElement
);
