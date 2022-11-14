import {MultiLanguageStringType} from './language';

export interface CategoryInterface {
  _id: string;
  slug: string;
  title: MultiLanguageStringType;
  image: string;
  productIdList: string[];
}
