import './scss/styles.scss';
import { ApiModel } from './components/Model/ApiModel';
import { BasketModel } from './components/Model/BasketModel';
import { DataCatalog } from './components/Model/DataCatalog';
import { ProductView } from './components/View/ProductView';
import { AppView } from './components/View/AppView';
import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ensureElement } from './utils/utils';


// Получение шаблонов
const tplCardCatalog = document.querySelector(
	'#card-catalog'
) as HTMLTemplateElement;

// Инициализация моделей и событий
const apiModel = new ApiModel(CDN_URL, API_URL);
const events = new EventEmitter();
const dataCatalog = new DataCatalog(events);
const basketModel = new BasketModel();


events.on('products:receive', () => {
	const galleryContainer = ensureElement<HTMLElement>('.gallery');
	galleryContainer.innerHTML = '';

	dataCatalog.products.forEach((item) => {
		const card = new ProductView(tplCardCatalog, events, {
			onClick: () => events.emit('card:select', item),
		});
		galleryContainer.append(card.render(item));
	});
});



// Инициализация главного представления приложения
new AppView(events, apiModel, basketModel, dataCatalog);

