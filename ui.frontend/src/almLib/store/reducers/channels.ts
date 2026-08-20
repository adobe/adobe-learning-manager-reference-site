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
import { AnyAction } from 'redux';
import { EVCChannel } from '../../models/ChannelModels';
import { CHANNEL_TAB, ChannelTab } from '../../utils/constants';

const MAX_VIEWED_CACHE = 500;
import {
  LOAD_CHANNELS,
  SET_CHANNELS_TAB,
  SET_CHANNELS_SEARCH,
  SET_CHANNELS_LOADING,
  SET_CHANNELS_ERROR,
  UPDATE_CHANNEL_SUBSCRIPTION,
  SET_LIKED_CHANNEL,
  SET_VIEWED_POSTS,
} from '../actions/channels/actionTypes';

export interface ChannelsState {
  channels: EVCChannel[];
  likedChannel: EVCChannel | null;
  selectedTab: ChannelTab;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  viewedByPostId: Record<string, number>;
}

const initialState: ChannelsState = {
  channels: [],
  likedChannel: null,
  selectedTab: CHANNEL_TAB.ALL,
  searchQuery: '',
  isLoading: false,
  error: null,
  viewedByPostId: {},
};

const channels = (state: ChannelsState = initialState, action: AnyAction): ChannelsState => {
  switch (action.type) {
    case LOAD_CHANNELS:
      return {
        ...state,
        channels: action.channels,
        isLoading: false,
        error: null,
      };
    case SET_CHANNELS_TAB:
      return { ...state, selectedTab: action.tab };
    case SET_CHANNELS_SEARCH:
      return { ...state, searchQuery: action.query };
    case SET_CHANNELS_LOADING:
      return { ...state, isLoading: action.isLoading };
    case SET_CHANNELS_ERROR:
      return { ...state, error: action.error, isLoading: false };
    case UPDATE_CHANNEL_SUBSCRIPTION:
      return {
        ...state,
        channels: state.channels.map(ch =>
          ch.id === action.channelId ? { ...ch, isSubscribed: action.isSubscribed } : ch
        ),
      };
    case SET_LIKED_CHANNEL:
      return { ...state, likedChannel: action.likedChannel };
    case SET_VIEWED_POSTS: {
      const entries = Object.entries(action.viewedByPostId as Record<string, number>);
      const viewedByPostId =
        entries.length <= MAX_VIEWED_CACHE
          ? action.viewedByPostId
          : Object.fromEntries(entries.sort((a, b) => b[1] - a[1]).slice(0, MAX_VIEWED_CACHE));
      return { ...state, viewedByPostId };
    }
    default:
      return state;
  }
};

export default channels;
