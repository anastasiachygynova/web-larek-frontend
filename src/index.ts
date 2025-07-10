import './scss/styles.scss';
import { ApiModel } from './components/Model/ApiModel';
import { BasketModel } from './components/Model/BasketModel';
import { DataCatalog } from './components/Model/DataCatalog';
import { ProductView } from './components/View/ProductView';
import { MainPageView } from './components/View/MainPageView';
import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ensureElement } from './utils/utils';



const tplCardCatalog = document.querySelector(
	'#card-catalog'
) as HTMLTemplateElement;

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




new MainPageView(events, apiModel, basketModel, dataCatalog);

