import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './register.scss';

function Login() {
  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:3111/signin', values);
      if (res.data.status === 'Success') {
        navigate('/'); // Navigate to home after successful login
      } else {
        console.log('Write correct email and password');
      }
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <Form onSubmit={handleSubmit}>
      <h2>SignIn</h2>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          onChange={(e) => setValues({ ...values, email: e.target.value })}
        />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          onChange={(e) => setValues({ ...values, password: e.target.value })}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        login
      </Button>
      <Button variant="primary">
        <Link to="/register">Create account</Link>
      </Button>
    </Form>
  );
}

export default Login;
