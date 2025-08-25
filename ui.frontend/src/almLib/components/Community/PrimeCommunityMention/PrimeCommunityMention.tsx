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
import parse from 'html-react-parser';
import { Link } from '@adobe/react-spectrum';
import { PrimeUser } from '../../../models';
import { ALMHoverPopover } from '../../Common/ALMHoverPopover';
import { useIntl } from 'react-intl';

interface PrimeCommunityMentionProps {
  htmlString: string;
  userMentions: PrimeUser[];
  className?: string;
}

export const PrimeCommunityMention: React.FC<PrimeCommunityMentionProps> = ({ 
  htmlString, 
  userMentions, 
  className 
}) => {
  // Create a map for quick user lookup
  const userMap: Record<string, PrimeUser> = {};
  const { formatMessage } = useIntl();
  userMentions.forEach(user => {
    userMap[`${user.type}:${user.id}`] = user;
  });

  // Parse the HTML string and replace mentions with React components
  const parseContent = (content: string): React.ReactNode => {
    // First replace @[user:123] patterns with placeholder elements
    const processedContent = content.replace(/@\[(user|usergroup):(\d+)\]/g, (match, type, id) => {
      const userId = `${type}:${id}`;
      const user = userMap[userId];
      
      if (user) {
        return `<mention data-user-id="${id}" data-type="${type}" data-value="${user.name}"></mention>`;
      } else {
        return match; // Keep original if user not found
      }
    });

    // Parse HTML and replace mention placeholders with React components
    return parse(processedContent, {
      replace: (domNode: any) => {
        if ((domNode.name === 'mention' || domNode.name === 'a') && domNode.attribs?.['data-user-id']) {
          const id = domNode.attribs['data-user-id'];
          const type = domNode.attribs['data-type'];
          const userId = `${type}:${id}`;
          const user = userMap[userId];

          if (user && user.name && user.state === 'ACTIVE') {
            return (
              <ALMHoverPopover.Root key={`mention-${userId}`} user={user}>
                <ALMHoverPopover.Trigger>
                  <Link 
                    href={`#user/${user.id}`} 
                    marginEnd="size-100"
                    UNSAFE_className="ql-mention mention"
                    data-user-id={user.id}
                    data-type={user.type}
                    data-value={user.name}
                  >
                    {user.name}
                  </Link>
                </ALMHoverPopover.Trigger>
                <ALMHoverPopover.Portal>
                  <ALMHoverPopover.Content>
                    <ALMHoverPopover.UserCard />
                  </ALMHoverPopover.Content>
                </ALMHoverPopover.Portal>
              </ALMHoverPopover.Root>
            );
          } else {
            return (
              <span>
                {formatMessage({
                  id: "alm.community.board.anonymous.label",
                  defaultMessage: "Anonymous",
                })}
              </span>
            ); // Fallback for unknown users
          }
        }
      }
    });
  };

  return (
    <div className={className}>
      {parseContent(htmlString)}
    </div>
  );
}; 