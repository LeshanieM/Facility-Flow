import React, { useState, useEffect } from "react";
import { facilityApi } from "../api/facilityApi";
import ResourceCard from "../components/ResourceCard";
import ResourceFilter from "../components/ResourceFilter";
import ResourceDetailModal from "../components/ResourceDetailModal";
import { Building2 } from "lucide-react";
import Layout from "../../../components/Layout";

const FacilityCataloguePage = () => {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    minCapacity: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.minCapacity) params.minCapacity = filters.minCapacity;

      const res = await facilityApi.getAllResources(params);
      setResources(res.data);
    } catch (error) {
      console.error("Failed to load resources", error);
      setError(
        "We encountered an issue communicating with the server. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#4169E1]/10 flex items-center justify-center text-[#4169E1]">
              <Building2 size={24} className="stroke-[2.5]" />
            </div>
            Facilities Catalogue
          </h1>
          <p className="text-slate-500 mt-2 ml-16 font-medium">
            Browse and search available campus facilities and resources.
          </p>
        </div>

        <ResourceFilter
          filters={filters}
          setFilters={setFilters}
          onSearch={loadResources}
        />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-rose-50 rounded-3xl border border-rose-100 shadow-sm animate-fade-in">
            <h3 className="text-lg font-bold text-rose-700">Offline</h3>
            <p className="text-rose-600/80 mt-2 font-medium">{error}</p>
            <button
              onClick={loadResources}
              className="mt-6 px-6 py-2.5 bg-white text-rose-600 font-bold rounded-xl border border-rose-200 shadow-sm hover:bg-rose-100 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Building2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">
              No facilities found.
            </h3>
            <p className="text-slate-500 mt-2 font-medium">
              Try adjusting your search filters to see more results.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isAdmin={false}
                onViewDetails={(res) => setSelectedResource(res)}
              />
            ))}
          </div>
        )}
      </div>

      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onReviewAdded={(updatedResource) => {
          setSelectedResource(updatedResource);
          setResources((prev) =>
            prev.map((item) =>
              item.id === updatedResource.id ? updatedResource : item,
            ),
          );
        }}
      />
    </Layout>
  );
};

export default FacilityCataloguePage;
