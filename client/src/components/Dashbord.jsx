import React, { useEffect, useState } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Configure axios to send cookies with each request
axios.defaults.withCredentials = true;

const baseURI = import.meta.env.VITE_API_BASE_URL;

const Dashbord = () => {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(`${baseURI}api/csrf-token`);
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('Erreur lors de la récupération du token CSRF:', error);
      }
    };
    const fetchClients = async () => {
      try {
        // Vérifiez si l'utilisateur est authentifié
        const authResponse = await axios.get(`${baseURI}protected`, { withCredentials: true });
        console.log(authResponse.status)
        if (authResponse.status === 200) {
          try {
            // Récupérez les clients si l'utilisateur est authentifié
            const clientsResponse = await axios.get(`${baseURI}api/dashboard/clients/AllClient`);
            setClients(clientsResponse.data);
          } catch (clientsError) {
            console.error('Erreur lors de la récupération des clients:', clientsError);
            window.alert('Erreur lors de la récupération des clients.');
          }
        } else if (authResponse.status === 401) {
          alert('Vous n\'êtes pas autorisé!');
        } else {
          alert('Une erreur est survenue.');
        }
      } catch (authError) {
        console.error('Erreur lors de la vérification du token:', authError);
        alert('Une erreur est survenue lors de la vérification du token.');
      }
    };
    fetchCsrfToken();
    fetchClients();
  }, []); 
  const handleEdit = async (userId) => {
    
    try {
        if (userId) {
          navigate(`/edit/${userId}`); // Redirection vers la page d'édition en passant l'ID dans l'URL
        } else {
          alert('ID utilisateur non disponible.');
        }
      
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      alert('Une erreur est survenue lors de la vérification du token.');
    }
  };

  const handleDelete = async (userId) => {
    try {
        if (userId) {
            // Envoi du jeton CSRF dans les en-têtes de la requête DELETE
            await axios.delete(`${baseURI}api/users/${userId}`, {
                headers: {
                    'X-CSRF-Token': csrfToken // Ajouter le jeton CSRF dans les en-têtes
                },
                withCredentials: true
            });

            alert('Client supprimé');
            setClients(clients.filter(client => client.id !== userId));
        } else {
            alert('ID utilisateur non disponible.');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
        alert('Une erreur est survenue lors de la suppression du client.');
    }
};


  return (
    <Container className="mt-5 bg-dark text-white p-3 rounded">
      <h1>Client Dashboard</h1>
      <p>Nombre de clients : {clients.length}</p>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.lastname} {client.firstname}</td>
              <td>{client.email}</td>
              <td>
                <Button variant="warning" aria-label='e' onClick={() => handleEdit(client.id)} className="mr-2">
                  <FaEdit />
                </Button>
                <Button variant="danger" aria-label="Delete client" onClick={() => handleDelete(client.id)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Dashbord;
