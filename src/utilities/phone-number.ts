import {UnicodeDigits} from '@alwatr/math';

export function phoneNumberFormat(phoneNumber: string): string {
  if (phoneNumber.length !== 11) return phoneNumber;

  const translator = new UnicodeDigits(['en', 'fa'], 'fa');
  const output = translator.translate(phoneNumber);

  return `${output.slice(0, 4)} ${output.slice(4, 7)} ${output.slice(7)}`;
}
