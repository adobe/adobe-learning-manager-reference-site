import { AnyAction, combineReducers, Reducer } from "redux";
import {
  PrimeBoard,
  PrimeComment,
  PrimePost,
  PrimePostCreationAttributes,
  PrimePostMetaData,
  PrimeReply,
  PrimeSearchResult,
} from "../../models/PrimeModels";
import {
  // OPEN_BOARDS_SELECTION,
  // CLOSE_BOARDS_SELECTION,
  // SELECT_BOARD,
  // SET_CREATEPOST_SOCIAL_SEARCH_RESULTS,
  // CLEAR_SOCIAL_SEARCH_RESULTS,
  // SET_POST_TYPE,
  // SET_CONTENT_TYPE,
  // SET_POST_TEXT,
  // REMOVE_CONTENT,
  // CLEAR_SELECT_BOARD,
  ADD_USER_POLL_FOR_POST,
  CHANGE_SOCIAL_TAB,
  CLOSE_BOARD_OPTIONS,
  DISMISS_PANEL,
  HIDE_CONFIRMATION_DIALOG,
  LOAD_BOARD_DETAILS,
  LOAD_COMMENTS,
  LOAD_REPLIES,
  LOAD_SOCIAL_BOARD,
  LOAD_SOCIAL_BOARDS,
  // CREATE_POST,
  OPEN_BOARD_OPTIONS,
  OPEN_CMT_OPTIONS,
  OPEN_POST_OPTIONS,
  OPEN_REPLY_OPTIONS,
  PAGINATE_COMMENTS,
  PAGINATE_REPLIES,
  PAGINATE_SOCIAL_BOARDS,
  PAGINATE_SOCIAL_BOARD_POSTS,
  PAGINATION_START_COMMENTS,
  PAGINATION_START_REPLIES,
  PAGINATION_START_SOCIAL_BOARDS,
  PAGINATION_START_SOCIAL_BOARD_POSTS,
  SET_SELECTED_BOARD,
  SET_SELECTED_COMMENT,
  SET_SELECTED_POST,
  SHOW_CONFIRMATION_DIALOG,
  // UPDATE_REPLY_TEXT,
  SOCIAL_ADD_BOARD_FAVORITE_SUCCESS,
  SOCIAL_BOARD_DELETE_SUCCESS,
  SOCIAL_CMT_DELETE_SUCCESS,
  SOCIAL_POST_DELETE_SUCCESS,
  SOCIAL_REMOVE_BOARD_FAVORITE_SUCCESS,
  // PAGINATION_START_SOCIAL_SEARCH_BOARDS,
  // PAGINATE_SOCIAL_SEARCH_BOARDS,
  SOCIAL_REMOVE_BOARD_FROM_LIST,
  SOCIAL_REPLY_DELETE_SUCCESS,
  UPDATE_CMT_PREVIEW_DATA,
  UPDATE_COMMENT,
  UPDATE_POST,
  // UPDATE_REPLY_VOTE_STATUS,
  // DELETE_REPLY_VOTE_STATUS,
  UPDATE_POST_PREVIEW_DATA,
  UPDATE_REPLY,
  UPDATE_REPLY_PREVIEW_DATA,
} from "../actions/social/actionTypes";

// import post from "./post";
// import comment from "./comment";
// import reply from "./reply";

export interface SelectedBoardState {
  item: PrimeBoard;
}

export interface SelectedPostState {
  item: PrimePost;
}

export interface BoardState {
  items: PrimeBoard[];
  // paginating: boolean;
  next: string;
}
export interface BoardOptions {
  id: string;
  open: boolean;
}

export interface PostOptions {
  id: string;
  open: boolean;
}
export interface CommentOptions {
  id: string;
  open: boolean;
}
export interface ReplyOptions {
  id: string;
  open: boolean;
}

export interface SocialSearchResultList {
  searchTerm: string;
  searchBoards: PrimeSearchResult[];
  searchNext: string;
  searchPaginating: boolean;
}

export interface CreatePostDetails {
  boardId: string;
  boardName: string;
  boardSkill: string;
  isBoardFixed: boolean;
  boardSelectionOpen: boolean;
  socialSearchResults: SocialSearchResultList;
  attributes: PrimePostCreationAttributes;
  previewData: PrimePostMetaData;
}

