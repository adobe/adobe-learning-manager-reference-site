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
import reducer, { ChannelsState } from '@almStore/reducers/channels';
import {
  LOAD_CHANNELS,
  SET_CHANNELS_TAB,
  SET_CHANNELS_SEARCH,
  SET_CHANNELS_LOADING,
  SET_CHANNELS_ERROR,
  UPDATE_CHANNEL_SUBSCRIPTION,
  SET_LIKED_CHANNEL,
  SET_VIEWED_POSTS,
} from '@almStore/actions/channels/actionTypes';
import { EVCChannel } from '@models/ChannelModels';

const initialState: ChannelsState = {
  channels: [],
  likedChannel: null,
  selectedTab: 'all',
  searchQuery: '',
  isLoading: false,
  error: null,
  viewedByPostId: {},
};

const mockChannel: EVCChannel = {
  id: 'ch-1',
  name: 'Test Channel',
  description: '',
  boardId: null,
  isSubscribed: false,
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
};

describe('channels reducer', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('LOAD_CHANNELS stores channels and clears loading/error', () => {
    const state = reducer(
      { ...initialState, isLoading: true, error: 'oops' },
      { type: LOAD_CHANNELS, channels: [mockChannel] }
    );
    expect(state.channels).toHaveLength(1);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('SET_CHANNELS_TAB updates selectedTab', () => {
    const state = reducer(initialState, { type: SET_CHANNELS_TAB, tab: 'subscribed' });
    expect(state.selectedTab).toBe('subscribed');
  });

  it('SET_CHANNELS_SEARCH updates searchQuery', () => {
    const state = reducer(initialState, { type: SET_CHANNELS_SEARCH, query: 'react' });
    expect(state.searchQuery).toBe('react');
  });

  it('SET_CHANNELS_LOADING updates isLoading', () => {
    const state = reducer(initialState, { type: SET_CHANNELS_LOADING, isLoading: true });
    expect(state.isLoading).toBe(true);
  });

  it('SET_CHANNELS_ERROR stores error and clears loading', () => {
    const state = reducer(
      { ...initialState, isLoading: true },
      { type: SET_CHANNELS_ERROR, error: 'Network error' }
    );
    expect(state.error).toBe('Network error');
    expect(state.isLoading).toBe(false);
  });

  it('UPDATE_CHANNEL_SUBSCRIPTION flips isSubscribed for matching channel', () => {
    const withChannel = { ...initialState, channels: [mockChannel] };
    const state = reducer(withChannel, {
      type: UPDATE_CHANNEL_SUBSCRIPTION,
      channelId: 'ch-1',
      isSubscribed: true,
    });
    expect(state.channels[0].isSubscribed).toBe(true);
  });

  it('UPDATE_CHANNEL_SUBSCRIPTION does not affect other channels', () => {
    const other: EVCChannel = { ...mockChannel, id: 'ch-2' };
    const withChannels = { ...initialState, channels: [mockChannel, other] };
    const state = reducer(withChannels, {
      type: UPDATE_CHANNEL_SUBSCRIPTION,
      channelId: 'ch-1',
      isSubscribed: true,
    });
    expect(state.channels[1].isSubscribed).toBe(false);
  });

  it('SET_LIKED_CHANNEL stores liked channel', () => {
    const liked: EVCChannel = { ...mockChannel, id: 'liked', isPseudo: true };
    const state = reducer(initialState, { type: SET_LIKED_CHANNEL, likedChannel: liked });
    expect(state.likedChannel?.id).toBe('liked');
  });

  it('SET_VIEWED_POSTS stores viewedByPostId', () => {
    const viewed = { 'post-1': 1700000000000, 'post-2': 1700000001000 };
    const state = reducer(initialState, { type: SET_VIEWED_POSTS, viewedByPostId: viewed });
    expect(state.viewedByPostId['post-1']).toBe(1700000000000);
  });

  it('SET_VIEWED_POSTS caps at 500 entries, keeping most recent', () => {
    const big: Record<string, number> = {};
    for (let i = 0; i < 600; i++) big[`p${i}`] = i;
    const state = reducer(initialState, { type: SET_VIEWED_POSTS, viewedByPostId: big });
    expect(Object.keys(state.viewedByPostId)).toHaveLength(500);
    // Highest timestamps should be kept
    expect(state.viewedByPostId['p599']).toBe(599);
  });
});
