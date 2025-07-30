import React, { useState, useEffect } from 'react';
import { Container, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Reminders = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [error, setError] = useState('');
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/reminders/birthdays`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBirthdays(response.data);
      } catch (err) {
        console.error('Erro ao carregar aniversariantes:', err);
        setError('Erro ao carregar aniversariantes');
      }
    };
    fetchBirthdays();
  }, [token]);

  return (
    <Container>
      <h2>Aniversariantes do Dia</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Idade</th>
          </tr>
        </thead>
        <tbody>
          {birthdays.map((person) => (
            <tr key={person.id}>
              <td>{`${person.name} ${person.surname || ''}`}</td>
              <td>{person.email || '-'}</td>
              <td>{person.age || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Reminders;