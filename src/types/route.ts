import type {Route as AlwatrRoute} from '@alwatr/router';
import type {TemplateResult} from 'lit';

export type Route = {
  title: string;
  icon?: string;
  show_in_bar: boolean;
  render: (route: AlwatrRoute) => TemplateResult;
};
