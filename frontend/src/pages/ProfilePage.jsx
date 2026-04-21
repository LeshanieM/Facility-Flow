import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  User,
  Mail,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import axios from 'axios';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(
    user?.name || user?.email?.split('@')[0] || user?.sub?.split('@')[0] || '',
  );
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.picture || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    formData.append('name', name);
    if (image) {
      formData.append('picture', image);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:8092/api/user/profile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      updateUser({
        name: response.data.name,
        picture: response.data.picture,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Account Settings
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Manage your profile and account preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-400 group-hover:scale-105 transition-all duration-500">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user?.email || user?.sub)?.[0].toUpperCase()
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-primary/90 hover:scale-110 transition-all border-4 border-white">
                  <Camera size={18} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {user?.name || (user?.email || user?.sub)?.split('@')[0]}
                </h3>
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mt-1">
                  {user?.role}
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Status
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Active
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    ID
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    #{user?.id?.slice(-4) || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Personal Information
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                        size={18}
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="email"
                        value={user?.email || user?.sub || ''}
                        disabled
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    {error && (
                      <p className="text-rose-600 text-sm font-bold">{error}</p>
                    )}
                    {success && (
                      <p className="text-emerald-600 text-sm font-bold flex items-center gap-1.5 animate-bounce-in">
                        <CheckCircle2 size={16} />
                        Profile updated successfully!
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Additional Info Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm group hover:border-primary/30 transition-all">
                <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
                  Account Type
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold">{user?.role}</div>
                    <div className="text-slate-400 text-xs font-medium">
                      Full System Access
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm group hover:border-primary/30 transition-all">
                <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
                  Connected Email
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold truncate max-w-[150px]">
                      {(user?.email || user?.sub)?.split('@')[0]}
                    </div>
                    <div className="text-slate-400 text-xs font-medium">
                      Google Auth
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
