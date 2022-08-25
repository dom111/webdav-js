import { ElementHandle } from 'puppeteer';

export const getRawProperty = async <
  T extends HTMLElement = HTMLElement,
  K extends keyof T = keyof T
>(
  element: Promise<ElementHandle<T>> | ElementHandle<T>,
  property: K
): Promise<T[K]> =>
  await (await (await element)?.getProperty(property as string))?.jsonValue();

export const getRawProperties = async <
  T extends HTMLElement = HTMLElement,
  K extends keyof T = keyof T
>(
  element: Promise<ElementHandle<T>> | ElementHandle<T>,
  ...properties: K[]
) =>
  Promise.all(properties.map((property) => getRawProperty(element, property)));

export const getRawPropertyFromMany = async <
  T extends HTMLElement = HTMLElement,
  K extends keyof T = keyof T
>(
  elements: Promise<ElementHandle<T>[]> | ElementHandle<T>[],
  property: K
): Promise<T[K][]> =>
  Promise.all(
    (await elements).map(
      async (element): Promise<any> =>
        (['innerText', 'innerHTML'] as K[]).includes(property)
          ? await element?.evaluate<[string]>(
              (element: T, property: string) => element[property],
              property as string
            )
          : getRawProperty<T, K>(element, property)
    )
  );
