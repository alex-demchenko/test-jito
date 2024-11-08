export function isElement(element: any): boolean {
  return typeof HTMLElement === "object"
    ? element instanceof HTMLElement
    : element &&
        typeof element === "object" &&
        element !== null &&
        element.nodeType === 1 &&
        typeof element.nodeName === "string";
}

export function findSingle(element: Element, selector: string): Element | null {
  return isElement(element)
    ? element.matches(selector)
      ? element
      : element.querySelector(selector)
    : null;
}

export function getHeight(element: HTMLElement): number {
  if (element) {
    let height = element.offsetHeight;
    let style = getComputedStyle(element);

    height -=
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      parseFloat(style.borderTopWidth) +
      parseFloat(style.borderBottomWidth);

    return height;
  }

  return 0;
}

export function getWidth(element: HTMLElement): number {
  if (element) {
    let width = element.offsetWidth;
    let style = getComputedStyle(element);

    width -=
      parseFloat(style.paddingLeft) +
      parseFloat(style.paddingRight) +
      parseFloat(style.borderLeftWidth) +
      parseFloat(style.borderRightWidth);

    return width;
  }

  return 0;
}

export default function isVisible(element?: HTMLElement): boolean {
  return !!(element && element.offsetParent != null);
}
