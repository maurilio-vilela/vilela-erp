import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../redux/authSlice';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem('loginEmail') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  // Monitorar token para redirecionamento
  useEffect(() => {
    console.log('Login useEffect - Token:', token, 'User:', user);
    if (token) {
      console.log('Token detectado, redirecionando para /admin/dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validar entrada
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Enviando requisição de login:', { email });
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email: email.trim(),
        password: password.trim(),
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Resposta do login:', response.data);

      const { token, user } = response.data;
      if (!token) {
        throw new Error('Resposta inválida: token ausente');
      }

      dispatch(setCredentials({ token, user: user || null }));
      console.log('Credenciais despachadas:', { token, user });

      if (rememberMe) {
        localStorage.setItem('loginEmail', email);
      } else {
        localStorage.removeItem('loginEmail');
      }

      console.log('Redirecionando para /admin/dashboard');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Erro no login:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Credenciais inválidas');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <h1>Vilela ERP</h1>
          <p>Faça login para acessar o sistema</p>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} aria-label="Formulário de Login">
          <Form.Group controlId="email" className="mb-3">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Digite seu e-mail"
              aria-label="E-mail"
            />
          </Form.Group>
          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
              aria-label="Senha"
            />
          </Form.Group>
          <Form.Group controlId="rememberMe" className="mb-3">
            <Form.Check
              type="checkbox"
              label="Lembrar meu e-mail"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              aria-label="Lembrar meu e-mail"
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
            aria-label="Entrar"
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Carregando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </Form>
      </div>
      <footer className="login-footer">
        <p>&copy; {new Date().getFullYear()} Vilela ERP. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Login;