import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { getALMConfig } from "../utils/global";

const uri = getALMConfig().graphqlProxyPath || getALMConfig().commerceURL;

export const apolloClient = new ApolloClient({
  uri: uri,
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
