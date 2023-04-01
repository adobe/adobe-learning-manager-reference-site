export function swipeEvents(
  element: HTMLElement,
  excludedElements: HTMLElement[],
  func: (direction: string) => void,
  deltaMin = 90
) {
  const swipe_det = {
    sX: 0,
    sY: 0,
    eX: 0,
    eY: 0,
  };
  const directions = Object.freeze({
    RIGHT: "right",
    LEFT: "left",
  });
  let direction: string | null = null;
  element.addEventListener(
    "touchstart",
    function (e) {
      const t = e.touches[0];
      swipe_det.sX = t.screenX;
      swipe_det.sY = t.screenY;
    },
    false
  );
  element.addEventListener(
    "touchmove",
    function (e) {
      const t = e.touches[0];
      swipe_det.eX = t.screenX;
      swipe_det.eY = t.screenY;
    },
    false
  );
  element.addEventListener(
    "touchend",
    function (e) {
      const clickedElement = <HTMLElement>e.target;
      for (let i = 0; i < excludedElements.length; i++) {
        if (
          clickedElement &&
          (clickedElement == excludedElements[i] ||
            checkIfAncestorsInExcludedElement(clickedElement))
        ) {
          return;
        }
      }
      const deltaX = swipe_det.eX - swipe_det.sX;
      const deltaY = swipe_det.eY - swipe_det.sY;
      if (deltaX ** 2 + deltaY ** 2 < deltaMin ** 2) {
        return;
      }
      if (deltaY === 0 || Math.abs(deltaX / deltaY) > 1)
        direction = deltaX > 0 ? directions.RIGHT : directions.LEFT;
      else return;

      if (direction && typeof func === "function") {
        func(direction);
      }
      direction = null;
    },
    false
  );

  const checkIfAncestorsInExcludedElement = (clickedElement: HTMLElement) => {
    let parentElement = clickedElement.parentElement;
    let levels = 0; // num levels to search in hierarchy: limiting it so that we dont search till doc element
    while (parentElement && levels < 3) {
      for (let i = 0; i < excludedElements.length; i++) {
        if (parentElement == excludedElements[i]) {
          return true;
        }
      }
      parentElement = parentElement ? parentElement.parentElement : null;
      levels = levels + 1;
    }
    return false;
  };
}
