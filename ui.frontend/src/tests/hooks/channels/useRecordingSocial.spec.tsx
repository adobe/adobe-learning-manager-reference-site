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
import React from 'react';
import { render } from '@testing-library/react';
import { RestAdapter } from '@utils/restAdapter';
import { useRecordingSocial, PostStats } from '@hooks/channels/useRecordingSocial';

jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(() => ({
    primeApiURL: 'https://test.example.com/primeapi/v2/',
    locale: 'en',
  })),
}));

jest.mock('@utils/restAdapter', () => ({
  RestAdapter: { get: jest.fn(), ajax: jest.fn() },
}));

const mockGet = RestAdapter.get as jest.Mock;

let capturedHook: ReturnType<typeof useRecordingSocial> | null = null;

function TestComponent({
  channelId = 'ch-1',
  boardId = null as number | null,
  postId = 'p1',
  sourceKey = 'sk1',
}) {
  capturedHook = useRecordingSocial(channelId, boardId, postId, sourceKey);
  return <div data-testid="root">{capturedHook.stats ? 'has-stats' : 'no-stats'}</div>;
}

beforeEach(() => {
  jest.clearAllMocks();
  capturedHook = null;
});

describe('useRecordingSocial', () => {
  it('mounts without throwing', () => {
    expect(() => render(<TestComponent />)).not.toThrow();
  });

  it('initial stats is null when no boardId (no fetch)', () => {
    render(<TestComponent boardId={null} />);
    expect(capturedHook!.stats).toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('initial isLiking is false', () => {
    render(<TestComponent />);
    expect(capturedHook!.isLiking).toBe(false);
  });

  it('canLike is false with no stats', () => {
    render(<TestComponent />);
    expect(capturedHook!.canLike).toBe(false);
  });

  it('toggleLike function is exposed', () => {
    render(<TestComponent />);
    expect(typeof capturedHook!.toggleLike).toBe('function');
  });
});
