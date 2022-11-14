export type locale = {code: 'fa' | 'en'; dir: 'rtl' | 'ltr'; $code: string};

export const locales: locale[] = [
  {code: 'en', dir: 'ltr', $code: 'English'},
  {code: 'fa', dir: 'rtl', $code: 'فارسی'},
];
export const developerTeam: {name: string; description: string; link?: string; image: string}[] = [
  {
    name: 'mohammadmahdi_zamanian',
    description: 'web_developer_project_maintainer',
    link: 'https://mm25zamanian.ir',
    image: '/images/developer_team/mohammadmahdi_zamanian.jpg',
  },
];
