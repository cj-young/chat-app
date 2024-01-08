import { TRole } from "@/types/server";

export const formattedServerRoles = new Map<TRole, string>([
  ["owner", "Owner"],
  ["admin", "Admin"],
  ["guest", "Guest"]
]);

export const serverRolePriorities = new Map<TRole, number>([
  ["owner", 0],
  ["admin", 1],
  ["guest", 2]
]);

type TExplicitlyOrderedItem = {
  uiOrder: number;
  [key: string]: any;
};

export function removeExplicitlyOrderedElement<
  T extends TExplicitlyOrderedItem
>(arr: T[], toRemoveCallback: (item: T) => boolean): T[] {
  const itemsToRemove = arr.filter(toRemoveCallback);
  if (itemsToRemove.length === 0) return arr;
  const sortedArray = structuredClone(arr).sort(
    (a, b) => a.uiOrder - b.uiOrder
  );

  let numRemoved = 0;
  return sortedArray.filter((item) => {
    if (toRemoveCallback(item)) {
      numRemoved++;
      return false;
    } else {
      item.uiOrder -= numRemoved;
      return true;
    }
  });
}

export function addExplicitlyOrderedElement<T extends TExplicitlyOrderedItem>(
  element: T,
  arr: T[],
  order?: number
): T[] {
  let maxUiOrder = Number.MIN_VALUE;
  for (let item of arr) {
    maxUiOrder = Math.max(item.uiOrder, maxUiOrder);
  }

  let safeOrder = order ?? maxUiOrder + 1;

  const incrementedArr = arr.map((item) => {
    if (item.uiOrder >= safeOrder) {
      return {
        ...item,
        uiOrder: item.uiOrder + 1
      };
    } else {
      return item;
    }
  });

  incrementedArr.push({ ...element, uiOrder: safeOrder });
  return incrementedArr;
}

export function moveExplicitlyOrderedElement<T extends TExplicitlyOrderedItem>(
  arr: T[],
  isItemToMove: (item: T) => boolean,
  newOrder: number
): T[] {
  const itemToMove = arr.find((item) => isItemToMove(item));
  if (!itemToMove) return arr;

  return arr.map((item) => {
    if (item === itemToMove) {
      return {
        ...item,
        uiOrder: newOrder
      };
    } else if (item.uiOrder > itemToMove.uiOrder && item.uiOrder <= newOrder) {
      return {
        ...item,
        uiOrder: item.uiOrder - 1
      };
    } else if (item.uiOrder < itemToMove.uiOrder && item.uiOrder >= newOrder) {
      return {
        ...item,
        uiOrder: item.uiOrder + 1
      };
    } else {
      return item;
    }
  });
}
