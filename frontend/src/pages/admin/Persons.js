import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Table, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Persons = () => {
  const [type, setType] = useState('PF');
  const [isClient, setIsClient] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressCep, setAddressCep] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressCountry, setAddressCountry] = useState('Brasil');
  const [bankDescription, setBankDescription] = useState('');
  const [bankKeyType, setBankKeyType] = useState('');
  const [bankPixKey, setBankPixKey] = useState('');
  const [bankName, setBankName] = useState('');
  const [observations, setObservations] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [persons, setPersons] = useState([]);
  const { token } = useSelector((state) => state.auth);

  // Carregar lista de pessoas
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/persons`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPersons(response.data);
      } catch (err) {
        console.error('Erro ao listar pessoas:', err);
      }
    };
    fetchPersons();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('type', type);
    formData.append('isClient', isClient);
    formData.append('isSupplier', isSupplier);
    formData.append('isEmployee', isEmployee);
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('cpfCnpj', cpfCnpj);
    if (birthDate) formData.append('birthDate', birthDate);
    if (gender) formData.append('gender', gender);
    if (email) formData.append('email', email);
    if (phone) formData.append('phone', phone);
    if (addressCep) formData.append('addressCep', addressCep);
    if (addressStreet) formData.append('addressStreet', addressStreet);
    if (addressNumber) formData.append('addressNumber', addressNumber);
    if (addressComplement) formData.append('addressComplement', addressComplement);
    if (addressNeighborhood) formData.append('addressNeighborhood', addressNeighborhood);
    if (addressCity) formData.append('addressCity', addressCity);
    if (addressState) formData.append('addressState', addressState);
    if (addressCountry) formData.append('addressCountry', addressCountry);
    if (bankDescription || bankKeyType || bankPixKey || bankName) {
      formData.append('bankDetails', JSON.stringify({
        description: bankDescription,
        keyType: bankKeyType,
        pixKey: bankPixKey,
        bank: bankName,
      }));
    }
    if (observations) formData.append('observations', observations);
    if (attachment) formData.append('attachment', attachment);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/admin/persons`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Cadastro criado com sucesso!');
      setError('');
      // Limpar formulário
      setType('PF');
      setIsClient(false);
      setIsSupplier(false);
      setIsEmployee(false);
      setName('');
      setSurname('');
      setCpfCnpj('');
      setBirthDate('');
      setGender('');
      setEmail('');
      setPhone('');
      setAddressCep('');
      setAddressStreet('');
      setAddressNumber('');
      setAddressComplement('');
      setAddressNeighborhood('');
      setAddressCity('');
      setAddressState('');
      setAddressCountry('Brasil');
      setBankDescription('');
      setBankKeyType('');
      setBankPixKey('');
      setBankName('');
      setObservations('');
      setAttachment(null);
      // Atualizar lista
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/persons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersons(response.data);
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setError('Erro ao criar cadastro');
      setSuccess('');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/admin/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/persons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersons(response.data);
    } catch (err) {
      console.error('Erro ao atualizar role:', err);
      setError('Erro ao atualizar permissões');
    }
  };

  return (
    <Container>
      <h2>Cadastro de Pessoas</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="type">
          <Form.Label>Tipo de Pessoa</Form.Label>
          <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="roles">
          <Form.Label>Tipo de Cadastro</Form.Label>
          <Form.Check
            type="checkbox"
            label="Cliente"
            checked={isClient}
            onChange={(e) => setIsClient(e.target.checked)}
          />
          <Form.Check
            type="checkbox"
            label="Fornecedor"
            checked={isSupplier}
            onChange={(e) => setIsSupplier(e.target.checked)}
          />
          <Form.Check
            type="checkbox"
            label="Colaborador"
            checked={isEmployee}
            onChange={(e) => setIsEmployee(e.target.checked)}
          />
        </Form.Group>
        <Form.Group controlId="name">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        {type === 'PF' && (
          <Form.Group controlId="surname">
            <Form.Label>Sobrenome</Form.Label>
            <Form.Control
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
            />
          </Form.Group>
        )}
        <Form.Group controlId="cpfCnpj">
          <Form.Label>{type === 'PF' ? 'CPF' : 'CNPJ'}</Form.Label>
          <Form.Control
            type="text"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            required
          />
        </Form.Group>
        {type === 'PF' && (
          <>
            <Form.Group controlId="birthDate">
              <Form.Label>Data de Nascimento</Form.Label>
              <Form.Control
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="gender">
              <Form.Label>Sexo</Form.Label>
              <Form.Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Other">Outro</option>
              </Form.Select>
            </Form.Group>
          </>
        )}
        <Form.Group controlId="email">
          <Form.Label>E-mail</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="phone">
          <Form.Label>Telefone</Form.Label>
          <Form.Control
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="addressCep">
          <Form.Label>CEP</Form.Label>
          <Form.Control
            type="text"
            value={addressCep}
            onChange={(e) => setAddressCep(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="addressStreet">
          <Form.Label>Rua</Form.Label>
          <Form.Control
            type="text"
            value={addressStreet}
            onChange={(e) => setAddressStreet(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="addressNumber">
          <Form.Label>Número</Form.Label>
          <Form.Control
            type="text"
            value={addressNumber}
            onChange={(e) => setAddressNumber(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="addressComplement">
          <Form.Label>Complemento</Form.Label>
          <Form.Control
            type="text"
            value={addressComplement}
            onChange={(e) => setAddressComplement(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="addressNeighborhood">
          <Form.Label>Bairro</Form.Label>
          <Form.Control
            type="text"
            value={addressNeighborhood}
            onChange={(e) => setAddressNeighborhood(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="addressCity">
          <Form.Label>Cidade</Form.Label>
          <Form.Control
            type="text"
            value={addressCity}
            onChange={(e) => setAddressCity(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="addressState">
          <Form.Label>Estado</Form.Label>
          <Form.Control
            type="text"
            value={addressState}
            onChange={(e) => setAddressState(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="addressCountry">
          <Form.Label>País</Form.Label>
          <Form.Control
            type="text"
            value={addressCountry}
            onChange={(e) => setAddressCountry(e.target.value)}
          />
        </Form.Group>
        {(isSupplier || isEmployee) && (
          <>
            <Form.Group controlId="bankDescription">
              <Form.Label>Descrição Bancária</Form.Label>
              <Form.Control
                type="text"
                value={bankDescription}
                onChange={(e) => setBankDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="bankKeyType">
              <Form.Label>Tipo de Chave Pix</Form.Label>
              <Form.Select value={bankKeyType} onChange={(e) => setBankKeyType(e.target.value)}>
                <option value="">Selecione</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="Email">E-mail</option>
                <option value="Phone">Telefone</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="bankPixKey">
              <Form.Label>Chave Pix</Form.Label>
              <Form.Control
                type="text"
                value={bankPixKey}
                onChange={(e) => setBankPixKey(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="bankName">
              <Form.Label>Banco</Form.Label>
              <Form.Control
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </Form.Group>
          </>
        )}
        <Form.Group controlId="observations">
          <Form.Label>Observações</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="attachment">
          <Form.Label>Anexo</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Cadastrar
        </Button>
      </Form>

      <h3 className="mt-5">Lista de Cadastros</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF/CNPJ</th>
            <th>Tipo</th>
            <th>Função</th>
            <th>Permissões</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((person) => (
            <tr key={person.id}>
              <td>{`${person.name} ${person.surname || ''}`}</td>
              <td>{person.cpfCnpj}</td>
              <td>{person.type}</td>
              <td>
                {person.isClient && 'Cliente'}
                {person.isClient && person.isSupplier && ' / '}
                {person.isSupplier && 'Fornecedor'}
                {(person.isClient || person.isSupplier) && person.isEmployee && ' / '}
                {person.isEmployee && 'Colaborador'}
              </td>
              <td>
                {person.isEmployee && (
                  <Dropdown>
                    <Dropdown.Toggle variant="secondary">
                      {person.user?.role || 'employee'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleRoleChange(person.user?.id, 'employee')}>
                        Colaborador
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleRoleChange(person.user?.id, 'seller')}>
                        Vendedor
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleRoleChange(person.user?.id, 'financial')}>
                        Financeiro
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleRoleChange(person.user?.id, 'admin')}>
                        Admin
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </td>
              <td>
                <Button variant="info" size="sm">Editar</Button>{' '}
                <Button variant="danger" size="sm">Excluir</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Persons;