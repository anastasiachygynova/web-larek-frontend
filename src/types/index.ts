// Типы данных из API

export interface Product {
	id: string;
	title: string;
	description: string;
	category: string;
	price: number;
	image: string;
}

export interface Order {
	id: string;
	items: Product[];
	total: number;
	address: string;
	email: string;
	phone: string;
	payment: 'card' | 'cash';
}

export interface User {
	id: string;
	email: string;
	phone: string;
}

// Интерфейсы отображения
export interface ProductView {
	id: string;
	title: string;
	price: string;
	image: string;
	category: string;
	description?: string;
}

export interface OrderView {
	id: string;
	items: ProductView[];
	total: string;
	address: string;
	email: string;
	phone: string;
	payment: string;
}

// Интерфейс API-клиента

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApiClient {
	get<T = any>(uri: string): Promise<T>;
	post<T = any>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};

// Интерфейсы базовых классов

export type EventName = string | RegExp;
export type Subscriber = (...args: any[]) => void;

export interface IEvents {
	on<T = any>(event: EventName, callback: (data: T) => void): void;
	off(event: EventName, callback: Subscriber): void;
	emit<T = any>(event: string, data?: T): void;
	onAll?(callback: (event: EmitterEvent) => void): void;
	offAll?(): void;
	trigger?<T = any>(event: string, context?: Partial<T>): (data: T) => void;
}

export interface EmitterEvent {
	eventName: string;
	data: unknown;
}

// Перечисления событий и их интерфейсы

export enum AppEvent {
	ProductAdded = 'product:added',
	ProductRemoved = 'product:removed',
	OrderCreated = 'order:created',
	OrderFailed = 'order:failed',
}

// Вспомогательные типы

export type SelectorCollection<T> = string | NodeListOf<Element> | T[];
export type SelectorElement<T> = T | string;
