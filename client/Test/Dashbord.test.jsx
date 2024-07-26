import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, vi } from 'vitest';
import Dashbord from '../src/components/Dashbord';

// Configurez le mock d'axios
const mockAxios = new MockAdapter(axios);
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
vi.mock('react-icons/fa', () => ({
  FaEdit: () => <span>IconEdit</span>,
  FaTrash: () => <span>IconTrash</span>
}));

describe('Dashbord component', () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it('should display clients in the table', async () => {
    const mockClients = [
      { id: 1, nom_famille: 'Doe', prenom: 'John', email: 'john.doe@example.com',tel:55,type_service: 'repairs' }
    ];

    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/csrf-token`).reply(200, {
      csrfToken: 'test-csrf-token',
    });

    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}protected`).reply(200);
    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/dashboard/clients/AllClient`).reply(200, mockClients);

    render(
      <MemoryRouter>
        <Dashbord />
      </MemoryRouter>
    );

    await waitFor(() => {
 /*      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument(); */
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
  });

   it('should navigate to the edit page when the edit button is clicked', async () => {
    const mockClients = [
      { id: 1, nom_famille: 'Doe', prenom: 'John', email: 'john.doe@example.com',tel:55,type_service: 'repairs' }
    ];

    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/csrf-token`).reply(200, {
      csrfToken: 'test-csrf-token',
    });

    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}protected`).reply(200);
    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/dashboard/clients/AllClient`).reply(200, mockClients);

    render(
      <MemoryRouter>
        <Dashbord />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('e'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/edit/1');
    });
  });

 /* it('should show an alert and remove the client when the delete button is clicked', async () => {
    const mockClients = [
      { id: 1, lastname: 'Doe', firstname: 'John', email: 'john.doe@example.com' },
    ];

    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/csrf-token`).reply(200, {
      csrfToken: 'test-csrf-token',
    });

    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}protected`).reply(200);
    mockAxios.onGet(`${import.meta.env.VITE_API_BASE_URL}api/dashboard/clients/AllClient`).reply(200, mockClients);

    mockAxios.onDelete(`${import.meta.env.VITE_API_BASE_URL}api/users/1`).reply(200);

    const alertSpy = vi.spyOn(window, 'alert').mockReturnValue();

    render(
      <MemoryRouter>
        <Dashbord />
      </MemoryRouter>
    );

    

    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('Delete client'));
      expect(alertSpy).toHaveBeenCalledWith('Client supprimé');
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  }); */
});
