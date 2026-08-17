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
import { useState } from 'react';
import {
  ActionButton,
  Breadcrumbs,
  Button,
  Content,
  Divider,
  Flex,
  Heading,
  IllustratedMessage,
  InlineAlert,
  Item,
  lightTheme,
  ProgressCircle,
  Provider,
  Text,
  TextField,
  ToggleButton,
  Tooltip,
  TooltipTrigger,
  View,
} from '@adobe/react-spectrum';
import Play from '@spectrum-icons/workflow/Play';
import Send from '@spectrum-icons/workflow/Send';
import ThumbUp from '@spectrum-icons/workflow/ThumbUp';
import ThumbUpOutline from '@spectrum-icons/workflow/ThumbUpOutline';
import { EVCChannel, EVCRecording } from '../../../models/ChannelModels';
import { useRecordingSocial } from '../../../hooks/channels/useRecordingSocial';
import { useRecordingComments } from '../../../hooks/channels/useRecordingComments';
import { useRecordingView } from '../../../hooks/channels/useRecordingView';
import { formatTimeAgo } from '../../../utils/timeAgo';
import { GetTranslation, GetTranslationsReplaced } from '../../../utils/translationService';
import { safeHttpUrl } from '../../../utils/urlUtils';
import { formatCount, formatCommentDate } from '../../../utils/channelUtils';
import { EVC_NO_BOARD_SVG, EVC_EMPTY_COMMENTS_SVG } from '../../../utils/inline_svg';
import styles from './RecordingDetailView.module.css';

interface RecordingDetailViewProps {
  recording: EVCRecording;
  channel: EVCChannel;
  /** Navigate up one level, back to the channel's recording grid. */
  onBack: () => void;
  /** Navigate up to the top-level channels list. */
  onBackToList: () => void;
  onLikeToggled?: () => void;
  onViewTracked?: () => void;
  viewedAtMs?: number;
}

const COMMENTS_PAGE_SIZE = 5;