export interface SocialState {
  selectedTab: string;
  board: SelectedBoardState;
  boards: BoardState;
  boardOptions: BoardOptions;
  selectedBoard: PrimeBoard;
  posts: {
    items: PrimePost[];
    paginating: boolean;
    next: string;
  };
  postOptions: PostOptions;
  commentOptions: CommentOptions;
  replyOptions: ReplyOptions;
  selectedPost: PrimePost;
  selectedComment: PrimeComment;
  comments: { items: PrimeComment[]; paginating: boolean; next: string };
  replies: { items: PrimeReply[]; paginating: boolean; next: string };
  // createComment: PrimeCommentCreationAttributes;
  // createReply: PrimeReplyCreationAttributes;
  // createPost: CreatePostDetails;
}

const selectedTab: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_SOCIAL_BOARDS:
      return action.socialTab ?? "MyBoards";
    case CHANGE_SOCIAL_TAB:
      return action.socialTab;
    default:
      return state ?? "MyBoards";
  }
};

const item: Reducer<PrimeBoard, AnyAction> = (
  state: PrimeBoard | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_SOCIAL_BOARD:
      return action.payload.item;
    case SOCIAL_ADD_BOARD_FAVORITE_SUCCESS: {
      if (state) {
        state.isFavorite = true;
      }
      return state;
    }
    case SOCIAL_REMOVE_BOARD_FAVORITE_SUCCESS: {
      if (state) {
        state.isFavorite = false;
      }
      return state;
    }
    default:
      return state ? state : null;
  }
};

const items: Reducer<PrimeBoard[], AnyAction> = (
  state: PrimeBoard[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_SOCIAL_BOARDS:
      return action.payload.items;
    case CHANGE_SOCIAL_TAB:
      return null;
    case PAGINATE_SOCIAL_BOARDS:
      return [...state!, ...action.payload.items];
    case SOCIAL_ADD_BOARD_FAVORITE_SUCCESS: {
      if (state === null || state!.length === 0) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state!.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) {
        state![index].isFavorite = true;
      }
      return state;
    }
    case SOCIAL_REMOVE_BOARD_FAVORITE_SUCCESS: {
      if (state === null || state!.length === 0) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state!.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) {
        state![index].isFavorite = false;
      }
      return state;
    }
    case SOCIAL_REMOVE_BOARD_FROM_LIST: {
      return state === null || state!.length === 0
        ? []
        : state?.filter((item) => item.id !== action.payload.id);
    }
    case SOCIAL_BOARD_DELETE_SUCCESS: {
      return state?.filter((item: PrimeBoard) => item.id !== action.payload.id);
    }
    default:
      return state ? state : null;
  }
};

const next: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_SOCIAL_BOARDS:
    case PAGINATE_SOCIAL_BOARDS:
      return action.payload.next;
    case CHANGE_SOCIAL_TAB:
      return null;
    default:
      return state || null;
  }
};

const paginating: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case PAGINATION_START_SOCIAL_BOARDS:
      return true;
    case PAGINATE_SOCIAL_BOARDS:
      return false;
    default:
      return state || false;
  }
};
const open: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_BOARD_OPTIONS:
      return true;
    case DISMISS_PANEL:
    case CLOSE_BOARD_OPTIONS:
    case SOCIAL_ADD_BOARD_FAVORITE_SUCCESS:
    case SOCIAL_REMOVE_BOARD_FAVORITE_SUCCESS:
    case SOCIAL_REMOVE_BOARD_FROM_LIST:
      return false;
    default:
      return state || false;
  }
};
const id: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_BOARD_OPTIONS:
      return action.boardId;
    case DISMISS_PANEL:
    case CLOSE_BOARD_OPTIONS:
    case SOCIAL_ADD_BOARD_FAVORITE_SUCCESS:
    case SOCIAL_REMOVE_BOARD_FROM_LIST:
      return "";
    default:
      return state ? state : "";
  }
};

