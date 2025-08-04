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
import { useIntl } from "react-intl";
import { PrimeCommunityAddPostDialogTrigger } from "../PrimeCommunityAddPostDialogTrigger";

const PrimeCommunityAddPostButton = (props: any) => {
  const { formatMessage } = useIntl();
  const saveHandler = (
    input: any,
    postingType: any,
    resource: any,
    isResourceModified: any,
    pollOptions: any
  ) => {
    if (typeof props.savePostHandler === "function") {
      props.savePostHandler(
        input,
        postingType,
        resource,
        isResourceModified,
        pollOptions
      );
    }
  };

  return (
    <>
      <PrimeCommunityAddPostDialogTrigger
        buttonLabel={formatMessage({
          id: "alm.community.newPost.label",
          defaultMessage: "New Post",
        })}
        savePostHandler={(
          input: any,
          postingType: any,
          resource: any,
          isResourceModified: any,
          pollOptions: any
        ) => {
          saveHandler(
            input,
            postingType,
            resource,
            isResourceModified,
            pollOptions
          );
        }}
        inMobileView={props.inMobileView}
        boardId={props.boardId}
      ></PrimeCommunityAddPostDialogTrigger>
    </>
  );
};
export default PrimeCommunityAddPostButton;
