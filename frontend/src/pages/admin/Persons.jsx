import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Table, Dropdown, Modal, Row, Col } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import './Persons.css';

const Persons = () => {
  const [type, setType] = useState('PF');
  const [isClient, setIsClient] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [nationality, setNationality] = useState('Brasileira');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [passport, setPassport] = useState('');
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
  const [editingPerson, setEditingPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [filterFunctions, setFilterFunctions] = useState({ client: true, supplier: true, employee: true });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const { token } = useSelector((state) => state.auth);

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const countries = ['Brasil', 'Argentina', 'Chile', 'Uruguai', 'Paraguai', 'Outros'];

  useEffect(() => {
    fetchPersons();
  }, [token, filterFunctions, sortConfig]);

  const fetchPersons = async () => {
    try {
      console.log('Buscando lista de pessoas...');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/persons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let filteredPersons = response.data.filter(person => {
        return (filterFunctions.client && person.isClient) ||
               (filterFunctions.supplier && person.isSupplier) ||
               (filterFunctions.employee && person.isEmployee);
      });
      if (sortConfig.key) {
        filteredPersons.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      setPersons(filteredPersons);
      console.log('Pessoas carregadas:', filteredPersons);
    } catch (err) {
      console.error('Erro ao listar pessoas:', err);
      setError('Erro ao carregar lista de cadastros');
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;

    if (!type) errors.type = 'Selecione o tipo de pessoa';
    if (!name) errors.name = 'Nome é obrigatório';
    if (type === 'PF' && !surname) errors.surname = 'Sobrenome é obrigatório';
    if (type === 'PJ' && !companyName) errors.companyName = 'Nome Fantasia é obrigatório';
    if (type === 'PF' && nationality === 'Brasileira' && !cpfCnpj) {
      errors.cpfCnpj = 'CPF é obrigatório para brasileiros';
    }
    if (type === 'PF' && nationality === 'Estrangeira' && isClient && !passport) {
      errors.passport = 'Passaporte é obrigatório para estrangeiros clientes';
    }
    if (type === 'PF' && nationality === 'Brasileira' && !cpf.isValid(cpfCnpj.replace(/[^0-9]/g, ''))) {
      errors.cpfCnpj = 'CPF inválido';
    }
    if (type === 'PJ' && !cnpj.isValid(cpfCnpj.replace(/[^0-9]/g, ''))) {
      errors.cpfCnpj = 'CNPJ inválido';
    }
    if (email && !emailRegex.test(email)) errors.email = 'E-mail inválido';
    if (phone && !phoneRegex.test(phone)) errors.phone = 'Telefone inválido. Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX';
    if (birthDate && type === 'PF') {
      const today = new Date();
      const birth = new Date(birthDate);
      if (birth > today) errors.birthDate = 'Data de nascimento não pode ser futura';
    }
    if (addressCep && !/^\d{5}-\d{3}$/.test(addressCep)) errors.addressCep = 'CEP inválido';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCepSearch = async (e) => {
    const cleanCep = e.target.value.replace(/[^0-9]/g, '');
    if (cleanCep.length === 8) {
      try {
        console.log('Buscando endereço via ViaCEP:', cleanCep);
        const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (response.data.erro) {
          setFormErrors({ ...formErrors, addressCep: 'CEP não encontrado' });
          return;
        }
        setAddressStreet(response.data.logradouro || '');
        setAddressNeighborhood(response.data.bairro || '');
        setAddressCity(response.data.localidade || '');
        setAddressState(response.data.uf || '');
        setAddressCountry('Brasil');
        setFormErrors({ ...formErrors, addressCep: '' });
        console.log('Endereço carregado:', response.data);
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
        setFormErrors({ ...formErrors, addressCep: 'Erro ao buscar CEP' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Corrija os erros no formulário antes de enviar');
      return;
    }

    const data = {
      type,
      isClient,
      isSupplier,
      isEmployee,
      nationality,
      name: type === 'PF' ? name : companyName,
      surname: type === 'PF' ? surname : undefined,
      cpfCnpj: type === 'PJ' || (type === 'PF' && nationality === 'Brasileira') ? cpfCnpj.replace(/[^0-9]/g, '') : undefined,
      passport: type === 'PF' && nationality === 'Estrangeira' && isClient ? passport : undefined,
      birthDate: type === 'PF' && birthDate ? birthDate : undefined,
      gender: type === 'PF' && gender ? gender : undefined,
      email,
      phone,
      addressCep: addressCep ? addressCep.replace(/[^0-9]/g, '') : undefined,
      addressStreet,
      addressNumber,
      addressComplement,
      addressNeighborhood,
      addressCity,
      addressState,
      addressCountry,
      bankDetails: (bankDescription || bankKeyType || bankPixKey || bankName) ? {
        description: bankDescription,
        keyType: bankKeyType,
        pixKey: bankPixKey,
        bank: bankName,
      } : undefined,
      observations,
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(data)); // Garantir que é string JSON
    if (attachment) formData.append('attachment', attachment);

    try {
      console.log('Enviando cadastro:', data);
      const url = editingPerson
        ? `${process.env.REACT_APP_API_URL}/admin/persons/${editingPerson.id}`
        : `${process.env.REACT_APP_API_URL}/admin/persons`;
      const method = editingPerson ? 'put' : 'post';
      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(editingPerson ? 'Cadastro atualizado com sucesso!' : 'Cadastro criado com sucesso!');
      setError('');
      resetForm();
      fetchPersons();
    } catch (err) {
      console.error('Erro no cadastro:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Erro ao salvar cadastro');
      setSuccess('');
    }
  };

  const handleEdit = (person) => {
    setEditingPerson(person);
    setType(person.type);
    setIsClient(!!person.isClient);
    setIsSupplier(!!person.isSupplier);
    setIsEmployee(!!person.isEmployee);
    setNationality(person.nationality || 'Brasileira');
    setName(person.type === 'PF' ? person.name : '');
    setCompanyName(person.type === 'PJ' ? person.name : '');
    setSurname(person.surname || '');
    setCpfCnpj(person.cpfCnpj || '');
    setPassport(person.passport || '');
    setBirthDate(person.birthDate ? person.birthDate.split('T')[0] : '');
    setGender(person.gender || '');
    setEmail(person.email || '');
    setPhone(person.phone || '');
    setAddressCep(person.addressCep || '');
    setAddressStreet(person.addressStreet || '');
    setAddressNumber(person.addressNumber || '');
    setAddressComplement(person.addressComplement || '');
    setAddressNeighborhood(person.addressNeighborhood || '');
    setAddressCity(person.addressCity || '');
    setAddressState(person.addressState || '');
    setAddressCountry(person.addressCountry || 'Brasil');
    setBankDescription(person.bankDetails?.description || '');
    setBankKeyType(person.bankDetails?.keyType || '');
    setBankPixKey(person.bankDetails?.pixKey || '');
    setBankName(person.bankDetails?.bank || '');
    setObservations(person.observations || '');
    setAttachment(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cadastro?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/admin/persons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Cadastro excluído com sucesso!');
        setError('');
        fetchPersons();
      } catch (err) {
        console.error('Erro ao excluir:', err);
        setError('Erro ao excluir cadastro');
      }
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/admin/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Permissão atualizada com sucesso!');
      setError('');
      fetchPersons();
    } catch (err) {
      console.error('Erro ao atualizar role:', err);
      setError('Erro ao atualizar permissões');
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const resetForm = () => {
    setEditingPerson(null);
    setType('PF');
    setIsClient(false);
    setIsSupplier(false);
    setIsEmployee(false);
    setNationality('Brasileira');
    setName('');
    setCompanyName('');
    setSurname('');
    setCpfCnpj('');
    setPassport('');
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
    setShowModal(false);
    setFormErrors({});
  };

  return (
    <>
      <h2>Gerenciamento de Pessoas</h2>
      <Row className="mb-3">
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button onClick={() => setShowModal(true)}>Novo Cadastro</Button>
            <Dropdown>
              <Dropdown.Toggle variant="secondary">Filtrar por Função</Dropdown.Toggle>
              <Dropdown.Menu style={{padding: '15px'}}>
                <Form.Check
                  type="checkbox"
                  label="Cliente"
                  checked={filterFunctions.client}
                  onChange={(e) => setFilterFunctions({ ...filterFunctions, client: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="Fornecedor"
                  checked={filterFunctions.supplier}
                  onChange={(e) => setFilterFunctions({ ...filterFunctions, supplier: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="Colaborador"
                  checked={filterFunctions.employee}
                  onChange={(e) => setFilterFunctions({ ...filterFunctions, employee: e.target.checked })}
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Modal show={showModal} onHide={resetForm} className="modal-70" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingPerson ? 'Editar Cadastro' : 'Novo Cadastro'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <h5>Tipo de Cadastro</h5>
            <Row>
              <Col md={12}>
                <Form.Group>
                  <Form.Check
                    inline
                    type="radio"
                    label="Pessoa Física"
                    name="personType"
                    value="PF"
                    checked={type === 'PF'}
                    onChange={(e) => setType(e.target.value)}
                    className="me-3"
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Pessoa Jurídica"
                    name="personType"
                    value="PJ"
                    checked={type === 'PJ'}
                    onChange={(e) => setType(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4">Função</h5>
            <Row>
              <Col md={12}>
                <Form.Group>
                  <Form.Check
                    inline
                    type="checkbox"
                    label="Cliente"
                    checked={isClient}
                    onChange={(e) => setIsClient(e.target.checked)}
                    className="me-3"
                  />
                  <Form.Check
                    inline
                    type="checkbox"
                    label="Fornecedor"
                    checked={isSupplier}
                    onChange={(e) => setIsSupplier(e.target.checked)}
                    className="me-3"
                  />
                  <Form.Check
                    inline
                    type="checkbox"
                    label="Colaborador"
                    checked={isEmployee}
                    onChange={(e) => setIsEmployee(e.target.checked)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {type === 'PF' && (
              <>
                <h5 className="mt-4">Naturalidade</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group controlId="nationality">
                      <Form.Label>Naturalidade</Form.Label>
                      <Form.Select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                      >
                        <option value="Brasileira">Brasileira</option>
                        <option value="Estrangeira">Estrangeira</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            <h5 className="mt-4">{type === 'PF' ? 'Dados Pessoais' : 'Dados da Empresa'}</h5>
            <Row>
              {type === 'PF' ? (
                <>
                  <Col md={4}>
                    <Form.Group controlId="name">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        isInvalid={!!formErrors.name}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="surname">
                      <Form.Label>Sobrenome</Form.Label>
                      <Form.Control
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        isInvalid={!!formErrors.surname}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.surname}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </>
              ) : (
                <>
                  <Col md={4}>
                    <Form.Group controlId="name">
                      <Form.Label>Razão Social</Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        isInvalid={!!formErrors.name}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="companyName">
                      <Form.Label>Nome Fantasia</Form.Label>
                      <Form.Control
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        isInvalid={!!formErrors.companyName}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.companyName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </>
              )}
              {type === 'PF' && (
                <Col md={4}>
                  {nationality === 'Brasileira' ? (
                    <Form.Group controlId="cpfCnpj">
                      <Form.Label>CPF</Form.Label>
                      <InputMask
                        mask="999.999.999-99"
                        value={cpfCnpj}
                        onChange={(e) => setCpfCnpj(e.target.value)}
                      >
                        {(inputProps) => (
                          <Form.Control
                            {...inputProps}
                            isInvalid={!!formErrors.cpfCnpj}
                            required
                          />
                        )}
                      </InputMask>
                      <Form.Control.Feedback type="invalid">{formErrors.cpfCnpj}</Form.Control.Feedback>
                    </Form.Group>
                  ) : (
                    <Form.Group controlId="passport">
                      <Form.Label>Passaporte</Form.Label>
                      <Form.Control
                        type="text"
                        value={passport}
                        onChange={(e) => setPassport(e.target.value)}
                        isInvalid={!!formErrors.passport}
                        required={isClient}
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.passport}</Form.Control.Feedback>
                    </Form.Group>
                  )}
                </Col>
              )}
              {type === 'PJ' && (
                <Col md={4}>
                  <Form.Group controlId="cpfCnpj">
                    <Form.Label>CNPJ</Form.Label>
                    <InputMask
                      mask="99.999.999/9999-99"
                      value={cpfCnpj}
                      onChange={(e) => setCpfCnpj(e.target.value)}
                    >
                      {(inputProps) => (
                        <Form.Control
                          {...inputProps}
                          isInvalid={!!formErrors.cpfCnpj}
                          required
                        />
                      )}
                    </InputMask>
                    <Form.Control.Feedback type="invalid">{formErrors.cpfCnpj}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
            </Row>
            {type === 'PF' && (
              <Row>
                <Col md={4}>
                  <Form.Group controlId="birthDate">
                    <Form.Label>Data de Nascimento</Form.Label>
                    <Form.Control
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      isInvalid={!!formErrors.birthDate}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.birthDate}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="gender">
                    <Form.Label>Sexo</Form.Label>
                    <Form.Select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      isInvalid={!!formErrors.gender}
                    >
                      <option value="">Selecione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="Other">Outro</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{formErrors.gender}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            )}
            <Row>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isInvalid={!!formErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="phone">
                  <Form.Label>Telefone</Form.Label>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  >
                    {(inputProps) => (
                      <Form.Control {...inputProps} isInvalid={!!formErrors.phone} />
                    )}
                  </InputMask>
                  <Form.Control.Feedback type="invalid">{formErrors.phone}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4">Endereço</h5>
            <Row>
              <Col md={4}>
                <Form.Group controlId="addressCep">
                  <Form.Label>CEP</Form.Label>
                  <InputMask
                    mask="99999-999"
                    value={addressCep}
                    onChange={handleCepSearch}
                  >
                    {(inputProps) => (
                      <Form.Control
                        {...inputProps}
                        isInvalid={!!formErrors.addressCep}
                        style={{ color: 'var(--text)' }}
                      />
                    )}
                  </InputMask>
                  <Form.Control.Feedback type="invalid">{formErrors.addressCep}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group controlId="addressStreet">
                  <Form.Label>Rua</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    isInvalid={!!formErrors.addressStreet}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.addressStreet}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <Form.Group controlId="addressNumber">
                  <Form.Label>Número</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    isInvalid={!!formErrors.addressNumber}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.addressNumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="addressComplement">
                  <Form.Label>Complemento</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressComplement}
                    onChange={(e) => setAddressComplement(e.target.value)}
                    isInvalid={!!formErrors.addressComplement}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.addressComplement}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="addressNeighborhood">
                  <Form.Label>Bairro</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressNeighborhood}
                    onChange={(e) => setAddressNeighborhood(e.target.value)}
                    isInvalid={!!formErrors.addressNeighborhood}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.addressNeighborhood}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group controlId="addressCity">
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    isInvalid={!!formErrors.addressCity}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.addressCity}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="addressState">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    isInvalid={!!formErrors.addressState}
                  >
                    <option value="">Selecione</option>
                    {brazilianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.addressState}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="addressCountry">
                  <Form.Label>País</Form.Label>
                  <Form.Select
                    value={addressCountry}
                    onChange={(e) => setAddressCountry(e.target.value)}
                    isInvalid={!!formErrors.addressCountry}
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.addressCountry}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {(isSupplier || isEmployee) && (
              <>
                <h5 className="mt-4">Dados Bancários</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="bankDescription">
                      <Form.Label>Descrição Bancária</Form.Label>
                      <Form.Control
                        type="text"
                        value={bankDescription}
                        onChange={(e) => setBankDescription(e.target.value)}
                        isInvalid={!!formErrors.bankDescription}
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.bankDescription}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="bankName">
                      <Form.Label>Banco</Form.Label>
                      <Form.Control
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        isInvalid={!!formErrors.bankName}
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.bankName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="bankKeyType">
                      <Form.Label>Tipo de Chave Pix</Form.Label>
                      <Form.Select
                        value={bankKeyType}
                        onChange={(e) => setBankKeyType(e.target.value)}
                        isInvalid={!!formErrors.bankKeyType}
                      >
                        <option value="">Selecione</option>
                        <option value="CPF">CPF</option>
                        <option value="CNPJ">CNPJ</option>
                        <option value="Email">E-mail</option>
                        <option value="Phone">Telefone</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{formErrors.bankKeyType}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="bankPixKey">
                      <Form.Label>Chave Pix</Form.Label>
                      <Form.Control
                        type="text"
                        value={bankPixKey}
                        onChange={(e) => setBankPixKey(e.target.value)}
                        isInvalid={!!formErrors.bankPixKey}
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.bankPixKey}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            <h5 className="mt-4">Outros</h5>
            <Form.Group controlId="observations">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                isInvalid={!!formErrors.observations}
              />
              <Form.Control.Feedback type="invalid">{formErrors.observations}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="attachment" className="mt-3">
              <Form.Label>Anexo</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setAttachment(e.target.files[0])}
                isInvalid={!!formErrors.attachment}
              />
              <Form.Control.Feedback type="invalid">{formErrors.attachment}</Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              {editingPerson ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <h3 className="mt-5">Lista de Cadastros</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => requestSort('name')}>Nome {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th onClick={() => requestSort('cpfCnpj')}>CPF/CNPJ {sortConfig.key === 'cpfCnpj' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th onClick={() => requestSort('type')}>Tipo {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th onClick={() => requestSort('isClient')}>Função {sortConfig.key === 'isClient' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th>Permissões</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((person) => (
            <tr key={person.id}>
              <td>{`${person.name} ${person.surname || ''}`}</td>
              <td>{person.cpfCnpj || person.passport || '-'}</td>
              <td>{person.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
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
                <Button variant="info" size="sm" onClick={() => handleEdit(person)}>
                  Editar
                </Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(person.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default Persons;