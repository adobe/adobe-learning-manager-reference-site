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
import { render, fireEvent } from '@testing-library/react';
import RecordingDetailView from '@components/Channels/RecordingDetailView/RecordingDetailView';
import { EVCChannel, EVCRecording } from '@models/ChannelModels';

// jsdom (used in CI) does not implement CSS.escape, which @react-aria/selection
// calls when the collapsed Breadcrumbs overflow menu opens. Provide a polyfill so
// the back-breadcrumb interaction test runs across all jsdom versions.
if (typeof (globalThis as any).CSS === 'undefined') {
  (globalThis as any).CSS = {};
}
(globalThis as any).CSS.escape = (value: string): string =>
  String(value).replace(/[^a-zA-Z0-9_-]/g, ch => '\\' + ch);

// Configurable hook state — reassigned in beforeEach and overridden per test.
// Names are prefixed with `mock` so jest's factory-hoisting allowlist permits them.
let mockSocial: any;
let mockComments: any;
let mockView: any;

jest.mock('@hooks/channels/useRecordingSocial', () => ({
  useRecordingSocial: () => mockSocial,
}));

jest.mock('@hooks/channels/useRecordingComments', () => ({
  useRecordingComments: () => mockComments,
}));

jest.mock('@hooks/channels/useRecordingView', () => ({
  useRecordingView: () => mockView,
}));

jest.mock('@utils/timeAgo', () => ({
  formatTimeAgo: () => '1 hour ago',
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  GetTranslationsReplaced: (key: string) => key,
}));

jest.mock('@utils/restAdapter', () => ({
  RestAdapter: { get: jest.fn(), ajax: jest.fn().mockResolvedValue(undefined) },
}));

const mockRecording: EVCRecording = {
  id: 'rec-1',
  title: 'Deep Dive into React',
  speaker: 'Alice Smith',
  speakerInitials: 'AS',
  date: 'Apr 30, 2025',
  tag: 'Engineering',
  duration: '45 min',
  url: 'https://example.com/video',
  thumbUrl: '',
  sourceKey: 'sk-1',
  postId: 'p1',
  recordingId: 'rid-1',
  status: 'ACTIVE',
  isDeleted: false,
  isNew: false,
  durationSeconds: null,
  publishedDateMs: null,
  createdDateMs: null,
  activityType: 'ACTIVE',
  channelId: 1,
  channelName: 'Tech Talks',
  boardId: 100,
  color: '',
  titleBg: '',
  titleText: '',
  dateTxt: '',
  badgeColor: '',
};

const mockChannel: EVCChannel = {
  id: 'ch-1',
  name: 'Tech Talks',
  description: '',
  boardId: 100,
  isSubscribed: false,
  enabled: true,
  state: 'ACTIVE',
  recordingCount: 1,
  paletteIndex: 0,
  colorBase: '#5a4fcf',
  newCount: 0,
  deletedCount: 0,
  recordings: [],
  newRecordings: [],
  deletedRecordings: [],
};

const onBack = jest.fn();
const onBackToList = jest.fn();
const onLikeToggled = jest.fn();

function makeComment(over: Partial<any> = {}) {
  return {
    id: 'c1',
    userName: 'Bob Jones',
    initials: 'BJ',
    dateCreated: 1700000000000,
    text: 'Great talk!',
    ...over,
  };
}

function renderDetailView(
  recordingOverrides?: Partial<EVCRecording>,
  props?: { viewedAtMs?: number }
) {
  return render(
    <RecordingDetailView
      recording={{ ...mockRecording, ...recordingOverrides }}
      channel={mockChannel}
      onBack={onBack}
      onBackToList={onBackToList}
      onLikeToggled={onLikeToggled}
      viewedAtMs={props?.viewedAtMs}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSocial = {
    stats: { likeCount: 3, viewCount: 10, commentCount: 1, isLiked: false, postId: 'p1' },
    isLiking: false,
    toggleLike: jest.fn().mockResolvedValue(undefined),
    refetchStats: jest.fn(),
    canLike: true,
  };
  mockComments = {
    comments: [],
    isLoading: false,
    commentError: null,
    commentText: '',
    setCommentText: jest.fn(),
    submitComment: jest.fn(),
    isPosting: false,
  };
  mockView = { trackView: jest.fn() };
});