const selectedBoard: Reducer<PrimeBoard, AnyAction> = (
  state: PrimeBoard | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case SET_SELECTED_BOARD:
      return action.board;
    case SOCIAL_ADD_BOARD_FAVORITE_SUCCESS: {
      if (state) {
        state.isFavorite = true;
      }
      return state;
    }
    case SOCIAL_REMOVE_BOARD_FAVORITE_SUCCESS: {
      if (state) {
        state.isFavorite = false;
      }
      return state;
    }
    default:
      return state || null;
  }
};

//reducers for Posts starts

const postsItems: Reducer<PrimePost[], AnyAction> = (
  state: PrimePost[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_BOARD_DETAILS:
      return action.payload.items || [];
    case PAGINATE_SOCIAL_BOARD_POSTS:
      return [...state!, ...action.payload.items];
    case LOAD_COMMENTS:
      if (!action.payload.selectedPostId) {
        return state;
      }
      if (!state) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state?.findIndex(
        (item) => item.id === action.payload.selectedPostId
      );
      if (index < 0) return state;
      // eslint-disable-next-line no-case-declarations
      const post = state[index];
      post.commentCount = action.payload.items.length;
      state[index] = post;
      return state;
    case ADD_USER_POLL_FOR_POST: {
      if (!state) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state?.findIndex((item) => item.id === action.post.id);
      if (index < 0) return state;
      // eslint-disable-next-line no-case-declarations
      const post = state[index];
      post.userPoll! = { optionId: action.optionId };
      state[index] = post;
      return state;
    }
    case UPDATE_POST: {
      if (!state) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state?.findIndex((item) => item.id === action.post.id);
      if (index < 0) return state;
      //uncomment below if else
      // if (state[index].previewData) {
      //     state[index] = {
      //         ...state[index],
      //         attributes: {...state[index].attributes, previewData: {...state[index].attributes.previewData, ...action.post.attributes.previewData,},},
      //     };
      // } else {
      //     state[index] = action.post;
      // }

      return state;
    }

    case SOCIAL_POST_DELETE_SUCCESS: {
      return state?.filter((item: PrimePost) => item.id !== action.payload.id);
    }

    case UPDATE_POST_PREVIEW_DATA: {
      if (!state) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state?.findIndex((item) => item.id === action.payload.id);
      if (index < 0) return state;

      // eslint-disable-next-line no-case-declarations
      const post = state[index];
      post.previewData = action.data;
      return state;
    }

    default:
      return state || [];
  }
};

const postsNext: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_BOARD_DETAILS:
    case PAGINATE_SOCIAL_BOARD_POSTS:
      return action.next || null;
    default:
      return state || null;
  }
};

const postsPaginating: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case PAGINATION_START_SOCIAL_BOARD_POSTS:
      return true;
    case PAGINATE_SOCIAL_BOARD_POSTS:
      return false;
    default:
      return state || false;
  }
};

const posts: Reducer<
  {
    items: PrimePost[];
    paginating: boolean;
    next: string;
  },
  AnyAction
> = combineReducers({
  items: postsItems,
  next: postsNext,
  paginating: postsPaginating,
});

//reducers for Posts End

const boardOptions: Reducer<BoardOptions, AnyAction> = combineReducers({
  open,
  id,
});

//reducers for post options starts

const postOptionsOpen: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_POST_OPTIONS:
      return true;
    case DISMISS_PANEL:
    case SHOW_CONFIRMATION_DIALOG:
      return false;
    default:
      return state || false;
  }
};
const postOptionsId: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_POST_OPTIONS:
      return action.payload.id;
    case DISMISS_PANEL:
    case HIDE_CONFIRMATION_DIALOG:
      return "";
    default:
      return state ? state : "";
  }
};
const postOptions: Reducer<PostOptions, AnyAction> = combineReducers({
  open: postOptionsOpen,
  id: postOptionsId,
});
//reducers for post options ends

//reducers for comment options starts
const commentOptionsOpen: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_CMT_OPTIONS:
      return true;
    case DISMISS_PANEL:
    case SHOW_CONFIRMATION_DIALOG:
      return false;
    default:
      return state || false;
  }
};
const commentOptionsId: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_CMT_OPTIONS:
      return action.payload.id;
    case DISMISS_PANEL:
    case HIDE_CONFIRMATION_DIALOG:
      return "";
    default:
      return state ? state : "";
  }
};
const commentOptions: Reducer<CommentOptions, AnyAction> = combineReducers({
  open: commentOptionsOpen,
  id: commentOptionsId,
});
//reducers for comment options ends

