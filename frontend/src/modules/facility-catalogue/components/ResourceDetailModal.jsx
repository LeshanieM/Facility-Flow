import React, { useState } from "react";
import { X, MapPin, Users, Clock, Building2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResourceDetailModal = ({ resource, onClose }) => {
  const navigate = useNavigate();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!resource) return null;

  const isOutOfService = resource.status === "OUT_OF_SERVICE";
  const isMaintenance = resource.status === "MAINTENANCE";

  const format12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${String(formattedHour).padStart(2, "0")}:${minute} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Fixed Header with Close Button */}
        <div className="flex justify-end p-4 border-b border-slate-100 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {/* Header Image */}
          {resource.imageUrl && resource.imageUrl !== "" ? (
            <img
              src={resource.imageUrl}
              alt={resource.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-slate-50 border-b border-slate-100 flex items-center justify-center">
              <Building2
                size={48}
                className="text-[#4169E1]"
                strokeWidth={1.5}
              />
            </div>
          )}

          <div className="px-6 py-6">
            {/* Title & Status */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  {resource.name}
                </h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {resource.type?.replace("_", " ")}
                </p>
              </div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest ${isOutOfService ? "bg-rose-100 text-rose-700" : isMaintenance ? "bg-amber-100 text-amber-700" : "bg-[#4169E1]/10 text-[#4169E1]"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isOutOfService ? "bg-rose-500" : isMaintenance ? "bg-amber-500" : "bg-emerald-500"}`}
                ></span>
                {resource.status}
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-4 mb-8 text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin
                  size={18}
                  className="text-[#4169E1] flex-shrink-0"
                  strokeWidth={2.5}
                />
                <span className="font-medium truncate">
                  {resource.location}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200 flex-shrink-0"></div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Users size={18} className="text-[#4169E1]" strokeWidth={2.5} />
                <span className="font-medium">{resource.capacity} seats</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">
                Description
              </h3>
              <p
                className={`text-slate-600 leading-relaxed text-sm ${!isDescriptionExpanded && resource.description?.length > 150 ? "line-clamp-3" : ""}`}
              >
                {resource.description || "No description provided."}
              </p>
              {resource.description?.length > 150 && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="text-[#4169E1] text-sm font-bold mt-1 hover:underline"
                >
                  {isDescriptionExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
              {/* Amenities */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
                  Amenities
                </h3>
                {resource.amenities && resource.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resource.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-[#4169E1]/10 text-[#4169E1] text-xs font-bold rounded-lg tracking-wide"
                      >
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
                  <Clock
                    size={16}
                    className="text-[#4169E1]"
                    strokeWidth={2.5}
                  />
                  Availability Windows
                </h3>
                {resource.availabilityWindows &&
                resource.availabilityWindows.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {resource.availabilityWindows.map((window, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-100 border-l-4 border-l-emerald-500 flex items-center justify-between shadow-sm"
                      >
                        <span>
                          {window.dayOfWeek}: {format12Hour(window.startTime)} -{" "}
                          {format12Hour(window.endTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">
                    No regular windows specified.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              navigate(
                `/bookings/new?facilityId=${resource.id}&facilityName=${encodeURIComponent(resource.name)}`,
              );
            }}
            disabled={isOutOfService || isMaintenance}
            className={`w-full py-3.5 text-white font-bold rounded-xl shadow-md flex justify-center items-center gap-2 transition-all ${isOutOfService || isMaintenance ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-[#4169E1] shadow-[#4169E1]/30 hover:shadow-lg hover:shadow-[#4169E1]/40"}`}
          >
            <Calendar size={18} strokeWidth={2.5} />
            {isOutOfService || isMaintenance ? "Facility Unavailable" : "Book"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailModal;
