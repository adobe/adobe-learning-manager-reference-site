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
import { useRecordingComments } from '@hooks/channels/useRecordingComments';

jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(() => ({
    primeApiURL: 'https://test.example.com/primeapi/v2/',
    locale: 'en',
  })),
}));

jest.mock('@utils/restAdapter', () => ({
  RestAdapter: { get: jest.fn(), ajax: jest.fn() },
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  GetTranslationsReplaced: (key: string) => key,
}));

let capturedHook: ReturnType<typeof useRecordingComments> | null = null;

function TestComponent({
  channelId = 'ch-1',
  boardId = null as number | null,
  postId = null as string | null,
}) {
  capturedHook = useRecordingComments(channelId, boardId, postId);
  return <div data-testid="root">{capturedHook.isLoading ? 'loading' : 'idle'}</div>;
}

beforeEach(() => {
  jest.clearAllMocks();
  capturedHook = null;
});

describe('useRecordingComments', () => {
  it('mounts without throwing', () => {
    expect(() => render(<TestComponent />)).not.toThrow();
  });

  it('does not fetch when boardId or postId is null', () => {
    render(<TestComponent boardId={null} postId={null} />);
    expect(RestAdapter.get as jest.Mock).not.toHaveBeenCalled();
  });

  it('initial comments is empty array', () => {
    render(<TestComponent />);
    expect(capturedHook!.comments).toEqual([]);
  });

  it('initial commentText is empty string', () => {
    render(<TestComponent />);
    expect(capturedHook!.commentText).toBe('');
  });

  it('initial isPosting is false', () => {
    render(<TestComponent />);
    expect(capturedHook!.isPosting).toBe(false);
  });

  it('setCommentText and submitComment functions are exposed', () => {
    render(<TestComponent />);
    expect(typeof capturedHook!.setCommentText).toBe('function');
    expect(typeof capturedHook!.submitComment).toBe('function');
  });
});