//reducers for reply options starts
const replyOptionsOpen: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_REPLY_OPTIONS:
      return true;
    case DISMISS_PANEL:
    case SHOW_CONFIRMATION_DIALOG:
      return false;
    default:
      return state || false;
  }
};
const replyOptionsId: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_REPLY_OPTIONS:
      return action.payload.id;
    case DISMISS_PANEL:
    case HIDE_CONFIRMATION_DIALOG:
      return "";
    default:
      return state ? state : "";
  }
};
const replyOptions: Reducer<ReplyOptions, AnyAction> = combineReducers({
  open: replyOptionsOpen,
  id: replyOptionsId,
});
//reducers for reply options ends

const board: Reducer<SelectedBoardState, AnyAction> = combineReducers({
  item,
});

const boards: Reducer<BoardState, AnyAction> = combineReducers({
  items,
  // paginating,
  next,
});

const selectedPost: Reducer<PrimePost, AnyAction> = (
  state: PrimePost | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case SET_SELECTED_POST:
      return action.post;
    case ADD_USER_POLL_FOR_POST: {
      if (!state) {
        return null;
      }
      state.userPoll! = { optionId: action.optionId };
      return state;
    }
    case UPDATE_POST: {
      if (!state) {
        return null;
      }
      if (state.previewData) {
        return {
          ...state,
          attributes: {
            ...state,
            previewData: {
              ...state.previewData,
              ...action.post.attributes.previewData,
            },
          },
        };
      } else {
        return action.post;
      }
    }
    case UPDATE_POST_PREVIEW_DATA: {
      if (!state) {
        return null;
      }

      if (state.id == action.payload.id) {
        state.previewData = action.data;
      }
      return state;
    }
    default:
      return state || null;
  }
};

const selectedComment: Reducer<PrimeComment, AnyAction> = (
  state: PrimeComment | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case SET_SELECTED_COMMENT:
      return action.comment;
    case UPDATE_CMT_PREVIEW_DATA: {
      if (!state) {
        return null;
      }

      if (state.id == action.payload.id) {
        state.previewData = action.data;
      }
      return state;
    }
    case UPDATE_COMMENT: {
      if (!state) {
        return null;
      }
      if (state.previewData) {
        return {
          ...state,
          attributes: {
            ...state,
            previewData: {
              ...state.previewData,
              ...action.cmt.attributes.previewData,
            },
          },
        };
      } else {
        return action.cmt;
      }
    }
    default:
      return state || null;
  }
};

//Reducers for comments starts
const commentsItems: Reducer<PrimeComment[], AnyAction> = (
  state: PrimeComment[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_COMMENTS:
      //Keep only comments of other posts
      state = state
        ?.filter(
          (item: PrimeComment) =>
            item.parent.id !== action.payload.selectedPostId
        )
        .map((comment) => comment);
      //if current post has comments, merge it with state
      if (action.payload.items) {
        return state
          ? state.concat(action.payload.items)
          : action.payload.items;
      }
      return [];
    case PAGINATE_COMMENTS:
      return [...state!, ...action.payload.items];
    case LOAD_REPLIES:
      if (!action.payload.selectedCommentId) {
        return state;
      }
      if (!state) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state?.findIndex(
        (item) => item.id === action.payload.selectedCommentId
      );
      if (index < 0) return state;
      // eslint-disable-next-line no-case-declarations
      const cmt = state[index];
      cmt.replyCount = action.payload.items.length;
      state[index] = cmt;
      return state;
    case UPDATE_COMMENT: {
      if (!state) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state?.findIndex(
        (item) => item.id === action.payload.item.id
      );
      if (index < 0) return state;
      //uncomment below if else
      // if (state[index].previewData) {
      //     state[index] = {
      //         ...state[index],
      //         attributes: {...state[index], previewData: {...state[index].attributes.previewData, ...action.cmt.attributes.previewData,},},
      //     };
      // } else {
      state[index] = action.payload.item;
      // }

      return state;
    }
    case SOCIAL_CMT_DELETE_SUCCESS: {
      return state?.filter(
        (item: PrimeComment) => item.id !== action.payload.id
      );
    }
    case UPDATE_CMT_PREVIEW_DATA: {
      if (!state) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state?.findIndex((item) => item.id === action.payload.id);
      if (index < 0) return state;

      // eslint-disable-next-line no-case-declarations
      const cmt = state[index];
      cmt.previewData = action.data;
      return state;
    }
    default:
      return state || null;
  }
};