const RecordingDetailView = ({
  recording,
  channel,
  onBack,
  onBackToList,
  onLikeToggled,
  onViewTracked,
  viewedAtMs,
}: RecordingDetailViewProps) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const { stats, isLiking, toggleLike, refetchStats, canLike } = useRecordingSocial(
    channel.id,
    recording.boardId,
    recording.postId,
    recording.sourceKey,
    true,
    recording.id
  );

  const resolvedPostId = stats?.postId || recording.postId || null;

  const { trackView } = useRecordingView(
    channel.id,
    recording.boardId,
    resolvedPostId,
    onViewTracked,
    refetchStats
  );

  const {
    comments,
    isLoading: commentsLoading,
    commentError,
    commentText,
    setCommentText,
    submitComment,
    isPosting,
  } = useRecordingComments(channel.id, recording.boardId, resolvedPostId);

  const reversedComments = [...comments].reverse();
  const visibleComments = showAllComments
    ? reversedComments
    : reversedComments.slice(0, COMMENTS_PAGE_SIZE);
  const hasMore = !showAllComments && comments.length > COMMENTS_PAGE_SIZE;

  const commentCountLabel =
    comments.length === 1
      ? GetTranslation('evc.learner.comments.count.singular')
      : GetTranslationsReplaced('evc.learner.comments.count.plural', { count: comments.length });

  return (
    <Provider theme={lightTheme} colorScheme="light">
      <View UNSAFE_className={styles.detailPage}>
        {/* Breadcrumb — three levels here (list › channel grid › this recording),
            so the channel name is a middle link, not the current-page leaf. */}
        <Breadcrumbs
          onAction={key => {
            if (key === 'list') onBackToList();
            else if (key === 'channel') onBack();
          }}
        >
          <Item key="list">{GetTranslation('evc.learner.btn.back')}</Item>
          <Item key="channel">{channel.name}</Item>
          <Item key="current">{recording.title}</Item>
        </Breadcrumbs>

        {/* Hero banner — background is the channel's admin color (colorBase),
            matching the strip/grid cards, instead of the --evc-palette class. */}
        <div className={styles.hero} style={{ backgroundColor: channel.colorBase }}>
          {!thumbError && (
            <img
              className={styles.heroBg}
              src={recording.thumbUrl}
              alt={recording.title}
              onError={() => setThumbError(true)}
            />
          )}
          <div className={styles.heroGradient} />
          <div className={styles.heroContent}>
            {recording.tag && <div className={styles.heroTag}>{recording.tag}</div>}
            <h1 className={styles.heroTitle}>{recording.title}</h1>
            {recording.speaker && <div className={styles.instructorName}>{recording.speaker}</div>}
            <div className={styles.heroMeta}>
              {recording.duration && <span>{recording.duration}</span>}
              {recording.duration && recording.date && <span aria-hidden="true"> &middot; </span>}
              {recording.date && <span>{recording.date}</span>}
              {viewedAtMs && (
                <span className={styles.watchedBadge}>
                  {GetTranslationsReplaced('evc.learner.recording.watchedAgo', {
                    time: formatTimeAgo(viewedAtMs),
                  })}
                </span>
              )}
            </div>
            <Flex alignItems="center" gap="size-200" wrap UNSAFE_className={styles.heroButtons}>
              {recording.isDeleted ? (
                <Button variant="primary" staticColor="white" style="fill" isDisabled>
                  <Text>{GetTranslation('evc.learner.btn.unavailable')}</Text>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  staticColor="white"
                  style="fill"
                  onPress={() => {
                    trackView();
                    const url = safeHttpUrl(recording.url);
                    if (url) window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <Play />
                  <Text>{GetTranslation('evc.learner.btn.watchVideo')}</Text>
                </Button>
              )}

              <TooltipTrigger delay={0}>
                <ToggleButton
                  staticColor="white"
                  isSelected={!!stats?.isLiked}
                  isDisabled={isLiking || !canLike}
                  onPress={async () => {
                    await toggleLike();
                    onLikeToggled?.();
                  }}
                  aria-label={
                    stats?.isLiked
                      ? GetTranslation('evc.learner.btn.unlike')
                      : GetTranslation('evc.learner.btn.like')
                  }
                >
                  {stats?.isLiked ? <ThumbUp /> : <ThumbUpOutline />}
                  {stats != null && stats.likeCount > 0 && <Text>{stats.likeCount}</Text>}
                </ToggleButton>
                <Tooltip>
                  {stats?.isLiked
                    ? GetTranslation('evc.learner.btn.unlike')
                    : GetTranslation('evc.learner.btn.like')}
                </Tooltip>
              </TooltipTrigger>

              {stats != null && (
                <Flex
                  alignItems="center"
                  gap="size-150"
                  height="size-500"
                  UNSAFE_className={styles.stats}
                >
                  <Flex direction="column" alignItems="center" UNSAFE_className={styles.stat}>
                    <Text UNSAFE_className={styles.statValue}>{formatCount(stats.viewCount)}</Text>
                    <Text UNSAFE_className={styles.statLabel}>
                      {GetTranslation('evc.learner.stats.views')}
                    </Text>
                  </Flex>
                  <Divider
                    orientation="vertical"
                    size="S"
                    alignSelf="stretch"
                    UNSAFE_className={styles.statDivider}
                  />
                  <Flex direction="column" alignItems="center" UNSAFE_className={styles.stat}>
                    <Text UNSAFE_className={styles.statValue}>{formatCount(stats.likeCount)}</Text>
                    <Text UNSAFE_className={styles.statLabel}>
                      {GetTranslation('evc.learner.stats.liked')}
                    </Text>
                  </Flex>
                </Flex>
              )}
            </Flex>
          </div>
        </div>

        {/* Discussion thread */}
        <div className={styles.thread}>
          <div className={styles.threadBanner}>
            <div className={styles.threadBannerInner}>
              <div>
                <Heading level={3} margin={0} UNSAFE_className={styles.threadTitle}>
                  {GetTranslation('evc.learner.comments.startDiscussion')}
                </Heading>
                <Text UNSAFE_className={styles.threadSubtitle}>
                  {GetTranslation('evc.learner.comments.subtitle')}
                </Text>
              </div>
              <Text UNSAFE_className={styles.threadCount}>{commentCountLabel}</Text>
            </div>
          </div>

          <div className={styles.threadInner}>
            {resolvedPostId && (
              <Flex UNSAFE_className={styles.commentInputRow}>
                <TextField
                  flex
                  aria-label={GetTranslation('evc.learner.comments.placeholder')}
                  placeholder={GetTranslation('evc.learner.comments.placeholder')}
                  value={commentText}
                  onChange={setCommentText}
                  onKeyDown={e => {
                    if (e.key === 'Enter') submitComment();
                  }}
                  isDisabled={isPosting}
                />
                <ActionButton onPress={submitComment} isDisabled={isPosting || !commentText.trim()}>
                  <Send />
                  <Text>{GetTranslation('evc.learner.btn.post')}</Text>
                </ActionButton>
              </Flex>
            )}

            {commentsLoading ? (
              <Flex justifyContent="center" marginY="size-400">
                <ProgressCircle
                  isIndeterminate
                  aria-label={GetTranslation('evc.learner.comments.loading')}
                />
              </Flex>
            ) : visibleComments.length > 0 ? (
              <div className={styles.commentList}>
                {visibleComments.map(c => (
                  <div key={c.id} className={styles.commentItem}>
                    <div className={styles.commentAvatar}>{c.initials || 'U'}</div>
                    <div className={styles.commentContent}>
                      <div className={styles.commentMeta}>
                        <span className={styles.commentAuthor}>{c.userName}</span>
                        {c.dateCreated && (
                          <span className={styles.commentDate}>
                            {formatCommentDate(c.dateCreated)}
                          </span>
                        )}
                      </div>
                      <div className={styles.commentText}>{c.text}</div>
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <Button
                    variant="secondary"
                    onPress={() => setShowAllComments(true)}
                    alignSelf="center"
                    marginTop="size-150"
                  >
                    <Text>{GetTranslation('evc.learner.comments.loadMore')}</Text>
                  </Button>
                )}
              </div>
            ) : !resolvedPostId ? (
              <IllustratedMessage>
                <EVC_NO_BOARD_SVG />
                <Heading>{GetTranslation('evc.learner.comments.unavailable.title')}</Heading>
                <Content>{GetTranslation('evc.learner.comments.unavailable.msg')}</Content>
              </IllustratedMessage>
            ) : (
              <IllustratedMessage>
                <EVC_EMPTY_COMMENTS_SVG />
                <Heading>{GetTranslation('evc.learner.comments.empty.title')}</Heading>
                <Content>{GetTranslation('evc.learner.comments.empty.msg')}</Content>
              </IllustratedMessage>
            )}

            {commentError && (
              <InlineAlert variant="negative" marginTop="size-200" width="100%">
                <Content>{commentError}</Content>
              </InlineAlert>
            )}
          </div>
        </div>
      </View>
    </Provider>
  );
};

export default RecordingDetailView;
