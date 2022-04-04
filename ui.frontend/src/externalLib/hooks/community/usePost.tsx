import { useCallback } from "react";
import { getALMConfig } from "../../utils/global";
import { RestAdapter } from "../../utils/restAdapter";

export const usePost = () => {
  const addPost = useCallback(
    async (
      boardId: any,
      input: any,
      postingType: any,
      resource: any,
      isResourceModified: any,
      pollOptions: any
    ) => {
      // try {
      const baseApiUrl = getALMConfig().primeApiURL;
      const postBody: any = {
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

      if(isResourceModified) {
        postBody.data.attributes.resource = resource;
      }

      if(postingType === "POLL") {
        let otherData = [] as any;
        let index = 1;
        pollOptions.map((value: any) => {
          if (value !== "") {
            let data = {
              "id": index++,
              "text": value,
              "resourceId": null
            }
            return otherData.push(data);
          }
          return null;
        });
        postBody.data.attributes.otherData = JSON.stringify(otherData);
      }

      const headers = { "content-type": "application/json" };
      await RestAdapter.ajax({
        url: `${baseApiUrl}/boards/${boardId}/posts`,
        method: "POST",
        body: JSON.stringify(postBody),
        headers: headers,
      });
    },
    []
  );

  const patchPost = useCallback(async (postId: any, input: any, postingType: any, resource: any, isResourceModified: any, pollOptions) => {
      const baseApiUrl =  getALMConfig().primeApiURL;
      const postBody:any = 
      {
        "data":{
          "type":"post",
          "id": postId,
          "attributes": {
            "postingType": postingType,
            "state": "ACTIVE",
            "text": input,
          }
        }
      }

      if(isResourceModified) {
        postBody.data.attributes.resource = resource;
      }

      if(postingType === "POLL") {
        let otherData = [] as any;
        let index = 1;
        pollOptions.map((value: any) => {
          if(value !== "") {
            return otherData.push("{\"id\":" + (index++) + ",\"text\":\"" + value + "\",\"resourceId\":null}");
          }
          return null;
        });
        postBody.data.attributes.otherData = JSON.stringify(otherData);
      }

      const headers = { "content-type": "application/json" };
      await RestAdapter.ajax({
          url: `${baseApiUrl}/posts/${postId}`,
          method:"PATCH",
          body: JSON.stringify(postBody),
          headers: headers
      });
  }, []);

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

  const submitPollVote = useCallback(
    async (postId: any, optionId: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      await RestAdapter.ajax({
        url: `${baseApiUrl}/posts/${postId}/pollvote?optionId=${optionId}`,
        method: "POST",
      });
  },[]);

  return {
    addPost,
    patchPost,
    addComment,
    votePost,
    deletePostVote,
    submitPollVote
  };
};
