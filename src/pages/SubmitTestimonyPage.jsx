import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Star, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubmitTestimonyPage() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        church_branch: '',
        role_title: '',
        year_of_attendance: new Date().getFullYear(),
        star_rating: 5,
        testimonial_text: '',
        consent: false
    });
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.consent) {
            setError('You must agree to the terms to submit.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let profile_photo_url = null;

            // Upload photo if exists
            if (photo) {
                const fileExt = photo.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `profiles/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('event-files')
                    .upload(filePath, photo);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('event-files')
                    .getPublicUrl(filePath);

                profile_photo_url = publicUrl;
            }

            // Insert testimonial
            const { error: insertError } = await supabase
                .from('testimonials')
                .insert([{
                    ...formData,
                    profile_photo_url,
                    status: 'pending'
                }]);

            if (insertError) throw insertError;

            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting testimony:', err);
            setError('Failed to submit testimony. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100"
                    >
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </motion.div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Thank You!</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Your testimony has been submitted successfully. It will be reviewed by our team shortly.
                    </p>
                    <div className="mt-6">
                        <a href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Return to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Share Your Experience</h1>
                    <p className="mt-4 text-lg text-gray-600">
                        We'd love to hear how GREAT DAYS has impacted your life.
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    required
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Church Branch / Ministry</label>
                                <input
                                    type="text"
                                    name="church_branch"
                                    value={formData.church_branch}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role / Title (Optional)</label>
                                <input
                                    type="text"
                                    name="role_title"
                                    placeholder="e.g. Pastor, Deacon, Member"
                                    value={formData.role_title}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Year of Attendance</label>
                                <select
                                    name="year_of_attendance"
                                    value={formData.year_of_attendance}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {[2025, 2024, 2023, 2022, 2021].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Profile Photo (Optional)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors">
                                <div className="space-y-1 text-center">
                                    {photo ? (
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm text-gray-600 mb-2">Selected: {photo.name}</p>
                                            <button
                                                type="button"
                                                onClick={() => setPhoto(null)}
                                                className="text-xs text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, star_rating: star }))}
                                        className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${formData.star_rating >= star ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                    >
                                        <Star className="h-8 w-8 fill-current" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Your Testimony *</label>
                            <div className="mt-1">
                                <textarea
                                    name="testimonial_text"
                                    rows={4}
                                    required
                                    minLength={50}
                                    maxLength={500}
                                    value={formData.testimonial_text}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Share your experience (50-500 characters)..."
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 text-right">
                                {formData.testimonial_text.length}/500
                            </p>
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="consent"
                                    name="consent"
                                    type="checkbox"
                                    required
                                    checked={formData.consent}
                                    onChange={handleChange}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="consent" className="font-medium text-gray-700">I agree to share this testimony publicly</label>
                                <p className="text-gray-500">By checking this box, you grant permission for us to display your testimony and photo on our website and promotional materials.</p>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Testimony'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
