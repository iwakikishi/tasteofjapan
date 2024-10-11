import { PropsWithChildren } from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const httpLink = new HttpLink({
  uri: `https://${process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
  headers: {
    'X-Shopify-Storefront-Access-Token': process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
  },
});
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const ApolloProviderWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const client = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloProviderWrapper;
