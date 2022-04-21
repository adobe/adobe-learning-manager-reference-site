import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { getALMConfig } from "../utils/global";

export const apolloClient = new ApolloClient({
  uri: `${getALMConfig().graphqlProxyPath}`,
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
