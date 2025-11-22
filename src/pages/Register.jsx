import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User, Mail, Phone, Upload, Church, MapPin, Calendar, Globe,
    CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft,
    Check, Edit2, Download, ChevronDown, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { COUNTRIES, getCountryByCode } from '../utils/countries';
import { generateAndSaveBadge, shouldGenerateBadge } from '../utils/badgeGenerator';

// Validation Schema with step-by-step validation
const createStepSchema = (step) => {
    const baseSchemas = {
        1: z.object({
            title: z.enum(['Reverend', 'Pastor', 'Deacon', 'Deaconess', 'Mr', 'Mrs', 'Miss'], {
                required_error: "Please select a title",
            }),
            fullName: z.string().min(3, "Full name must be at least 3 characters"),
            nationality: z.string().min(1, "Please select your nationality"),
            phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
            email: z.string().email("Invalid email address"),
            profilePhoto: z.any().optional(),
        }),
        2: z.object({
            churchMinistry: z.string().optional(),
            churchUnit: z.enum(['PASTOR', 'LOC', 'VOC', 'USHER', 'PROTOCOL', 'HELPDESK', 'MEDIA', 'TECHNICAL', 'CHILDRENS_DEPARTMENT', 'PROTOCOL_SECURITY', 'TRANSPORT_LOGISTICS', 'SANCTUARY'], {
                required_error: "Please select your unit",
            }),
            isMember: z.string().min(1, "Please specify if you are a member"),
            branch: z.string().optional(),
        }),
        3: z.object({
            participationMode: z.enum(['Online', 'Onsite'], {
                required_error: "Please select participation mode",
            }),
            locationType: z.string().optional(),
            needsAccommodation: z.boolean().optional(),
            accommodationType: z.string().optional(),
            arrivalDate: z.string().optional(),
        }),
        4: z.object({
            consentData: z.boolean().refine(val => val === true, "You must consent to data usage"),
            consentUpdates: z.boolean().refine(val => val === true, "You must consent to receive updates"),
        }),
    };

    return baseSchemas[step];
};

