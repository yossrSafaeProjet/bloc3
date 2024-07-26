import { useState,useEffect } from 'react';
import './SigninForm.css';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
const baseURI = import.meta.env.VITE_API_BASE_URL
const SigninForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [csrfToken, setCsrfToken] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const navigate = useNavigate();

  useEffect(() => {

    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(`${baseURI}api/csrf-token`);
        console.log(response.data)
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('Erreur lors de la récupération du token CSRF:', error);
      }
    };
    fetchCsrfToken();
  },[]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(baseURI + 'api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        
          'X-CSRF-Token': csrfToken // Ajouter le jeton CSRF dans les en-têtes

        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('Connexion réussie');
        navigate('/dashboard')
      } else {
        alert('Erreur lors de la connexion');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  return (
    <form className="signin-form" onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
      <button type="submit">Se connecter</button>
    </form>
  );
};

export default SigninForm;