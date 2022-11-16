#!/usr/bin/env zx

import 'zx/globals';

within(async () => {
  const re = new RegExp('(?<=\\<)(ion-)([a-z0-9_-]*)', 'g');
  const sourceFiles = await glob(['*.html', 'src/**/*.ts', '!src/**/*.d.ts']);

  let ionicTagList: string[] = [];

  for (const file of sourceFiles) {
    const process = await $`cat ${file} ; clear`;
    const content = process.stdout;

    if (content && typeof content === 'string') {
      ionicTagList = [...ionicTagList, ...(content.match(re) ?? [])];
    }
  }

  return ionicTagList
    .filter(function (ionTag, index) {
      return ionicTagList.indexOf(ionTag) == index;
    })
    .sort(function (ionTag1, ionTag2) {
      return ionTag1.localeCompare(ionTag2);
    });
}).then((ionTagNameList) => {
  let ionicDefineElementsSource = '';

  for (const ion of ionTagNameList) {
    ionicDefineElementsSource += toImportText(ion) + '\n';
  }

  ionicDefineElementsSource += `\n\n export const defineCustomElement = (): void => {
      ${ionTagNameList.map((ion) => toCamelCase(ion) + '()').join(';\n')}
    };`;

  fs.writeFile('src/ionic-define-elements.ts', ionicDefineElementsSource);
});

function toImportText(name: string): string {
  return `import {defineCustomElement as ${toCamelCase(name)}} from '@ionic/core/components/${name}.js';`;
}
function toCamelCase(text: string): string {
  return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_m, chr) => chr.toUpperCase());
}
