import type {DefaultTranslation} from '@shoelace-style/localize';

const translation: DefaultTranslation = {
  $code: 'en',
  $name: 'English',
  $dir: 'ltr',

  $price_unit: '$',

  // * Page titles
  products: 'Products',
  cart: 'Cart',
  home: 'Home',
  account: 'Account',
  contact_us: 'Contact Us',

  // * Product categories
  mens_t_shirts: 'Mens T-Shirts',
  womens_t_shirts: 'Womens T-Shirts',
  mens_outerwear: 'Mens Outerwear',
  womens_outerwear: 'Womens Outerwear',

  developer_team: 'Developer Team',
  add_to_cart: 'Add To Cart',
  share: 'Share',
  cancel: 'Cancel',
  description: 'Description',
  features: 'Features',
  favorite_past: (title: string, isFavorite: boolean) =>
    isFavorite ? `${title} was added to favorites` : `${title} was removed from favorite`,
  favorite_reverse_verb: (isFavorite: boolean) => (isFavorite ? 'Remove from favorites' : 'Add to favorites'),

  mohammadmahdi_zamanian: 'MohammadMahdi Zamanian',
  web_developer_project_maintainer: 'Web Developer | Project Maintainer',
};

export default translation;
