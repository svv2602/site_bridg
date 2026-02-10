/**
 * Ukrainian pluralization utility.
 *
 * Ukrainian has 3 plural forms:
 * - form1: 1, 21, 31, ... (розмір, стаття, дилер)
 * - form2: 2-4, 22-24, ... (розміри, статті, дилери)
 * - form5: 0, 5-20, 25-30, ... (розмірів, статей, дилерів)
 *
 * @example
 * pluralize(1, 'розмір', 'розміри', 'розмірів') // "1 розмір"
 * pluralize(3, 'розмір', 'розміри', 'розмірів') // "3 розміри"
 * pluralize(5, 'розмір', 'розміри', 'розмірів') // "5 розмірів"
 * pluralize(21, 'розмір', 'розміри', 'розмірів') // "21 розмір"
 */
export function pluralize(
  count: number,
  form1: string,
  form2: string,
  form5: string,
): string {
  const absCount = Math.abs(count);
  const mod10 = absCount % 10;
  const mod100 = absCount % 100;

  let form: string;

  if (mod100 >= 11 && mod100 <= 19) {
    form = form5;
  } else if (mod10 === 1) {
    form = form1;
  } else if (mod10 >= 2 && mod10 <= 4) {
    form = form2;
  } else {
    form = form5;
  }

  return `${count} ${form}`;
}

/**
 * Returns just the plural form without the number.
 */
export function pluralForm(
  count: number,
  form1: string,
  form2: string,
  form5: string,
): string {
  const absCount = Math.abs(count);
  const mod10 = absCount % 10;
  const mod100 = absCount % 100;

  if (mod100 >= 11 && mod100 <= 19) {
    return form5;
  } else if (mod10 === 1) {
    return form1;
  } else if (mod10 >= 2 && mod10 <= 4) {
    return form2;
  } else {
    return form5;
  }
}
