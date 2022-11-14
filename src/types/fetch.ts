export interface ResponseProducts<T> extends FetchData<T> {
  links?: Links;
  meta?: Meta;
}

export interface FetchData<T> extends FetchJson<'success'> {
  data: T;
}
export interface FetchJson<T extends 'error' | 'success'> extends Record<string, unknown> {
  message?: string;
  status: T;
}

export interface Links {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  links: Link[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}
