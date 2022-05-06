import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import React from "react";
import { getALMConfig, getCommerceToken } from "../utils/global";

const uri = getALMConfig().graphqlProxyPath || getALMConfig().commerceURL;
const httpLink = createHttpLink({
  uri: uri,
});
const authLink = setContext((_, { headers }) => {
  const signInToken = getCommerceToken();
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

const CommerceContextProviders = (props: React.PropsWithChildren<{}>) => {
  return (
    <React.Fragment>
      <ApolloProvider client={apolloClient}>{props.children}</ApolloProvider>;
    </React.Fragment>
  );
};

export default CommerceContextProviders;
