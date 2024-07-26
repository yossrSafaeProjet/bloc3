import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, vi } from 'vitest';
import InscriptionClient from '../src/components/InscriptionClient';

// Mock axios
const mockAxios = new MockAdapter(axios);

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  });

describe('AppointmentForm', () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it('should fetch user data and fill the form in edit mode', async () => {
    const mockUserData = {
      nom_famille: 'aal',
      prenom: 'aaas',
      email: 'as',
      tel: '3',
      type_service: 'Réparations',
    };

    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/csrf-token`).reply(200, {
      csrfToken: 'test-csrf-token',
    });

    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/dashboard/clients/10`).reply(200, [mockUserData]);

    render(
      <MemoryRouter initialEntries={['/edit/10']}>
        <Routes>
          <Route path="/edit/:id" element={<InscriptionClient mode="edit" />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Entrez votre nom de famille').value).toBe('aal');
      expect(screen.getByPlaceholderText('Entrez votre prénom').value).toBe('aaas');
      expect(screen.getByPlaceholderText('Entrez votre email').value).toBe('as');
      expect(screen.getByPlaceholderText('Entrez votre numéro de téléphone').value).toBe('3');
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Réparations')).toBeInTheDocument();
    });
  });

  it('should submit the form successfully', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockReturnValue();
    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/csrf-token`).reply(200, {
      csrfToken: 'test-csrf-token',
    });

    mockAxios.onPut(`${import.meta.env.VITE_API_BASE_URL}api/update/10`).reply(200);

    render(
      <MemoryRouter initialEntries={['/edit/10']}>
        <Routes>
          <Route path="/edit/:id" element={<InscriptionClient mode="edit" />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Entrez votre nom de famille'), {
      target: { value: 'Updated Last Name' },
    });
    fireEvent.change(screen.getByPlaceholderText('Entrez votre prénom'), {
      target: { value: 'Updated First Name' },
    });
    fireEvent.change(screen.getByPlaceholderText('Entrez votre email'), {
      target: { value: 'updated@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Entrez votre numéro de téléphone'), {
      target: { value: '1234567890' },
    });

    // Update the select option
    fireEvent.change(screen.getByDisplayValue('Réparations'), {
      target: { value: 'maintenance' },
    });

    fireEvent.click(screen.getByText('Soumettre'));

    await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Modification avec succès.');
     
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
