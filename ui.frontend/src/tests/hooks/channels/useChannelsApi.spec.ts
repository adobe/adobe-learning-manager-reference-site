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
import { getALMConfig } from '@utils/global';
import { RestAdapter } from '@utils/restAdapter';
import {
  fetchChannels,
  fetchLikedPostIds,
  fetchViewedPosts,
  toggleSubscription,
} from '@hooks/channels/useChannelsApi';

jest.mock('@utils/restAdapter', () => ({
  RestAdapter: {
    get: jest.fn(),
    ajax: jest.fn(),
  },
}));

const mockGet = RestAdapter.get as jest.Mock;
const mockAjax = RestAdapter.ajax as jest.Mock;
const mockGetALMConfig = getALMConfig as jest.Mock;

const primeConfig = {
  primeApiURL: 'https://test.example.com/primeapi/v2/',
  usageType: 'aem-sites',
};

const nonPrimeConfig = {
  primeApiURL: 'https://test.example.com/primeapi/v2/',
  usageType: 'aem-commerce',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchChannels', () => {
  it('returns empty channels for non-Prime deployment', async () => {
    mockGetALMConfig.mockReturnValue(nonPrimeConfig);
    const result = await fetchChannels();
    expect(result.channels).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('calls RestAdapter.get for Prime deployment', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    mockGet.mockResolvedValue(JSON.stringify({ data: [], included: [] }));
    const result = await fetchChannels();
    expect(mockGet).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining('channels') })
    );
    expect(result.channels).toHaveLength(0);
  });

  it('parses JSON:API response into channel view model', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    const jsonApi = {
      data: [
        {
          id: 'ch-1',
          type: 'channel',
          attributes: {
            name: 'Tech Talks',
            isSubscribed: true,
            enabled: true,
            state: 'ACTIVE',
          },
        },
      ],
      included: [],
    };
    mockGet.mockResolvedValue(JSON.stringify(jsonApi));
    const result = await fetchChannels();
    expect(result.channels).toHaveLength(1);
    expect(result.channels[0].name).toBe('Tech Talks');
    expect(result.channels[0].isSubscribed).toBe(true);
  });

  it('applies the admin color to the channel and backfills recording tiles', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    const jsonApi = {
      data: [
        {
          id: '5',
          type: 'channel',
          attributes: {
            name: 'Colored Channel',
            isSubscribed: false,
            enabled: true,
            state: 'ACTIVE',
            color: '#5a4fcf',
          },
        },
      ],
      included: [
        {
          id: 'r1',
          type: 'channelRecording',
          attributes: {
            title: 'Recording 1',
            channelId: 5,
            activityType: 'ACTIVE',
            postId: 'p1',
          },
        },
      ],
    };
    mockGet.mockResolvedValue(JSON.stringify(jsonApi));
    const result = await fetchChannels();
    expect(result.channels[0].colorBase).toBe('#5a4fcf');
    const rec = result.channels[0].recordings[0];
    expect(rec.color).toBe('#5a4fcf');
    expect(rec.titleBg).toBe('#5a4fcf');
    expect(typeof rec.thumbUrl).toBe('string');
    expect(rec.thumbUrl.length).toBeGreaterThan(0);
  });

  it('falls back to a palette color when the channel has a blank color', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    const jsonApi = {
      data: [
        {
          id: 'ch-blank',
          type: 'channel',
          attributes: { name: 'Blank', enabled: true, state: 'ACTIVE', color: '   ' },
        },
      ],
      included: [],
    };
    mockGet.mockResolvedValue(JSON.stringify(jsonApi));
    const result = await fetchChannels();
    expect(result.channels[0].colorBase).toContain('--evc-palette-');
  });
});

describe('fetchLikedPostIds', () => {
  it('returns empty Set for non-Prime', async () => {
    mockGetALMConfig.mockReturnValue(nonPrimeConfig);
    const result = await fetchLikedPostIds();
    expect(result.size).toBe(0);
  });

  it('returns Set of liked post IDs for Prime', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    mockGet.mockResolvedValue(JSON.stringify({ meta: { likedPostIds: ['1', '2', '3'] } }));
    const result = await fetchLikedPostIds();
    expect(result.size).toBe(3);
    expect(result.has('2')).toBe(true);
  });

  it('returns empty Set on API error', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    mockGet.mockRejectedValue(new Error('Network error'));
    const result = await fetchLikedPostIds();
    expect(result.size).toBe(0);
  });
});

describe('fetchViewedPosts', () => {
  it('returns empty object for non-Prime', async () => {
    mockGetALMConfig.mockReturnValue(nonPrimeConfig);
    const result = await fetchViewedPosts();
    expect(result).toEqual({});
  });

  it('returns map of postId → viewedAtMs', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    mockGet.mockResolvedValue(
      JSON.stringify({
        meta: {
          viewedPosts: [
            { postId: 'p1', viewedAtMs: 1700000000000 },
            { postId: 'p2', viewedAtMs: 1700000001000 },
          ],
        },
      })
    );
    const result = await fetchViewedPosts();
    expect(result['p1']).toBe(1700000000000);
    expect(result['p2']).toBe(1700000001000);
  });

  it('returns empty object on API error', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    mockGet.mockRejectedValue(new Error('Network error'));
    const result = await fetchViewedPosts();
    expect(result).toEqual({});
  });
});

describe('toggleSubscription', () => {
  it('does nothing for non-Prime', async () => {
    mockGetALMConfig.mockReturnValue(nonPrimeConfig);
    await toggleSubscription('ch-1', true);
    expect(mockAjax).not.toHaveBeenCalled();
  });

  it('calls POST to subscribe', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    mockAjax.mockResolvedValue(undefined);
    await toggleSubscription('ch-1', true);
    expect(mockAjax).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', url: expect.stringContaining('ch-1') })
    );
  });

  it('calls DELETE to unsubscribe', async () => {
    mockGetALMConfig.mockReturnValue(primeConfig);
    mockAjax.mockResolvedValue(undefined);
    await toggleSubscription('ch-1', false);
    expect(mockAjax).toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE' }));
  });
});
