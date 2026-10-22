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
import { EVCChannel } from '../../../models/ChannelModels';
import {
  LOAD_CHANNELS,
  SET_CHANNELS_TAB,
  SET_CHANNELS_SEARCH,
  SET_CHANNELS_LOADING,
  SET_CHANNELS_ERROR,
  UPDATE_CHANNEL_SUBSCRIPTION,
  SET_LIKED_CHANNEL,
  SET_VIEWED_POSTS,
} from './actionTypes';

export const loadChannels = (channels: EVCChannel[]) => ({
  type: LOAD_CHANNELS,
  channels,
});

export const setChannelsTab = (tab: 'all' | 'subscribed' | 'new' | 'liked') => ({
  type: SET_CHANNELS_TAB,
  tab,
});

export const setChannelsSearch = (query: string) => ({
  type: SET_CHANNELS_SEARCH,
  query,
});

export const setChannelsLoading = (isLoading: boolean) => ({
  type: SET_CHANNELS_LOADING,
  isLoading,
});

export const setChannelsError = (error: string | null) => ({
  type: SET_CHANNELS_ERROR,
  error,
});

export const updateChannelSubscription = (channelId: string, isSubscribed: boolean) => ({
  type: UPDATE_CHANNEL_SUBSCRIPTION,
  channelId,
  isSubscribed,
});

export const setLikedChannel = (likedChannel: EVCChannel | null) => ({
  type: SET_LIKED_CHANNEL,
  likedChannel,
});

export const setViewedPosts = (viewedByPostId: Record<string, number>) => ({
  type: SET_VIEWED_POSTS,
  viewedByPostId,
});
