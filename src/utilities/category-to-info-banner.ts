import {loadImage} from './load-image';

import type {InfoBanner} from '../types/banner';
import type {CategoryInterface} from '../types/category';

export async function categoryToInfoBanner(
  categoryId: string,
  categoryList: Record<string, CategoryInterface>
): Promise<InfoBanner> {
  const category = categoryList[categoryId];

  return {
    label: category.title.en,
    src: category.image,
    href: '',
    imageElement: await loadImage(category.image),
  };
}
