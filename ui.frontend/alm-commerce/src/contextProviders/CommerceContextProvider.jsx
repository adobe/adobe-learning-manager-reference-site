import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { CartContextProvider } from "./CartContextProvider";

import { getALMConfig } from "../utils/global";
import storageInstance from "../utils/storage";
import {
  BrowserRouter
} from "react-router-dom";

const httpLink = createHttpLink({
  uri: `${getALMConfig().commerceURL}/graphql`,
});

const authLink = setContext((_, { headers }) => {

  const signInToken = storageInstance.getItem("TOKEN");
  return {
    headers: {
      ...headers,
      authorization: signInToken ? `Bearer ${signInToken}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});


const contextProviders = [BrowserRouter];

export const CommerceContextProviders = (props) => {
  return (
    <ApolloProvider client={apolloClient}>
      {contextProviders.reduceRight((memo, ContextProvider) => {
        return <ContextProvider>{memo}</ContextProvider>;
      }, props.children)}
    </ApolloProvider>
  );
};

export default CommerceContextProviders;
