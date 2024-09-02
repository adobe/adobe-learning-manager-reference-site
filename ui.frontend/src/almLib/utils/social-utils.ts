import { GetTranslation } from "./translationService";

export const getAlmConfirmationBadwordParams = (type: string) => {
  return {
    title: GetTranslation("alm.community.postNotPublished.label"),
    body: GetTranslation("alm.community.postNotPublished.badWordFound"),
    actionlabel: GetTranslation("text.close"),
  };
};
