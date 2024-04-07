import { gql } from '@apollo/client';

export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;

export const SEARCH_GOOGLE_BOOKS = gql`
  query SearchGoogleBooks($query: String!) {
    searchGoogleBooks(query: $query) {
      bookId
      title
      authors
      description
      image
      link
    }
  }
`;
