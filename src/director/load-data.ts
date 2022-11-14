import {createLogger} from '@alwatr/logger';

import type {CategoryInterface} from '../types/category';
import type {FetchPageContent} from '../types/page-content';
import type {ProductInterface} from '../types/product';

export const directorLogger = createLogger('director');

export const productList = async (): Promise<Record<string, ProductInterface>> => {
  const productList = {};
  directorLogger.logMethodFull('productList', {}, {productList});
  return productList;
};
export const categoryList = async (): Promise<Record<string, CategoryInterface>> => {
  const categoryList = {};
  directorLogger.logMethodFull('categoryList', {}, {categoryList});
  return categoryList;
};
export const pageContent = async (pageTagName: string): Promise<Record<string, FetchPageContent>> => {
  const pageContent = {};
  directorLogger.logMethodFull('pageContent', {}, {pageTagName, pageContent});
  return pageContent;
};
export const appData = async (): Promise<void> => {
  directorLogger.logMethod('loadAppData');
  await Promise.all([pageContent('page-home'), categoryList(), productList()]);
};
