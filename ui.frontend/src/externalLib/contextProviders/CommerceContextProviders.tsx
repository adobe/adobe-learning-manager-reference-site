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
      <ApolloProvider client={apolloClient}>{props.children}</ApolloProvider>
    </React.Fragment>
  );
};

export default CommerceContextProviders;
