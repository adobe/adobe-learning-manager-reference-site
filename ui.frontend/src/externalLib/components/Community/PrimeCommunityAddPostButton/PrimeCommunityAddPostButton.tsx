import { useIntl } from "react-intl";
import { PrimeCommunityAddPostDialogTrigger } from "../PrimeCommunityAddPostDialogTrigger";

const PrimeCommunityAddPostButton = (props: any) => {
    const { formatMessage } = useIntl();
    const saveHandler = ((input: any, postingType: any, resource: any, isResourceModified: any, pollOptions: any) => {
        if (typeof props.savePostHandler === "function") {
            props.savePostHandler(input, postingType, resource, isResourceModified, pollOptions);
        }
    });

    return (
        <>
            <PrimeCommunityAddPostDialogTrigger
                buttonLabel={formatMessage({id: "prime.community.newPost.label", defaultMessage: "New Post",})}
                savePostHandler={(input: any, postingType: any, resource: any, isResourceModified: any, pollOptions: any) => {saveHandler(input, postingType, resource, isResourceModified, pollOptions)}}
            ></PrimeCommunityAddPostDialogTrigger>
        </>
    );
};
export default PrimeCommunityAddPostButton;