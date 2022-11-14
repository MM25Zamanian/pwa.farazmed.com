import {TemplateResult} from 'lit';

import type {Route as AlwatrRoute} from '@alwatr/router';

export type Route = {
  title: string;
  icon?: string;
  show_in_bar: boolean;
  render: (route: AlwatrRoute) => TemplateResult;
};