describe('RecordingDetailView', () => {
  it('renders without throwing', () => {
    expect(() => renderDetailView()).not.toThrow();
  });

  it('renders the recording title, speaker, tag, duration and date', () => {
    const { getAllByText, getByText } = renderDetailView();
    // Title appears both as the hero heading and as the current breadcrumb item.
    expect(getAllByText('Deep Dive into React').length).toBeGreaterThan(0);
    expect(getByText('Alice Smith')).toBeTruthy();
    expect(getByText('Engineering')).toBeTruthy();
    expect(getByText('45 min')).toBeTruthy();
    expect(getByText('Apr 30, 2025')).toBeTruthy();
  });

  it('calls onBackToList when the Channels breadcrumb is selected', async () => {
    const { container, findByText } = renderDetailView();
    // Spectrum Breadcrumbs collapses leading items into an overflow menu in jsdom.
    fireEvent.click(container.querySelector('button[aria-haspopup="true"]')!);
    fireEvent.click(await findByText('evc.learner.btn.back'));
    expect(onBackToList).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();
  });

  it('calls onBack when the channel-name breadcrumb is selected', async () => {
    const { container, findByText } = renderDetailView();
    fireEvent.click(container.querySelector('button[aria-haspopup="true"]')!);
    fireEvent.click(await findByText('Tech Talks'));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onBackToList).not.toHaveBeenCalled();
  });

  it('opens watch video in a new tab with a safe URL', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const { getByText } = renderDetailView();
    fireEvent.click(getByText('evc.learner.btn.watchVideo').closest('button')!);
    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/video',
      '_blank',
      'noopener,noreferrer'
    );
    openSpy.mockRestore();
  });

  it('does not open watch video for a non-http URL', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const { getByText } = renderDetailView({ url: 'javascript:alert(1)' });
    fireEvent.click(getByText('evc.learner.btn.watchVideo').closest('button')!);
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('shows unavailable button when recording is deleted', () => {
    const { getByText } = renderDetailView({ isDeleted: true });
    expect(getByText('evc.learner.btn.unavailable')).toBeTruthy();
  });

  it('shows the watched badge when viewedAtMs is provided', () => {
    const { getByText } = renderDetailView({}, { viewedAtMs: Date.now() - 3600000 });
    expect(getByText('evc.learner.recording.watchedAgo')).toBeTruthy();
  });

  it('hides the hero thumbnail after an image load error', () => {
    const { container } = renderDetailView({ thumbUrl: 'https://example.com/thumb.jpg' });
    const img = container.querySelector('img[alt="Deep Dive into React"]') as HTMLImageElement;
    expect(img).toBeTruthy();
    fireEvent.error(img);
    expect(container.querySelector('img[alt="Deep Dive into React"]')).toBeNull();
  });

  it('renders view and like counts from stats', () => {
    const { getByText } = renderDetailView();
    expect(getByText('evc.learner.stats.views')).toBeTruthy();
    expect(getByText('evc.learner.stats.liked')).toBeTruthy();
  });

  it('does not render the stats block when stats are unavailable', () => {
    mockSocial.stats = null;
    const { queryByText } = renderDetailView();
    expect(queryByText('evc.learner.stats.views')).toBeNull();
  });

  it('toggles like and notifies parent when the like button is pressed', async () => {
    const { getByLabelText } = renderDetailView();
    fireEvent.click(getByLabelText('evc.learner.btn.like'));
    // Flush the onPress microtask (await toggleLike() → onLikeToggled()).
    await Promise.resolve();
    expect(mockSocial.toggleLike).toHaveBeenCalledTimes(1);
    expect(onLikeToggled).toHaveBeenCalledTimes(1);
  });

  it('shows the unlike label when the recording is already liked', () => {
    mockSocial.stats = { ...mockSocial.stats, isLiked: true };
    const { getByLabelText } = renderDetailView();
    expect(getByLabelText('evc.learner.btn.unlike')).toBeTruthy();
  });

  it('disables the like button while a like is in flight', () => {
    mockSocial.isLiking = true;
    const { getByLabelText } = renderDetailView();
    expect((getByLabelText('evc.learner.btn.like') as HTMLButtonElement).disabled).toBe(true);
  });

  it('submits a comment when the post button is pressed', () => {
    mockComments.commentText = 'Nice';
    const { getByText } = renderDetailView();
    fireEvent.click(getByText('evc.learner.btn.post').closest('button')!);
    expect(mockComments.submitComment).toHaveBeenCalledTimes(1);
  });

  it('submits a comment on Enter and updates text on change', () => {
    const { getByLabelText } = renderDetailView();
    const input = getByLabelText('evc.learner.comments.placeholder');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(mockComments.setCommentText).toHaveBeenCalledWith('Hello');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockComments.submitComment).toHaveBeenCalledTimes(1);
  });

  it('renders a comments list with author, text and date', () => {
    mockComments.comments = [makeComment({ id: 'c1', userName: 'Bob Jones', text: 'Great talk!' })];
    const { getByText } = renderDetailView();
    expect(getByText('Bob Jones')).toBeTruthy();
    expect(getByText('Great talk!')).toBeTruthy();
  });

  it('shows a load-more button and reveals all comments when clicked', () => {
    mockComments.comments = Array.from({ length: 6 }, (_, i) =>
      makeComment({ id: `c${i}`, text: `Comment ${i}`, initials: '', dateCreated: null })
    );
    const { getByText, queryByText } = renderDetailView();
    // 6 comments > page size of 5 → the oldest (Comment 0, last after reverse) is hidden initially.
    expect(queryByText('Comment 0')).toBeNull();
    fireEvent.click(getByText('evc.learner.comments.loadMore').closest('button')!);
    expect(getByText('Comment 0')).toBeTruthy();
  });

  it('shows the loading spinner while comments load', () => {
    mockComments.isLoading = true;
    const { getByLabelText } = renderDetailView();
    expect(getByLabelText('evc.learner.comments.loading')).toBeTruthy();
  });

  it('shows the empty-comments message when there are no comments', () => {
    const { getByText } = renderDetailView();
    expect(getByText('evc.learner.comments.empty.title')).toBeTruthy();
  });

  it('shows the unavailable message and hides the input when there is no post id', () => {
    mockSocial.stats = { ...mockSocial.stats, postId: null };
    const { getByText, queryByLabelText } = renderDetailView({ postId: null as any });
    expect(getByText('evc.learner.comments.unavailable.title')).toBeTruthy();
    expect(queryByLabelText('evc.learner.comments.placeholder')).toBeNull();
  });

  it('renders a comment error alert when commentError is set', () => {
    mockComments.commentError = 'Failed to post comment';
    const { getByText } = renderDetailView();
    expect(getByText('Failed to post comment')).toBeTruthy();
  });

  it('renders the singular comment count label for a single comment', () => {
    mockComments.comments = [makeComment()];
    const { getByText } = renderDetailView();
    expect(getByText('evc.learner.comments.count.singular')).toBeTruthy();
  });
});
