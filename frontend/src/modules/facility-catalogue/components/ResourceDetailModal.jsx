import React from 'react';
import { X, MapPin, Users, Clock, Building2 } from 'lucide-react';

const ResourceDetailModal = ({ resource, onClose }) => {
    if (!resource) return null;

    const isOutOfService = resource.status === 'OUT_OF_SERVICE';
    const isMaintenance = resource.status === 'MAINTENANCE';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-all"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                {/* Header Image */}
                {resource.imageUrl && resource.imageUrl !== '' ? (
                    <img src={resource.imageUrl} alt={resource.name} className="w-full h-48 object-cover" />
                ) : (
                    <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                        <Building2 size={48} className="text-[#4169E1]" strokeWidth={1.5} />
                    </div>
                )}

                <div className="p-8">
                    {/* Title & Status */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">{resource.name}</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {resource.type?.replace('_', ' ')}
                            </p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-widest ${isOutOfService ? 'bg-rose-100 text-rose-700' : isMaintenance ? 'bg-amber-100 text-amber-700' : 'bg-[#4169E1]/10 text-[#4169E1]'}`}>
                            {resource.status}
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="flex gap-6 mb-8 text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-[#4169E1]" strokeWidth={2.5} />
                            <span className="font-medium">{resource.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-[#4169E1]" strokeWidth={2.5} />
                            <span className="font-medium">{resource.capacity} seats</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">Description</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {resource.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Amenities */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Amenities</h3>
                            {resource.amenities && resource.amenities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {resource.amenities.map((amenity, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-[#4169E1]/10 text-[#4169E1] text-xs font-bold rounded-lg tracking-wide">
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">None listed.</p>
                            )}
                        </div>

                        {/* Availability */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <Clock size={16} className="text-[#4169E1]" strokeWidth={2.5} />
                                Availability Windows
                            </h3>
                            {resource.availabilityWindows && resource.availabilityWindows.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {resource.availabilityWindows.map((window, idx) => (
                                        <div key={idx} className="px-3 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center justify-between">
                                            <span>{window.dayOfWeek}: {window.startTime} - {window.endTime}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">No regular windows specified.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailModal;