const Register = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [profilePreview, setProfilePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [registrationId, setRegistrationId] = useState('');
    const [formData, setFormData] = useState({});

    const { register, handleSubmit, watch, formState: { errors }, setValue, trigger, reset } = useForm({
        resolver: zodResolver(createStepSchema(currentStep)),
        mode: 'onChange',
    });

    const watchedValues = watch();
    const nationality = watch('nationality');
    const isMember = watch('isMember');
    const participationMode = watch('participationMode');
    const locationType = watch('locationType');

    // Auto-save to localStorage
    useEffect(() => {
        const savedData = localStorage.getItem('registrationFormData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setFormData(parsed);
            Object.keys(parsed).forEach(key => setValue(key, parsed[key]));
            if (parsed.profilePhotoPreview) {
                setProfilePreview(parsed.profilePhotoPreview);
            }
        }
    }, []);

    useEffect(() => {
        const dataToSave = { ...formData, ...watchedValues };
        if (profilePreview) {
            dataToSave.profilePhotoPreview = profilePreview;
        }
        localStorage.setItem('registrationFormData', JSON.stringify(dataToSave));
    }, [watchedValues, formData, profilePreview]);

    // Auto-populate phone code when nationality changes
    useEffect(() => {
        if (nationality) {
            const country = getCountryByCode(nationality);
            if (country) {
                const currentPhone = watch('phoneNumber') || '';
                if (!currentPhone.startsWith('+')) {
                    setValue('phoneNumber', country.dialCode + ' ');
                }
            }
        }
    }, [nationality]);

    // EDGE CASE: Clear fields when Participation Mode changes
    useEffect(() => {
        if (participationMode === 'Online') {
            setValue('locationType', null);
            setValue('needsAccommodation', false);
            setValue('accommodationType', null);
            setValue('arrivalDate', null);
        }
    }, [participationMode, setValue]);

    // EDGE CASE: Clear accommodation when Location is Within Zaria
    useEffect(() => {
        if (locationType === 'Within Zaria') {
            setValue('needsAccommodation', false);
            setValue('accommodationType', null);
            setValue('arrivalDate', null);
        }
    }, [locationType, setValue]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setSubmitError('File size must be less than 5MB');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setSubmitError('Only JPEG, PNG, and WebP images are allowed');
                return;
            }
            setSubmitError(''); // Clear error
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setValue('profilePhoto', file);
        }
    };

    const removeProfilePhoto = () => {
        setProfilePreview(null);
        setValue('profilePhoto', null);
    };

    const nextStep = async () => {
        const isValid = await trigger();
        if (isValid) {
            setFormData({ ...formData, ...watchedValues });
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setFormData({ ...formData, ...watchedValues });
        setCurrentStep(currentStep - 1);
        window.scrollTo(0, 0);
    };

    const goToStep = (step) => {
        setFormData({ ...formData, ...watchedValues });
        setCurrentStep(step);
        window.scrollTo(0, 0);
    };

    const onSubmit = async (data) => {
        const fullData = { ...formData, ...data };
        setIsSubmitting(true);
        setSubmitError('');

        try {
            if (isSupabaseConfigured()) {
                let photoUrl = null;
                if (fullData.profilePhoto) {
                    const fileExt = fullData.profilePhoto.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('profile-photos')
                        .upload(fileName, fullData.profilePhoto);
                    if (uploadError) throw uploadError;
                    photoUrl = uploadData.path;
                }

                const { data: insertData, error: insertError } = await supabase
                    .from('registrations')
                    .insert([{
                        title: fullData.title,
                        full_name: fullData.fullName,
                        nationality: fullData.nationality,
                        phone_number: fullData.phoneNumber,
                        email: fullData.email,
                        profile_photo_url: photoUrl,
                        church_ministry: fullData.churchMinistry || null,
                        church_unit: fullData.churchUnit,
                        is_member: fullData.isMember === 'true',
                        branch: fullData.isMember === 'true' ? fullData.branch : null,
                        participation_mode: fullData.participationMode,
                        location_type: fullData.participationMode === 'Onsite' ? fullData.locationType : null,
                        needs_accommodation: fullData.needsAccommodation || false,
                        accommodation_type: fullData.accommodationType || null,
                        arrival_date: fullData.arrivalDate || null,
                        departure_date: fullData.departureDate || null,
                    }])
                    .select();

                if (insertError) throw insertError;
                setRegistrationId(insertData[0]?.id || 'PENDING');

                // Auto-generate badge for onsite attendees
                if (fullData.participationMode === 'Onsite' && insertData[0]) {
                    try {
                        await generateAndSaveBadge(insertData[0]);
                        console.log('Badge generated successfully for onsite attendee');
                    } catch (badgeError) {
                        console.error('Badge generation failed:', badgeError);
                        // Don't fail registration if badge generation fails
                    }
                }
            } else {
                console.log('Registration Data:', fullData);
                await new Promise(resolve => setTimeout(resolve, 2000));
                setRegistrationId('REG-' + Math.random().toString(36).substr(2, 9).toUpperCase());
            }

            setSubmitSuccess(true);
            localStorage.removeItem('registrationFormData');

            // Auto redirect after 5 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 5000);
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitError(error.message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const progressPercentage = (currentStep / 4) * 100;

    const steps = [
        { number: 1, name: 'Personal Info' },
        { number: 2, name: 'Church Details' },
        { number: 3, name: 'Participation' },
        { number: 4, name: 'Review & Submit' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden bg-[#0f172a]">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse delay-2000" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            Register for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">GREAT DAYS 2025</span>
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                            Join us for a transformative week of faith, worship, and fellowship. Secure your spot today.
                        </p>
                    </motion.div>
                </div>

                {!isSupabaseConfigured() && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-yellow-200 text-sm">
                            <p className="font-semibold mb-1">Development Mode</p>
                            <p>Supabase is not configured. Registration data will be logged to console.</p>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep >= step.number
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                                        : 'bg-white/5 text-slate-400 border border-white/10'
                                        }`}>
                                        {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                                    </div>
                                    <span className="text-xs text-slate-400 mt-2 hidden md:block">{step.name}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="flex-1 h-1 mx-2 bg-slate-700 relative overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                            style={{ width: currentStep > step.number ? '100%' : '0%' }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center text-slate-400 text-sm">
                        Step {currentStep} of 4 ({Math.round(progressPercentage)}% complete)
                    </div>
                </div>

                {/* Form Steps */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <form
                            onSubmit={currentStep === 4 ? handleSubmit(onSubmit) : (e) => e.preventDefault()}
                            className="p-6 sm:p-8 md:p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl space-y-8 relative overflow-hidden"
                        >
                            {/* Decorative top border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
                            {/* STEP 1: Personal Information */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Title <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            {...register('title')}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        >
                                            <option value="">Select Title</option>
                                            <option value="Reverend">Reverend</option>
                                            <option value="Pastor">Pastor</option>
                                            <option value="Deacon">Deacon</option>
                                            <option value="Deaconess">Deaconess</option>
                                            <option value="Mr">Mr</option>
                                            <option value="Mrs">Mrs</option>
                                            <option value="Miss">Miss</option>
                                        </select>
                                        {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Full Name <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register('fullName')}
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            />
                                        </div>
                                        {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Nationality <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                                            <select
                                                {...register('nationality')}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 appearance-none transition-all"
                                            >
                                                <option value="">Select Country</option>
                                                {COUNTRIES.map((country) => (
                                                    <option key={country.code} value={country.code}>
                                                        {country.flag} {country.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                        </div>
                                        {errors.nationality && <p className="text-red-400 text-sm mt-1">{errors.nationality.message}</p>}
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Phone Number <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register('phoneNumber')}
                                                type="tel"
                                                placeholder="+234 XXX XXX XXXX"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            />
                                        </div>
                                        {errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber.message}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Email Address <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register('email')}
                                                type="email"
                                                placeholder="your.email@example.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                                    </div>

                                    {/* Profile Photo */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Profile Photo <span className="text-slate-400 text-sm font-normal">(Optional)</span>
                                        </label>

                                        {submitError && submitError.includes('File') && (
                                            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                                <AlertCircle className="w-4 h-4" />
                                                {submitError}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            {profilePreview ? (
                                                <div className="relative group">
                                                    <img
                                                        src={profilePreview}
                                                        alt="Profile Preview"
                                                        className="w-24 h-24 rounded-xl object-cover border-2 border-blue-500 shadow-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeProfilePhoto}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex-1 cursor-pointer group">
                                                    <div className="flex flex-col items-center justify-center gap-2 bg-slate-700/30 border-2 border-slate-600 border-dashed rounded-xl px-4 py-8 hover:border-blue-500 hover:bg-slate-700/50 transition-all">
                                                        <div className="p-3 bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                                                            <Upload className="w-6 h-6 text-blue-400" />
                                                        </div>
                                                        <div className="text-center">
                                                            <span className="text-slate-300 font-medium block">Click to upload photo</span>
                                                            <span className="text-slate-500 text-xs">JPEG, PNG, WebP (Max 5MB)</span>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Church Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    {/* Are you a member */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Are you a member of FDIM? <span className="text-red-400">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${isMember === 'true' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                <input
                                                    {...register('isMember')}
                                                    type="radio"
                                                    value="true"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <p className="text-white font-semibold">Yes</p>
                                                    <p className="text-slate-400 text-sm">I'm a member</p>
                                                </div>
                                            </label>
                                            <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${isMember === 'false' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                <input
                                                    {...register('isMember')}
                                                    type="radio"
                                                    value="false"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <p className="text-white font-semibold">No</p>
                                                    <p className="text-slate-400 text-sm">Guest/Visitor</p>
                                                </div>
                                            </label>
                                        </div>
                                        {errors.isMember && <p className="text-red-400 text-sm mt-1">{errors.isMember.message}</p>}
                                    </div>

                                    {/* Branch (conditional) */}
                                    {isMember === 'true' && (
                                        <div>
                                            <label className="block text-white font-semibold mb-2">
                                                Branch <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                                                <select
                                                    {...register('branch')}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 appearance-none transition-all"
                                                >
                                                    <option value="">Select Branch</option>
                                                    <option value="FDIM-HEADQUARTERS (ZARIA)">FDIM-HEADQUARTERS (ZARIA)</option>
                                                    <option value="FDIM-LAGOS">FDIM-LAGOS</option>
                                                    <option value="FDIM-ABUJA">FDIM-ABUJA</option>
                                                    <option value="FDIM-ENUGU">FDIM-ENUGU</option>
                                                    <option value="FDIM-TARABA">FDIM-TARABA</option>
                                                    <option value="FDIM-JALINGO">FDIM-JALINGO</option>
                                                    <option value="FDIM-KADUNA">FDIM-KADUNA</option>
                                                    <option value="FDIM-KANO">FDIM-KANO</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                            </div>
                                            {errors.branch && <p className="text-red-400 text-sm mt-1">{errors.branch.message}</p>}
                                        </div>
                                    )}

                                    {/* Church/Ministry (conditional - only for non-members) */}
                                    {isMember === 'false' && (
                                        <div>
                                            <label className="block text-white font-semibold mb-2">
                                                Church/Ministry Name <span className="text-slate-400 text-sm font-normal">(Optional)</span>
                                            </label>
                                            <div className="relative">
                                                <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    {...register('churchMinistry')}
                                                    type="text"
                                                    placeholder="Enter your church or ministry name"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Church Unit */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Church Unit/Department <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            {...register('churchUnit')}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        >
                                            <option value="">Select Unit</option>
                                            <option value="PASTOR">Pastor</option>
                                            <option value="LOC">LOC (Leaders of Cells)</option>
                                            <option value="VOC">VOC (Vessels of Christ)</option>
                                            <option value="USHER">Usher</option>
                                            <option value="PROTOCOL">Protocol</option>
                                            <option value="HELPDESK">Helpdesk</option>
                                            <option value="MEDIA">Media</option>
                                            <option value="TECHNICAL">Technical</option>
                                            <option value="CHILDRENS_DEPARTMENT">Children's Department</option>
                                            <option value="PROTOCOL_SECURITY">Protocol & Security</option>
                                            <option value="TRANSPORT_LOGISTICS">Transport & Logistics</option>
                                            <option value="SANCTUARY">Sanctuary</option>
                                        </select>
                                        {errors.churchUnit && <p className="text-red-400 text-sm mt-1">{errors.churchUnit.message}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Participation & Accommodation */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    {/* Participation Mode */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Participation Mode <span className="text-red-400">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className={`cursor-pointer p-6 rounded-xl border transition-all duration-300 relative overflow-hidden group ${participationMode === 'Online' ? 'border-blue-500 bg-blue-600/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                                <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 transition-opacity duration-300 ${participationMode === 'Online' ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                                                <input
                                                    {...register('participationMode')}
                                                    type="radio"
                                                    value="Online"
                                                    className="hidden"
                                                />
                                                <div className="relative z-10 text-center">
                                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                                                        <Globe className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                    <p className="text-white font-bold text-lg">Online</p>
                                                    <p className="text-slate-400 text-sm mt-1">Join virtually</p>
                                                </div>
                                            </label>
                                            <label className={`cursor-pointer p-6 rounded-xl border transition-all duration-300 relative overflow-hidden group ${participationMode === 'Onsite' ? 'border-blue-500 bg-blue-600/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                                <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 transition-opacity duration-300 ${participationMode === 'Onsite' ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                                                <input
                                                    {...register('participationMode')}
                                                    type="radio"
                                                    value="Onsite"
                                                    className="hidden"
                                                />
                                                <div className="relative z-10 text-center">
                                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                                                        <MapPin className="w-6 h-6 text-green-400" />
                                                    </div>
                                                    <p className="text-white font-bold text-lg">Onsite</p>
                                                    <p className="text-slate-400 text-sm mt-1">Attend in person</p>
                                                </div>
                                            </label>
                                        </div>
                                        {errors.participationMode && <p className="text-red-400 text-sm mt-1">{errors.participationMode.message}</p>}
                                    </div>

                                    {/* Location Type (for onsite only) */}
                                    {participationMode === 'Onsite' && (
                                        <div>
                                            <label className="block text-white font-semibold mb-2">
                                                Location <span className="text-red-400">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${locationType === 'Within Zaria' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                    <input
                                                        {...register('locationType')}
                                                        type="radio"
                                                        value="Within Zaria"
                                                        className="hidden"
                                                    />
                                                    <div className="text-center">
                                                        <p className="text-white font-semibold">Within Zaria</p>
                                                        <p className="text-slate-400 text-sm">Resident in Zaria</p>
                                                    </div>
                                                </label>
                                                <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${locationType === 'Outside Zaria' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                    <input
                                                        {...register('locationType')}
                                                        type="radio"
                                                        value="Outside Zaria"
                                                        className="hidden"
                                                    />
                                                    <div className="text-center">
                                                        <p className="text-white font-semibold">Outside Zaria</p>
                                                        <p className="text-slate-400 text-sm">Visiting from outside</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Accommodation (for onsite only) */}
                                    {participationMode === 'Onsite' && (
                                        <>
                                            <div>
                                                <label className="block text-white font-semibold mb-2">
                                                    Do you need accommodation?
                                                </label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${watch('needsAccommodation') === true ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                        <input
                                                            {...register('needsAccommodation')}
                                                            type="checkbox"
                                                            className="hidden"
                                                            onChange={(e) => setValue('needsAccommodation', e.target.checked)}
                                                        />
                                                        <div className="text-center">
                                                            <p className="text-white font-semibold">Yes</p>
                                                            <p className="text-slate-400 text-sm">I need housing</p>
                                                        </div>
                                                    </label>
                                                    <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${watch('needsAccommodation') === false ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                        <input
                                                            type="radio"
                                                            name="accommodation-radio"
                                                            className="hidden"
                                                            onChange={() => setValue('needsAccommodation', false)}
                                                        />
                                                        <div className="text-center">
                                                            <p className="text-white font-semibold">No</p>
                                                            <p className="text-slate-400 text-sm">I'll arrange myself</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {watch('needsAccommodation') && (
                                                <>
                                                    <div>
                                                        <label className="block text-white font-semibold mb-2">
                                                            Accommodation Type
                                                        </label>
                                                        <select
                                                            {...register('accommodationType')}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                                        >
                                                            <option value="">Select Type</option>
                                                            <option value="General">General (Camp/Shared)</option>
                                                            <option value="Hotel">Hotel (Private)</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-white font-semibold mb-2">
                                                            Expected Arrival Date <span className="text-red-400">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                            <input
                                                                {...register('arrivalDate')}
                                                                type="date"
                                                                min="2025-01-24"
                                                                max="2025-01-31"
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-white font-semibold mb-2">
                                                            Expected Departure Date
                                                        </label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                            <input
                                                                {...register('departureDate')}
                                                                type="date"
                                                                min="2025-01-24"
                                                                max="2025-02-02"
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* STEP 4: Review & Submit */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-white mb-4">Review Your Registration</h2>

                                    <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-slate-400 text-sm">Title & Name</p>
                                                <p className="text-white font-semibold">{formData.title} {formData.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-sm">Email</p>
                                                <p className="text-white font-semibold">{formData.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-sm">Phone</p>
                                                <p className="text-white font-semibold">{formData.phoneNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-sm">Nationality</p>
                                                <p className="text-white font-semibold">{getCountryByCode(formData.nationality)?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-sm">Member Status</p>
                                                <p className="text-white font-semibold">{formData.isMember === 'true' ? 'FDIM Member' : 'Guest/Visitor'}</p>
                                            </div>
                                            {formData.isMember === 'true' && (
                                                <div>
                                                    <p className="text-slate-400 text-sm">Branch</p>
                                                    <p className="text-white font-semibold">{formData.branch}</p>
                                                </div>
                                            )}
                                            {formData.isMember === 'false' && formData.churchMinistry && (
                                                <div className="col-span-2">
                                                    <p className="text-slate-400 text-sm">Church/Ministry</p>
                                                    <p className="text-white font-semibold">{formData.churchMinistry}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-slate-400 text-sm">Church Unit</p>
                                                <p className="text-white font-semibold">{formData.churchUnit}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-sm">Participation Mode</p>
                                                <p className="text-white font-semibold">{formData.participationMode}</p>
                                            </div>
                                            {formData.participationMode === 'Onsite' && (
                                                <>
                                                    <div>
                                                        <p className="text-slate-400 text-sm">Location Type</p>
                                                        <p className="text-white font-semibold">{formData.locationType}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400 text-sm">Accommodation</p>
                                                        <p className="text-white font-semibold">{formData.needsAccommodation ? `Yes - ${formData.accommodationType}` : 'Not Required'}</p>
                                                    </div>
                                                    {formData.arrivalDate && (
                                                        <div>
                                                            <p className="text-slate-400 text-sm">Arrival Date</p>
                                                            <p className="text-white font-semibold">{formData.arrivalDate}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Edit buttons */}
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => goToStep(1)}
                                            className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Personal Info
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => goToStep(2)}
                                            className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Church Details
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => goToStep(3)}
                                            className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Participation
                                        </button>
                                    </div>

                                    {/* Consent Checkboxes */}
                                    <div className="space-y-3 border-t border-slate-600 pt-6">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                {...register('consentData')}
                                                type="checkbox"
                                                className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-300 text-sm">
                                                I consent to the collection and use of my personal data for event registration and communication purposes.
                                            </span>
                                        </label>
                                        {errors.consentData && <p className="text-red-400 text-sm ml-7">{errors.consentData.message}</p>}

                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                {...register('consentUpdates')}
                                                type="checkbox"
                                                className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-300 text-sm">
                                                I consent to receive updates and information about GREAT DAYS and future FDIM events.
                                            </span>
                                        </label>
                                        {errors.consentUpdates && <p className="text-red-400 text-sm ml-7">{errors.consentUpdates.message}</p>}
                                    </div>

                                    {submitError && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-red-200 text-sm">{submitError}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-6 border-t border-white/10">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-6 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2 font-medium"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={currentStep === 4 ? handleSubmit(onSubmit) : nextStep}
                                    disabled={isSubmitting}
                                    className={`ml-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {currentStep === 4 ? 'Complete Registration' : 'Next Step'}
                                            {currentStep !== 4 && <ArrowRight className="w-5 h-5" />}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div >
                </AnimatePresence >

                {/* Success Modal */}
                {
                    submitSuccess && (
                        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10 text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                                    <p className="text-slate-300 mb-4">
                                        Your registration for GREAT DAYS 2025 has been confirmed.
                                    </p>
                                    <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                                        <p className="text-slate-400 text-sm mb-1">Your Registration ID:</p>
                                        <p className="text-white font-mono text-lg font-bold">{registrationId}</p>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Redirecting to home page in 5 seconds...
                                    </p>
                                    <Link
                                        to="/"
                                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-lg transition-all"
                                    >
                                        Return Home Now
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default Register;
