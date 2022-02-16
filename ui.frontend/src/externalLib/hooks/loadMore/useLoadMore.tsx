import { useEffect, useRef } from "react";

const options = {
  root: null,
  rootMargin: "100px",
  threshold: 1.0,
};
const useLoadMore = (props: any) => {
  const elementRef = useRef(null);
  const { items, callback } = props;

  useEffect(() => {
    
    const localRef = elementRef.current!;
    
    let observer: IntersectionObserver;
    if (localRef) {
    observer = new IntersectionObserver((entities) => {
      const isIntersecting = entities[0].isIntersecting;
      if (isIntersecting) {
        // console.log("calling callback from  the intersection observer");
        callback();
      }
    }, options);
    observer.observe(localRef);
  }
    return () => {
      // console.log("Removing tshe intersection observer");
      if (observer) 
        observer.unobserve(localRef);
    };
  }, [callback, items]);

  return [elementRef];
};

export default useLoadMore;
