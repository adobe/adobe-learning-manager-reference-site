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
import { useCallback } from "react";
import { getALMConfig } from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";

export const useReply = () => {
  const voteReply = useCallback(async (postId: any, action: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    await RestAdapter.ajax({
      url: `${baseApiUrl}/replies/${postId}/vote?action=${action}`,
      method: "POST",
    });
  }, []);

  const deleteReplyVote = useCallback(async (postId: any, action: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    await RestAdapter.ajax({
      url: `${baseApiUrl}/replies/${postId}/vote?action=${action}`,
      method: "DELETE",
    });
  }, []);

  return {
    voteReply,
    deleteReplyVote,
  };
};
