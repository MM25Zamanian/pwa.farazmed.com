export enum AppLanguageListEnum {
  FA = 'fa',
  EN = 'en',
}

export type MultiLanguageStringType = {
  [key in AppLanguageListEnum]: string;
};
export type MultiLanguageNumberType = {
  [key in AppLanguageListEnum]: number;
};
