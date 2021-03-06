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
import { onError } from "@apollo/client/link/error";
import { SIGN_IN_PATH } from "../utils/constants";
import {
  getALMConfig,
  getALMObject,
  getCommerceStoreName,
  getCommerceToken,
} from "../utils/global";

const uri = getALMConfig().graphqlProxyPath || getALMConfig().commerceURL;
const httpLink = createHttpLink({
  uri,
});

const authLink = setContext((_, { headers }) => {
  const signInToken = getCommerceToken();
  const store = getCommerceStoreName() || "default";

  return {
    headers: {
      ...headers,
      authorization: signInToken ? `Bearer ${signInToken}` : "",
      store,
    },
  };
});

const errorControl = onError(({ networkError, graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      if (extensions?.category === "graphql-authorization") {
        getALMObject().handleLogOut();
        window.location.pathname = SIGN_IN_PATH;
      }
    });
  }
  if (networkError) {
    console.log(" [Network error]:", networkError);
  }
});

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: errorControl.concat(authLink.concat(httpLink)),
});

const contextProviders = [];

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
