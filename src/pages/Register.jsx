import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User, Mail, Phone, Upload, Church, MapPin, Calendar,
    CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft,
    Check, Edit2, Download, ChevronDown
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                alert('Only JPEG, PNG, and WebP images are allowed');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setValue('profilePhoto', file);
        }
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
                    }])
                    .select();

                if (insertError) throw insertError;
                setRegistrationId(insertData[0]?.id || 'PENDING');

                // Auto-generate badge for onsite attendees
                if (fullData.participationMode === 'Onsite' && insertData[0]) {
                    try {
                        const registrationData = {
                            ...insertData[0],
                            mode: 'onsite',
                            location: fullData.locationType === 'Outside Zaria' ? 'outside_zaria' : 'within_zaria',
                            unit: fullData.churchUnit,
                            branch: fullData.branch,
                            is_member: fullData.isMember === 'true',
                            arrival_date: fullData.arrivalDate,
                            departure_date: null, // Will be set later by admin if needed
                            profile_photo: photoUrl
                        };

                        await generateAndSaveBadge(registrationData);
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
        <div className="min-h-screen pt-24 pb-16 px-4 bg-slate-900">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                        Register for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">GREAT DAYS 2025</span>
                    </h1>
                    <p className="text-slate-300 text-lg">Join us for a transformative week of faith, worship, and fellowship</p>
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
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                                    </div>
                                    <span className="text-xs text-slate-400 mt-2 hidden md:block">{step.name}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="flex-1 h-1 mx-2 bg-slate-700 relative overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-blue-600 transition-all duration-300"
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
                            className="p-4 sm:p-6 md:p-8 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl space-y-6"
                        >
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
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>}
                                    </div>

                                    {/* Nationality */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Nationality <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                                            <select
                                                {...register('nationality')}
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                                    </div>

                                    {/* Profile Photo */}
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Profile Photo <span className="text-slate-400 text-sm font-normal">(Optional)</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            {profilePreview && (
                                                <img
                                                    src={profilePreview}
                                                    alt="Profile Preview"
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                                                />
                                            )}
                                            <label className="flex-1 cursor-pointer">
                                                <div className="flex items-center justify-center gap-2 bg-slate-700/50 border border-slate-600 border-dashed rounded-lg px-4 py-6 hover:border-blue-500 transition-colors">
                                                    <Upload className="w-5 h-5 text-slate-400" />
                                                    <span className="text-slate-300">
                                                        {profilePreview ? 'Change Photo' : 'Upload Photo'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-slate-400 text-xs mt-2">Max size: 5MB. Formats: JPEG, PNG, WebP</p>
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
                                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                                >
                                                    <option value="">Select Branch</option>
                                                    <option value="Zaria (Headquarters)">Zaria (Headquarters)</option>
                                                    <option value="Kaduna">Kaduna</option>
                                                    <option value="Abuja">Abuja</option>
                                                    <option value="Lagos">Lagos</option>
                                                    <option value="Kano">Kano</option>
                                                    <option value="Jalingo">Jalingo</option>
                                                    <option value="Wukari">Wukari</option>
                                                    <option value="Zing">Zing</option>
                                                    <option value="Enugu">Enugu</option>
                                                    <option value="Gombe">Gombe</option>
                                                    <option value="Yola">Yola</option>
                                                    <option value="Yobe">Yobe</option>
                                                    <option value="United Kingdom">United Kingdom</option>
                                                    <option value="Other">Other</option>
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
                                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            <label className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${participationMode === 'Online' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                <input
                                                    {...register('participationMode')}
                                                    type="radio"
                                                    value="Online"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <p className="text-white font-bold text-lg">Online</p>
                                                    <p className="text-slate-400 text-sm mt-1">Join virtually</p>
                                                </div>
                                            </label>
                                            <label className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${participationMode === 'Onsite' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                <input
                                                    {...register('participationMode')}
                                                    type="radio"
                                                    value="Onsite"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
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
                                                <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${locationType === 'Local' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                    <input
                                                        {...register('locationType')}
                                                        type="radio"
                                                        value="Local"
                                                        className="hidden"
                                                    />
                                                    <div className="text-center">
                                                        <p className="text-white font-semibold">Local</p>
                                                        <p className="text-slate-400 text-sm">Within Nigeria</p>
                                                    </div>
                                                </label>
                                                <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${locationType === 'International' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30'}`}>
                                                    <input
                                                        {...register('locationType')}
                                                        type="radio"
                                                        value="International"
                                                        className="hidden"
                                                    />
                                                    <div className="text-center">
                                                        <p className="text-white font-semibold">International</p>
                                                        <p className="text-slate-400 text-sm">Outside Nigeria</p>
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
                                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select Type</option>
                                                            <option value="Single Room">Single Room</option>
                                                            <option value="Shared Room">Shared Room</option>
                                                            <option value="Family Room">Family Room</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-white font-semibold mb-2">
                                                            Expected Arrival Date
                                                        </label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                            <input
                                                                {...register('arrivalDate')}
                                                                type="date"
                                                                min="2025-01-24"
                                                                max="2025-01-31"
                                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <div className="flex gap-4 pt-4 border-t border-slate-600">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back
                                    </button>
                                )}
                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        Next
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Submit Registration
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </AnimatePresence>

                {/* Success Modal */}
                {submitSuccess && (
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
                )}
            </div>
        </div>
    );
};

export default Register;
