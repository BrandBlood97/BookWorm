import { useState } from 'react';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import { useMutation, useLazyQuery } from '@apollo/client';

import Auth from '../utils/auth';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { SAVE_BOOK } from '../utils/mutations';
import { SEARCH_GOOGLE_BOOKS } from '../utils/queries'; // Ensure this is defined

const SearchBooks = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [getBooks, { loading: searchLoading, error: searchError }] = useLazyQuery(SEARCH_GOOGLE_BOOKS, {
    variables: { query: searchInput },
    onCompleted: (data) => {
      const bookData = data.searchGoogleBooks.map((book) => ({
        bookId: book.bookId, // Ensure your schema uses bookId
        authors: book.authors,
        title: book.title,
        description: book.description,
        image: book.image,
      }));
      setSearchedBooks(bookData);
    },
  });

  const [saveBook, { loading: saveLoading, error: saveError }] = useMutation(SAVE_BOOK, {
    onCompleted: (data) => {
      // Update savedBookIds state and localStorage
      const updatedSavedBookIds = [...savedBookIds, data.saveBook.bookId];
      setSavedBookIds(updatedSavedBookIds);
      saveBookIds(updatedSavedBookIds);
    },
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!searchInput) return;
    getBooks(); // Trigger the search
  };

  const handleSaveBook = async (bookId) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    if (!bookToSave || !Auth.loggedIn()) return;

    try {
      await saveBook({
        variables: { input: { ...bookToSave, bookId } },
      });
    } catch (err) {
      console.error('Error saving the book:', err);
    }
  };

  // Error and loading states can be handled as per your application's error handling strategy

  return (
    <>
            <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some((savedBookId) => savedBookId === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {savedBookIds?.some((savedBookId) => savedBookId === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
