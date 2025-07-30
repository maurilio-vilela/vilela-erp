import './Persons.css';
import React, { useState, useEffect } from 'react';
   import { Form, Button, Container, Alert, Table, Dropdown, Modal, Row, Col } from 'react-bootstrap';
   import InputMask from 'react-input-mask';
   import axios from 'axios';
   import { useSelector } from 'react-redux';

   const Persons = () => {
     const [type, setType] = useState('PF');
     const [isClient, setIsClient] = useState(false);
     const [isSupplier, setIsSupplier] = useState(false);
     const [isEmployee, setIsEmployee] = useState(false);
     const [name, setName] = useState('');
     const [surname, setSurname] = useState('');
     const [companyName, setCompanyName] = useState('');
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
     const [editingPerson, setEditingPerson] = useState(null);
     const [showModal, setShowModal] = useState(false);
     const { token } = useSelector((state) => state.auth);

     // Lista de estados brasileiros
     const brazilianStates = [
       'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
       'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
     ];

     // Lista de países (exemplo simplificado)
     const countries = ['Brasil', 'Argentina', 'Chile', 'Uruguai', 'Paraguai', 'Outros'];

     useEffect(() => {
       fetchPersons();
     }, [token]);

     const fetchPersons = async () => {
       try {
         const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/persons`, {
           headers: { Authorization: `Bearer ${token}` },
         });
         setPersons(response.data);
       } catch (err) {
         console.error('Erro ao listar pessoas:', err);
         setError('Erro ao carregar lista de cadastros');
       }
     };

     const handleSubmit = async (e) => {
       e.preventDefault();
       const formData = new FormData();
       formData.append('type', type);
       formData.append('isClient', isClient);
       formData.append('isSupplier', isSupplier);
       formData.append('isEmployee', isEmployee);
       formData.append('name', type === 'PF' ? name : companyName);
       if (type === 'PF') {
         formData.append('surname', surname);
       }
       formData.append('cpfCnpj', cpfCnpj.replace(/[^0-9]/g, ''));
       if (birthDate && type === 'PF') formData.append('birthDate', birthDate);
       if (gender && type === 'PF') formData.append('gender', gender);
       if (email) formData.append('email', email);
       if (phone) formData.append('phone', phone);
       if (addressCep) formData.append('addressCep', addressCep.replace(/[^0-9]/g, ''));
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
         const url = editingPerson
           ? `${process.env.REACT_APP_API_URL}/admin/persons/${editingPerson.id}`
           : `${process.env.REACT_APP_API_URL}/admin/persons`;
         const method = editingPerson ? 'put' : 'post';
         await axios[method](url, formData, {
           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
         });
         setSuccess(editingPerson ? 'Cadastro atualizado com sucesso!' : 'Cadastro criado com sucesso!');
         setError('');
         resetForm();
         fetchPersons();
       } catch (err) {
         console.error('Erro no cadastro:', err);
         setError(err.response?.data?.error || 'Erro ao salvar cadastro');
         setSuccess('');
       }
     };

     const handleEdit = (person) => {
       setEditingPerson(person);
       setType(person.type);
       setIsClient(person.isClient);
       setIsSupplier(person.isSupplier);
       setIsEmployee(person.isEmployee);
       setName(person.type === 'PF' ? person.name : '');
       setCompanyName(person.type === 'PJ' ? person.name : '');
       setSurname(person.surname || '');
       setCpfCnpj(person.cpfCnpj);
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

     const resetForm = () => {
       setEditingPerson(null);
       setType('PF');
       setIsClient(false);
       setIsSupplier(false);
       setIsEmployee(false);
       setName('');
       setCompanyName('');
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
       setShowModal(false);
     };

     return (
       <Container>
         <h2>Gerenciamento de Pessoas</h2>
         <Button onClick={() => setShowModal(true)} className="mb-3">Novo Cadastro</Button>
         {error && <Alert variant="danger">{error}</Alert>}
         {success && <Alert variant="success">{success}</Alert>}

         <Modal show={showModal} onHide={resetForm} size="lg" style={{ maxWidth: '70%' }}>
           <Modal.Header closeButton>
             <Modal.Title>{editingPerson ? 'Editar Cadastro' : 'Novo Cadastro'}</Modal.Title>
           </Modal.Header>
           <Modal.Body>
             <Form onSubmit={handleSubmit}>
               {/* Grupo: Tipo de Cadastro */}
               <h5>Tipo de Cadastro</h5>
               <Row>
                 <Col md={4}>
                   <Form.Group controlId="type">
                     <Form.Label>Tipo de Pessoa</Form.Label>
                     <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                       <option value="PF">Pessoa Física</option>
                       <option value="PJ">Pessoa Jurídica</option>
                     </Form.Select>
                   </Form.Group>
                 </Col>
                 <Col md={8}>
                   <Form.Label>Funções</Form.Label>
                   <div>
                     <Form.Check
                       inline
                       type="checkbox"
                       label="Cliente"
                       checked={isClient}
                       onChange={(e) => setIsClient(e.target.checked)}
                     />
                     <Form.Check
                       inline
                       type="checkbox"
                       label="Fornecedor"
                       checked={isSupplier}
                       onChange={(e) => setIsSupplier(e.target.checked)}
                     />
                     <Form.Check
                       inline
                       type="checkbox"
                       label="Colaborador"
                       checked={isEmployee}
                       onChange={(e) => setIsEmployee(e.target.checked)}
                     />
                   </div>
                 </Col>
               </Row>

               {/* Grupo: Dados Pessoais (PF) ou Dados da Empresa (PJ) */}
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
                           required
                         />
                       </Form.Group>
                     </Col>
                     <Col md={4}>
                       <Form.Group controlId="surname">
                         <Form.Label>Sobrenome</Form.Label>
                         <Form.Control
                           type="text"
                           value={surname}
                           onChange={(e) => setSurname(e.target.value)}
                           required
                         />
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
                           required
                         />
                       </Form.Group>
                     </Col>
                     <Col md={4}>
                       <Form.Group controlId="companyName">
                         <Form.Label>Nome Fantasia</Form.Label>
                         <Form.Control
                           type="text"
                           value={companyName}
                           onChange={(e) => setCompanyName(e.target.value)}
                           required
                         />
                       </Form.Group>
                     </Col>
                   </>
                 )}
                 <Col md={4}>
                   <Form.Group controlId="cpfCnpj">
                     <Form.Label>{type === 'PF' ? 'CPF' : 'CNPJ'}</Form.Label>
                     <InputMask
                       mask={type === 'PF' ? '999.999.999-99' : '99.999.999/9999-99'}
                       value={cpfCnpj}
                       onChange={(e) => setCpfCnpj(e.target.value)}
                     >
                       {(inputProps) => <Form.Control {...inputProps} required />}
                     </InputMask>
                   </Form.Group>
                 </Col>
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
                       />
                     </Form.Group>
                   </Col>
                   <Col md={4}>
                     <Form.Group controlId="gender">
                       <Form.Label>Sexo</Form.Label>
                       <Form.Select value={gender} onChange={(e) => setGender(e.target.value)}>
                         <option value="">Selecione</option>
                         <option value="M">Masculino</option>
                         <option value="F">Feminino</option>
                         <option value="Other">Outro</option>
                       </Form.Select>
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
                     />
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
                       {(inputProps) => <Form.Control {...inputProps} />}
                     </InputMask>
                   </Form.Group>
                 </Col>
               </Row>

               {/* Grupo: Endereço */}
               <h5 className="mt-4">Endereço</h5>
               <Row>
                 <Col md={4}>
                   <Form.Group controlId="addressCep">
                     <Form.Label>CEP</Form.Label>
                     <InputMask
                       mask="99999-999"
                       value={addressCep}
                       onChange={(e) => setAddressCep(e.target.value)}
                     >
                       {(inputProps) => <Form.Control {...inputProps} />}
                     </InputMask>
                   </Form.Group>
                 </Col>
                 <Col md={8}>
                   <Form.Group controlId="addressStreet">
                     <Form.Label>Rua</Form.Label>
                     <Form.Control
                       type="text"
                       value={addressStreet}
                       onChange={(e) => setAddressStreet(e.target.value)}
                     />
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
                     />
                   </Form.Group>
                 </Col>
                 <Col md={3}>
                   <Form.Group controlId="addressComplement">
                     <Form.Label>Complemento</Form.Label>
                     <Form.Control
                       type="text"
                       value={addressComplement}
                       onChange={(e) => setAddressComplement(e.target.value)}
                     />
                   </Form.Group>
                 </Col>
                 <Col md={6}>
                   <Form.Group controlId="addressNeighborhood">
                     <Form.Label>Bairro</Form.Label>
                     <Form.Control
                       type="text"
                       value={addressNeighborhood}
                       onChange={(e) => setAddressNeighborhood(e.target.value)}
                     />
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
                     />
                   </Form.Group>
                 </Col>
                 <Col md={4}>
                   <Form.Group controlId="addressState">
                     <Form.Label>Estado</Form.Label>
                     <Form.Select
                       value={addressState}
                       onChange={(e) => setAddressState(e.target.value)}
                     >
                       <option value="">Selecione</option>
                       {brazilianStates.map((state) => (
                         <option key={state} value={state}>{state}</option>
                       ))}
                     </Form.Select>
                   </Form.Group>
                 </Col>
                 <Col md={4}>
                   <Form.Group controlId="addressCountry">
                     <Form.Label>País</Form.Label>
                     <Form.Select
                       value={addressCountry}
                       onChange={(e) => setAddressCountry(e.target.value)}
                     >
                       {countries.map((country) => (
                         <option key={country} value={country}>{country}</option>
                       ))}
                     </Form.Select>
                   </Form.Group>
                 </Col>
               </Row>

               {/* Grupo: Dados Bancários */}
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
                         />
                       </Form.Group>
                     </Col>
                     <Col md={6}>
                       <Form.Group controlId="bankName">
                         <Form.Label>Banco</Form.Label>
                         <Form.Control
                           type="text"
                           value={bankName}
                           onChange={(e) => setBankName(e.target.value)}
                         />
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
                         >
                           <option value="">Selecione</option>
                           <option value="CPF">CPF</option>
                           <option value="CNPJ">CNPJ</option>
                           <option value="Email">E-mail</option>
                           <option value="Phone">Telefone</option>
                         </Form.Select>
                       </Form.Group>
                     </Col>
                     <Col md={6}>
                       <Form.Group controlId="bankPixKey">
                         <Form.Label>Chave Pix</Form.Label>
                         <Form.Control
                           type="text"
                           value={bankPixKey}
                           onChange={(e) => setBankPixKey(e.target.value)}
                         />
                       </Form.Group>
                     </Col>
                   </Row>
                 </>
               )}

               {/* Observações e Anexo */}
               <h5 className="mt-4">Outros</h5>
               <Form.Group controlId="observations">
                 <Form.Label>Observações</Form.Label>
                 <Form.Control
                   as="textarea"
                   rows={3}
                   value={observations}
                   onChange={(e) => setObservations(e.target.value)}
                 />
               </Form.Group>
               <Form.Group controlId="attachment" className="mt-3">
                 <Form.Label>Anexo</Form.Label>
                 <Form.Control
                   type="file"
                   onChange={(e) => setAttachment(e.target.files[0])}
                 />
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
       </Container>
     );
   };

   export default Persons;