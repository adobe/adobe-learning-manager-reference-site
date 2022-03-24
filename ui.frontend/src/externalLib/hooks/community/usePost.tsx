import { useCallback } from "react";
import { getALMConfig } from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";

export const usePost = () => {
  const addPost = useCallback(
    async (boardId: any, input: any, postingType: any, resource: any) => {
      // try {
      const baseApiUrl = getALMConfig().primeApiURL;
      const postBody = {
        data: {
          type: "post",
          attributes: {
            postingType: postingType,
            resource: resource,
            state: "ACTIVE",
            text: input,
          },
        },
      };
      const headers = { "content-type": "application/json" };
      await RestAdapter.ajax({
        url: `${baseApiUrl}/boards/${boardId}/posts`,
        method: "POST",
        body: JSON.stringify(postBody),
        headers: headers,
      });
      //   const parsedResponse = JsonApiParse(response);
    },
    []
  );

  //to-do, correct below after bug fix
  const updatePost = useCallback(
    async (
      postId: any,
      input: any,
      postingType: any,
      resource: any,
      isResourceModified: any
    ) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const postBody = isResourceModified
        ? {
            data: {
              type: "post",
              id: postId,
              attributes: {
                postingType: postingType,
                state: "ACTIVE",
                text: input,
                resource: resource,
              },
            },
          }
        : {
            data: {
              type: "post",
              id: postId,
              attributes: {
                postingType: postingType,
                state: "ACTIVE",
                text: input,
              },
            },
          };
      const headers = { "content-type": "application/json" };
      await RestAdapter.ajax({
        url: `${baseApiUrl}/posts/${postId}`,
        method: "PATCH",
        body: JSON.stringify(postBody),
        headers: headers,
      });
    },
    []
  );

  const addComment = useCallback(async (postId: any, input: any) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    const postBody = {
      data: {
        type: "comment",
        attributes: {
          state: "ACTIVE",
          text: input,
        },
      },
    };
    const headers = { "content-type": "application/json" };
    await RestAdapter.ajax({
      url: `${baseApiUrl}/posts/${postId}/comments`,
      method: "POST",
      body: JSON.stringify(postBody),
      headers: headers,
    });
    //   const parsedResponse = JsonApiParse(response);
  }, []);

  const votePost = useCallback(async (postId: any, action: any) => {
    // try {
    const baseApiUrl = getALMConfig().primeApiURL;
    //   const params: QueryParams = {};
    await RestAdapter.ajax({
      url: `${baseApiUrl}/posts/${postId}/vote?action=${action}`,
      method: "POST",
    });
    //   const parsedResponse = JsonApiParse(response);
  }, []);

  const deletePostVote = useCallback(async (postId: any, action: any) => {
    // try {
    const baseApiUrl = getALMConfig().primeApiURL;
    //   const params: QueryParams = {};
    await RestAdapter.ajax({
      url: `${baseApiUrl}/posts/${postId}/vote?action=${action}`,
      method: "DELETE",
    });
    //   const parsedResponse = JsonApiParse(response);
  }, []);

  return {
    addPost,
    updatePost,
    addComment,
    votePost,
    deletePostVote,
  };
};
