import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        name,
        email,
        password,
        cnpj,
        tenantName,
      });
      setSuccess('Usuário e tenant criados com sucesso!');
      setError('');
      setName('');
      setEmail('');
      setPassword('');
      setCnpj('');
      setTenantName('');
    } catch (err) {
      console.error('Erro no registro:', err);
      setError('Erro ao criar usuário/tenant');
      setSuccess('');
    }
  };

  return (
    <Container>
      <h2>Cadastro</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>E-mail</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Senha</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="cnpj">
          <Form.Label>CNPJ</Form.Label>
          <Form.Control
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="tenantName">
          <Form.Label>Nome do Tenant</Form.Label>
          <Form.Control
            type="text"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Cadastrar
        </Button>
      </Form>
    </Container>
  );
};

export default Register;