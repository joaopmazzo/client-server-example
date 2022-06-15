import { ApolloLink, Observable, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const loggerLink = new ApolloLink((operation, forward) => new Observable((observer) => {
  const subscription = forward(operation).subscribe({
    next: (result) => {
      console.log('Log', result);
      observer.next(result);
    },
    error: observer.error.bind(observer),
    complete: observer.complete.bind(observer),
  })

  return () => subscription.unsubscribe();
}))

const link = ApolloLink.from([
  loggerLink,
  onError((error) => {
    console.error('GraphQLError', error);
  }),
  setContext((_, { headers }) => {
    return {
      headers,
    }
  }),
  createHttpLink({
    uri: 'http://127.0.0.1:8000/graphql',
  })
])

export default link;