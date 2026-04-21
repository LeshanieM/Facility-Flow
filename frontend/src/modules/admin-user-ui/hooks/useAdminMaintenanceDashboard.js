import { useState, useEffect } from 'react';
import { getAllTickets, updateTicketStatus, assignTechnicianToTicket } from '../api/adminMaintenanceApi';
import api from '../../../services/api';

export const useAdminMaintenanceDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadTechnicians = async () => {
        try {
            const response = await api.get('/admin/users');
            if (Array.isArray(response.data)) {
                setTechnicians(response.data.filter(u => u.role === 'TECHNICIAN'));
            }
        } catch (err) {
            console.error('Failed to load technicians', err);
        }
    };

    const loadTickets = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllTickets();
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.response?.status === 403 
                ? 'Access Denied: You do not have top-level Admin permissions.'
                : 'Failed to fetch facility incidents right now.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
        loadTechnicians();
    }, []);

    const changeStatus = async (ticketId, statusPayload) => {
        try {
            const updated = await updateTicketStatus(ticketId, statusPayload);
            setTickets(current => current.map(t => t.id === ticketId ? { ...t, ...updated } : t));
            return updated;
        } catch (err) {
            console.error('Failed to update ticket status', err);
            alert(err?.response?.data?.message || 'Failed to update ticket. Check your connection.');
            return null;
        }
    };

    const assignTicket = async (ticketId, technicianId) => {
        try {
            const updated = await assignTechnicianToTicket(ticketId, technicianId);
            setTickets(current => current.map(t => t.id === ticketId ? { ...t, ...updated } : t));
        } catch (err) {
            console.error('Failed to assign technician', err);
            alert('Failed to assign technician.');
        }
    };

    return {
        tickets,
        technicians,
        isLoading,
        error,
        changeStatus,
        assignTicket,
        refreshTickets: loadTickets
    };
};
