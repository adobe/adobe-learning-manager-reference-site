import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getALMConfig, getCommerceToken } from "../utils/global";

const uri = getALMConfig().graphqlProxyPath || getALMConfig().commerceURL;
const httpLink = createHttpLink({
  uri,
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
