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

import { PrimeUser } from "../models";
import { getALMConfig } from "./global";
import { JsonApiParse } from "./jsonAPIAdapter";
import { RestAdapter } from "./restAdapter";

export const loadMentionedUsers = async (
  boardId: string,
  searchTerm: string,
): Promise<PrimeUser[]> => {
  try {
    const baseApiUrl = getALMConfig().primeApiURL;
    const response = await RestAdapter.get({
      url: `${baseApiUrl}/social/board/${boardId}/user/search?${encodeURIComponent("query")}=${searchTerm}&include=model`,
    });
    const parsedResponse = JsonApiParse(response).userList;
    console.log("parsedResponse", parsedResponse);
    return parsedResponse;
  } catch (error) {
    console.error("Error loading mentioned users:", error);
    return [];
  }
};

export function formatMention(text: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const mentions = doc.getElementsByClassName('ql-mention mention');

  Array.from(mentions).forEach(mention => {
    const id = mention.getAttribute('data-id');
    const type = mention.getAttribute('data-type');

    if (id && type) {
      const newFormat = `@[${type}:${id}]`;
      const textNode = doc.createTextNode(newFormat);
      mention.parentNode?.replaceChild(textNode, mention);
    }
  });

  return doc.body.innerHTML;
}

export function getRootParentId(obj: any) {
  if (!obj || !obj.parent) {
    return null;
  }

  // Traverse until we reach the topmost parent with no further parent
  let current = obj.parent;
  while (current.parent) {
    current = current.parent;
  }

  return current.id || null;
}

export function processMention(text: string, users: PrimeUser[]): string {
  const mentionRegex = /@\[(user|usergroup):(\d+)\]/g;
  const mentionTemplates: string[] = [];
  let textWithPlaceholders = text;

  // 1. Replace mentions with placeholders and store templates
  textWithPlaceholders = textWithPlaceholders.replace(mentionRegex, (match, type, id) => {
    const user = users.find(u => u.id.toString() === id && u.type === type);
    if (user) {
      const mentionHtml = `<a href="#" class="ql-mention mention" data-id="${id}" data-type="${type}" data-value="${user.name}">${user.name}</a>`;
      mentionTemplates.push(mentionHtml);
      return `%%MENTION_${mentionTemplates.length - 1}%%`;
    }
    return "Anonymous"; // Fallback for unknown users
  });

  // 2. Replace placeholders with mention HTML
  const placeholderRegex = /%%MENTION_(\d+)%%/g;
  let result = textWithPlaceholders;
  
  result = result.replace(placeholderRegex, (match, index) => {
    const mentionIdx = parseInt(index, 10);
    return mentionTemplates[mentionIdx] || match;
  });

  return result;
}