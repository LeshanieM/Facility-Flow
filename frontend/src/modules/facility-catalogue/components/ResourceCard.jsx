import React from 'react';
import { MapPin, Users, Settings, Trash2, Building2, Eye } from 'lucide-react';

const ResourceCard = ({ resource, isAdmin, onEdit, onDelete, onStatusToggle, onViewDetails }) => {
    console.log('Resource Data:', resource);
    const isOutOfService = resource.status === 'OUT_OF_SERVICE';
    const isMaintenance = resource.status === 'MAINTENANCE';

    return (
        <div className={`rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${isOutOfService || isMaintenance ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-[#4169E1]/30 hover:-translate-y-1'}`}>
            {resource.imageUrl && resource.imageUrl !== '' ? (
                <img src={resource.imageUrl} alt={resource.name} className="w-full h-40 object-cover rounded-t-2xl" />
            ) : (
                <div className="w-full h-40 bg-slate-100 rounded-t-2xl flex items-center justify-center">
                    <Building2 size={40} className="text-[#4169E1]" strokeWidth={1.5} />
                </div>
            )}
            
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                    <h3 className={`text-lg font-bold ${isOutOfService ? 'text-slate-500' : 'text-slate-800'}`}>
                        {resource.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        {resource.type?.replaceAll('_', ' ')}
                    </p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest ${isOutOfService ? 'bg-rose-100 text-rose-700' : isMaintenance ? 'bg-amber-100 text-amber-700' : 'bg-[#4169E1]/10 text-[#4169E1]'}`}>
                    {resource.status}
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex gap-5">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#4169E1]" strokeWidth={2.5} />
                        <span className="truncate max-w-[120px] font-medium">{resource.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-[#4169E1]" strokeWidth={2.5} />
                        <span className="font-medium">{resource.capacity} seats</span>
                    </div>
                </div>
                
                <button 
                    onClick={() => onViewDetails && onViewDetails(resource)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-[#4169E1] hover:shadow-sm transition-all"
                    title="View Details"
                >
                    <Eye size={18} strokeWidth={2.5} />
                </button>
            </div>

            <div className="mt-auto">
                {isAdmin && (
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button 
                            onClick={() => onStatusToggle(resource)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isOutOfService ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                        >
                            {isOutOfService ? 'SET ACTIVE' : 'SET OFFLINE'}
                        </button>
                        <button 
                            onClick={() => onEdit(resource)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-[#4169E1]/10 hover:text-[#4169E1] transition-all"
                            title="Edit"
                        >
                            <Settings size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                            onClick={() => onDelete(resource.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-all"
                            title="Delete"
                        >
                            <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

export default ResourceCard;
