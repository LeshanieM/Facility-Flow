import React, { useState, useEffect } from 'react';
import { facilityApi } from '../api/facilityApi';
import ResourceCard from '../components/ResourceCard';
import ResourceForm from '../components/ResourceForm';
import ResourceDetailModal from '../components/ResourceDetailModal';
import { Settings, Plus } from 'lucide-react';
import Layout from '../../../components/Layout';

const AdminFacilityPage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [formError, setFormError] = useState(null);
    const [selectedResource, setSelectedResource] = useState(null);

    const loadResources = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await facilityApi.getAdminResources();
            setResources(res.data);
        } catch (error) {
            console.error('Failed to load resources', error);
            setError('Failed to fetch administrative data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, []);

    const handleSave = async (data) => {
        setFormError(null);
        setLoading(true);
        try {
            if (editingResource) {
                await facilityApi.updateResource(editingResource.id, data);
                setSuccessMessage('Facility successfully updated.');
            } else {
                await facilityApi.createResource(data);
                setSuccessMessage('Facility successfully created.');
            }
            setIsFormOpen(false);
            setEditingResource(null);
            setTimeout(() => setSuccessMessage(null), 3000);
            loadResources();
        } catch (error) {
            console.error('Failed to save resource', error);
            setFormError('Failed to save the facility. Please verify the information and try again.');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            setLoading(true);
            try {
                await facilityApi.deleteResource(id);
                setSuccessMessage('Facility successfully deleted.');
                setTimeout(() => setSuccessMessage(null), 3000);
                loadResources();
            } catch (error) {
                console.error('Failed to delete', error);
                setError('Failed to delete the selected facility.');
                setLoading(false);
            }
        }
    };

    const handleStatusToggle = async (resource) => {
        setLoading(true);
        try {
            const newStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
            await facilityApi.updateResourceStatus(resource.id, newStatus);
            setSuccessMessage(`Facility status updated to ${newStatus.replace('_', ' ')}.`);
            setTimeout(() => setSuccessMessage(null), 3000);
            loadResources();
        } catch (error) {
            console.error('Failed to update status', error);
            setError('Failed to update facility status.');
            setLoading(false);
        }
    };

    const openCreateForm = () => {
        setEditingResource(null);
        setIsFormOpen(true);
    };

    const openEditForm = (resource) => {
        setEditingResource(resource);
        setIsFormOpen(true);
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#4169E1]/10 flex items-center justify-center text-[#4169E1]">
                                <Settings size={24} className="stroke-[2.5]" />
                            </div>
                            Manage Facilities
                        </h1>
                        <p className="text-slate-500 mt-2 ml-16 font-medium">Administration panel for campus resources and facilities.</p>
                    </div>
                    <button 
                        onClick={openCreateForm}
                        className="flex items-center gap-2 bg-[#4169E1] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-[#4169E1]/30 hover:bg-blue-700 hover:shadow-[#4169E1]/40 transition-all active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Add New Facility
                    </button>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold animate-fade-in shadow-sm flex items-center">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl font-bold flex justify-between items-center shadow-sm animate-fade-in">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 transition-colors">Dismiss</button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]"></div>
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Settings size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No facilities configured.</h3>
                        <p className="text-slate-500 mt-2 font-medium">Click the Add New Facility button to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {resources.map(resource => (
                            <ResourceCard 
                                key={resource.id} 
                                resource={resource} 
                                isAdmin={true} 
                                onEdit={openEditForm}
                                onDelete={handleDelete}
                                onStatusToggle={handleStatusToggle}
                                onViewDetails={(res) => setSelectedResource(res)}
                            />
                        ))}
                    </div>
                )}

                {isFormOpen && (
                    <ResourceForm 
                        initialData={editingResource} 
                        onSave={handleSave} 
                        onClose={() => setIsFormOpen(false)} 
                        error={formError}
                    />
                )}

                <ResourceDetailModal 
                    resource={selectedResource} 
                    onClose={() => setSelectedResource(null)} 
                />
            </div>
        </Layout>
    );
};

export default AdminFacilityPage;
