import {UnicodeDigits} from '@alwatr/math';

export function bankNumberFormat(bankNumber: string): string {
  if (bankNumber.length !== 16) return bankNumber;

  const translator = new UnicodeDigits(['en', 'fa'], 'fa');
  const output = translator.translate(bankNumber);

  return `${output.slice(0, 4)}-${output.slice(4, 8)}-${output.slice(8, 12)}-${output.slice(12, 16)}`;
}
