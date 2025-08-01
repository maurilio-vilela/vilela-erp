import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalReminders: 0,
    totalSales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        console.log('Buscando métricas do dashboard...');
        // Exemplo de requisições para métricas (ajuste conforme suas rotas)
        const [usersResponse, remindersResponse, salesResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/admin/reminders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/sales`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMetrics({
          totalUsers: usersResponse.data.length,
          totalReminders: remindersResponse.data.length,
          totalSales: salesResponse.data.length,
        });
        console.log('Métricas carregadas:', {
          totalUsers: usersResponse.data.length,
          totalReminders: remindersResponse.data.length,
          totalSales: salesResponse.data.length,
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar métricas:', err.response?.data || err.message);
        setError('Erro ao carregar métricas do dashboard');
        setIsLoading(false);
      }
    };

    if (token) {
      fetchMetrics();
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container fluid className="dashboard">
      <h2 className="mb-4">Bem-vindo, {user?.name || 'Usuário'}!</h2>
      <Row>
        <Col md={4} sm={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Total de Usuários</Card.Title>
              <Card.Text className="display-4">{metrics.totalUsers}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Total de Lembretes</Card.Title>
              <Card.Text className="display-4">{metrics.totalReminders}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Total de Vendas</Card.Title>
              <Card.Text className="display-4">{metrics.totalSales}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;