import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';

import { ADD_USER } from '../utils/mutations'; // Make sure this mutation is defined in your mutations file
import Auth from '../utils/auth';

const SignupForm = () => {
  const [userFormData, setUserFormData] = useState({ username: '', email: '', password: '' });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [addUser] = useMutation(ADD_USER, {
    onCompleted: (data) => {
      Auth.login(data.addUser.token); // Assume your ADD_USER mutation returns a token
    },
    onError: (error) => {
      console.error(error);
      setShowAlert(true);
    }
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setShowAlert(true);
      return;
    }

    try {
      await addUser({ variables: userFormData });
    } catch (err) {
      console.error('Error creating user:', err);
    }

    setUserFormData({ username: '', email: '', password: '' });
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your signup!
        </Alert>

        {/* Form fields remain unchanged */}

        <Button
          disabled={!(userFormData.username && userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;