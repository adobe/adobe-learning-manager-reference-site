/**
Copyright 2026 Adobe. All rights reserved.
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
import { waitFor } from '@testing-library/dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import channelsReducer from '@almStore/reducers/channels';
import { useChannels } from '@hooks/channels/useChannels';

// Named mocks (rather than baking return values into the jest.mock factory) because
// jest.config's resetMocks: true strips any .mockResolvedValue()/.mockReturnValue()
// set at factory-eval time before every test — the values must be (re)established in
// beforeEach instead, same pattern used across the other spec files in this repo.
const mockFetchChannels = jest.fn();
const mockToggleSubscription = jest.fn();
const mockFetchLikedPostIds = jest.fn();
const mockFetchViewedPosts = jest.fn();

jest.mock('@hooks/channels/useChannelsApi', () => ({
  fetchChannels: (...args: any[]) => mockFetchChannels(...args),
  toggleSubscription: (...args: any[]) => mockToggleSubscription(...args),
  fetchLikedPostIds: (...args: any[]) => mockFetchLikedPostIds(...args),
  fetchViewedPosts: (...args: any[]) => mockFetchViewedPosts(...args),
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  GetTranslationsReplaced: (key: string) => key,
}));

// The ambient @utils/global mock in setupTests.ts stubs getQueryParamsFromUrl as a bare
// jest.fn() with no return value configured there either, so it has the same resetMocks
// problem. Override it locally with a plain function (immune to resetMocks, since it's
// not a jest.fn()) that reflects the window.location.search this suite drives via
// pushState — useChannels only needs this one export from @utils/global.
jest.mock('@utils/global', () => ({
  getQueryParamsFromUrl: () =>
    Object.fromEntries(new URLSearchParams(globalThis.location.search).entries()),
  // useChannels falls back to the hash query (HashRouter) when search has no ?tab=.
  getWindowObject: () => globalThis,
}));

const makeStore = () => createStore(combineReducers({ channels: channelsReducer }));

let capturedHook: ReturnType<typeof useChannels> | null = null;

function TestComponent() {
  capturedHook = useChannels();
  return <div data-testid="root">{capturedHook.isLoading ? 'loading' : 'idle'}</div>;
}

function renderWithStore() {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <TestComponent />
    </Provider>
  );
}

beforeEach(() => {
  capturedHook = null;
  mockFetchChannels.mockResolvedValue({ channels: [] });
  mockToggleSubscription.mockResolvedValue(undefined);
  mockFetchLikedPostIds.mockResolvedValue(new Set());
  mockFetchViewedPosts.mockResolvedValue({});
});

describe('useChannels', () => {
  it('mounts without throwing', () => {
    expect(() => renderWithStore()).not.toThrow();
  });

  it('initial channels is empty array', () => {
    renderWithStore();
    expect(capturedHook!.channels).toEqual([]);
  });

  it('initial selectedTab is all', () => {
    renderWithStore();
    expect(capturedHook!.selectedTab).toBe('all');
  });

  it('initial error is null', () => {
    renderWithStore();
    expect(capturedHook!.error).toBeNull();
  });

  it('initial likedChannel is null', () => {
    renderWithStore();
    expect(capturedHook!.likedChannel).toBeNull();
  });

  it('exposes setTab, setSearch, toggleSubscription, refreshChannels', () => {
    renderWithStore();
    expect(typeof capturedHook!.setTab).toBe('function');
    expect(typeof capturedHook!.setSearch).toBe('function');
    expect(typeof capturedHook!.toggleSubscription).toBe('function');
    expect(typeof capturedHook!.refreshChannels).toBe('function');
  });

  describe('deep-linked ?tab= on first load', () => {
    afterEach(() => {
      window.history.pushState({}, '', '/');
    });

    it('honors a valid deep-linked tab over the auto-select default', async () => {
      window.history.pushState({}, '', '/?tab=liked');
      renderWithStore();
      await waitFor(() => expect(capturedHook!.selectedTab).toBe('liked'));
    });

    it('honors a deep-linked tab carried in the hash query (HashRouter dashboard)', async () => {
      // The dashboard is a HashRouter, so ?tab= lives in the hash, not location.search.
      window.history.pushState({}, '', '/#/channels?tab=liked');
      renderWithStore();
      await waitFor(() => expect(capturedHook!.selectedTab).toBe('liked'));
    });

    it('falls back to the auto-select default when no ?tab= is present', async () => {
      renderWithStore();
      // No subscribed channels in the mocked feed, so auto-select resolves to 'all'.
      await waitFor(() => expect(capturedHook!.isLoading).toBe(false));
      expect(capturedHook!.selectedTab).toBe('all');
    });

    it('falls back to the auto-select default when the hash query has no tab key', async () => {
      // Hash carries a query string but no ?tab=, so the hash-fallback resolves to null.
      window.history.pushState({}, '', '/#/channels?foo=bar');
      renderWithStore();
      await waitFor(() => expect(capturedHook!.isLoading).toBe(false));
      expect(capturedHook!.selectedTab).toBe('all');
    });

    it('auto-selects the Subscribed tab when a subscribed channel exists and no deep link is present', async () => {
      mockFetchChannels.mockResolvedValue({
        channels: [
          {
            id: 'ch-1',
            name: 'Channel 1',
            description: '',
            boardId: null,
            isSubscribed: true,
            enabled: true,
            state: 'ACTIVE',
            recordingCount: 0,
            paletteIndex: 0,
            colorBase: '',
            newCount: 0,
            deletedCount: 0,
            recordings: [],
            newRecordings: [],
            deletedRecordings: [],
          },
        ],
      });
      renderWithStore();
      await waitFor(() => expect(capturedHook!.selectedTab).toBe('subscribed'));
    });

    it('ignores an invalid ?tab= value and uses the auto-select default', async () => {
      window.history.pushState({}, '', '/?tab=bogus');
      renderWithStore();
      await waitFor(() => expect(capturedHook!.isLoading).toBe(false));
      expect(capturedHook!.selectedTab).toBe('all');
    });
  });
});
