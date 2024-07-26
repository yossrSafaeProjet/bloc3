import React, { useState, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

axios.defaults.withCredentials = true;

const baseURI = import.meta.env.VITE_API_BASE_URL;

const AppointmentForm = (props) => {
  const [formData, setFormData] = useState({
    nom_famille: '',
    prenom: '',
    email: '',
    tel: '',
    type_service: 'repairs'
  });

  const [csrfToken, setCsrfToken] = useState('');
  const { mode } = props;
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCsrfTokenAndUserData = async () => {
      try {
        // Fetch CSRF token
        const csrfResponse = await axios.get(`${baseURI}api/csrf-token`);
        setCsrfToken(csrfResponse.data.csrfToken);
        const authResponse = await axios.get(`${baseURI}protected`, { withCredentials: true });
        console.log(authResponse.status)
        if (authResponse.status === 200) {
            if (mode === 'edit' && id) {
                const userResponse = await axios.get(`${baseURI}api/dashboard/clients/${id}`, {
                  headers: {
                    'X-CSRF-Token': csrfResponse.data.csrfToken
                  },
                  withCredentials: true
                });
                const userData = userResponse.data[0];
                console.log("Données utilisateur récupérées:", userData);
                setFormData(userData);
              }
        }
       
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        alert('Erreur lors de la récupération des données.');
      }
    };

    fetchCsrfTokenAndUserData();
  }, [mode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${baseURI}api/update/${id}`, formData, {
        headers: {
          'X-CSRF-Token': csrfToken
        },
        withCredentials: true
      });

      alert('Modification avec succès.');
      navigate('/dashboard')
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      alert('Erreur lors de la soumission du formulaire.');
    }
  };

  return (
    <Container>
      <h1 className="my-4">Formulaire de Prise de Rendez-vous</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formLastName">
          <Form.Label>Nom de famille</Form.Label>
          <Form.Control
            type="text"
            placeholder="Entrez votre nom de famille"
            name="nom_famille"
            value={formData.nom_famille}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formFirstName">
          <Form.Label>Prénom</Form.Label>
          <Form.Control
            type="text"
            placeholder="Entrez votre prénom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Entrez votre email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formPhone">
          <Form.Label>Numéro de téléphone</Form.Label>
          <Form.Control
            type="tel"
            placeholder="Entrez votre numéro de téléphone"
            name="tel"
            value={formData.tel}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formServiceType">
          <Form.Label>Type de service</Form.Label>
          <Form.Control
            as="select"
            name="type_service"
            value={formData.type_service
            }
            onChange={handleChange}
            required
          >
            <option value="repairs">Réparations</option>
            <option value="maintenance">Entretien</option>
            <option value="diagnostic">Diagnostic</option>
            <option value="other">Autre</option>
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit">
          Soumettre
        </Button>
      </Form>
    </Container>
  );
};

export default AppointmentForm;