// const getCommentPostId: Reducer<number, AnyAction> = (
//     state: number | undefined,
//     action: AnyAction
// ) => {
//     switch (action.type) {
//         case LOAD_COMMENTS:
//             return action.payload.selectedPostId;
//         default:
//             return -1;
//     }
// };

const commentsNext: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_COMMENTS:
    case PAGINATE_COMMENTS:
      return action.payload.next;
    default:
      return state || null;
  }
};

const commentsPaginating: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case PAGINATION_START_COMMENTS:
      return true;
    case PAGINATE_COMMENTS:
      return false;
    default:
      return state || false;
  }
};
const comments: Reducer<
  {
    // postId: number,
    items: PrimeComment[];
    paginating: boolean;
    next: string;
  },
  AnyAction
> = combineReducers({
  // postId: getCommentPostId,
  items: commentsItems,
  next: commentsNext,
  paginating: commentsPaginating,
});
//Reducers for comments ends

//Reducers for replies starts
const replyItems: Reducer<PrimeReply[], AnyAction> = (
  state: PrimeReply[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_REPLIES:
      //Keep only replies of other comments
      state = state
        ?.filter(
          (item: PrimeReply) =>
            item.parent.id !== action.payload.selectedCommentId
        )
        .map((comment) => comment);
      //if current comment has replies, merge it with state
      if (action.payload.items) {
        return state
          ? state.concat(action.payload.items)
          : action.payload.items;
      }
      return [];
    case PAGINATE_REPLIES:
      return [...state!, ...action.payload.items];
    case UPDATE_REPLY: {
      if (!state) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state?.findIndex(
        (item) => item.id === action.payload.item.id
      );
      if (index < 0) return state;
      //uncomment below if else
      // if (state[index].previewData) {
      //     state[index] = {
      //         ...state[index],
      //         attributes: {...state[index], previewData: {...state[index].previewData, ...action.reply.previewData,},},
      //     };
      // } else {
      state[index] = action.payload.item;
      // }

      return state;
    }
    case SOCIAL_REPLY_DELETE_SUCCESS: {
      return state?.filter((item: PrimeReply) => item.id !== action.payload.id);
    }
    case UPDATE_REPLY_PREVIEW_DATA: {
      if (!state) {
        return [];
      }
      // eslint-disable-next-line no-case-declarations
      const index = state?.findIndex((item) => item.id === action.payload.id);
      if (index < 0) return state;

      // eslint-disable-next-line no-case-declarations
      const reply = state[index];
      reply.previewData = action.data;
      return state;
    }
    default:
      return state || null;
  }
};

const replyNext: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_REPLIES:
    case PAGINATE_REPLIES:
      return action.payload.next;
    default:
      return state || null;
  }
};

const replyPaginating: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case PAGINATION_START_REPLIES:
      return true;
    case PAGINATE_REPLIES:
      return false;
    default:
      return state || false;
  }
};
const replies: Reducer<
  {
    items: PrimeReply[];
    paginating: boolean;
    next: string;
  },
  AnyAction
> = combineReducers({
  items: replyItems,
  next: replyNext,
  paginating: replyPaginating,
});
//Reducers for replies ends

const social: Reducer<SocialState, AnyAction> = combineReducers({
  selectedTab,
  board,
  boards,
  boardOptions,
  selectedBoard,
  posts,
  postOptions,
  commentOptions,
  replyOptions,
  selectedPost,
  selectedComment,
  comments,
  replies,
  // comment,
  // reply,
  // post,
});
export default social;
