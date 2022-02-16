import { useEffect } from "react";
export interface Options {
  root?: null | Element;
  rootMargin?: string;
  threshold?: number;
}
let options: Options = {
  root: null,
  rootMargin: "100px",
  threshold: 1.0,
};
const useLoadMore = (props: any) => {
  const { items, callback, containerId, elementRef } = props;

  useEffect(() => {
    const localRef = elementRef?.current!;
    let observer: IntersectionObserver;
    if (localRef) {
      options = containerId
        ? { ...options, root: document.getElementById(containerId) }
        : options;

      observer = new IntersectionObserver((entities) => {
        const isIntersecting = entities[0].isIntersecting;
        if (isIntersecting) {
          callback instanceof Function && callback();
        }
      }, options);
      observer.observe(localRef);
    }
    return () => {
      if (observer) observer.unobserve(localRef);
    };
  }, [callback, items, containerId, elementRef]);

  return [elementRef];
};

export default useLoadMore;
