/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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
      options = containerId ? { ...options, root: document.getElementById(containerId) } : options;

      observer = new IntersectionObserver(entities => {
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
