/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from '@testing-library/react';

export interface RenderHookResult<T> {
  result: { current: T };
  unmount: () => void;
}

export function createRenderHook<T>(hookFactory: () => T): RenderHookResult<T> {
  const result: { current: T | null } = { current: null };
  const container = document.createElement('div');
  document.body.appendChild(container);

  act(() => {
    ReactDOM.render(
      React.createElement(function RenderedHook() {
        result.current = hookFactory();
        return null;
      }),
      container
    );
  });

  return {
    result: result as { current: T },
    unmount: () => {
      act(() => { ReactDOM.unmountComponentAtNode(container); });
      container.parentNode?.removeChild(container);
    },
  };
}
