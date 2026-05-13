import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    useGetProfileQuery,
    usePatchProfileMutation,
} from '../api/profileApi';
import FormInput from '../components/inputs/FormInput';

type FieldKey = 'first_name' | 'last_name' | 'phone' | 'dob' | 'gender';

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'] as const;

const CompleteProfile: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const next = searchParams.get('next') || '/';

    const { data: profileResp, isLoading: isLoadingProfile, refetch } = useGetProfileQuery();
    const [patchProfile, { isLoading: isSaving }] = usePatchProfileMutation();

    const profile = profileResp?.data;

    const missing: FieldKey[] = useMemo(() => {
        const serverList =
            profile?.missingProfileFields ??
            profile?.missing_profile_fields ??
            [];
        return serverList.filter((f): f is FieldKey =>
            ['first_name', 'last_name', 'phone', 'dob', 'gender'].includes(f),
        );
    }, [profile]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        dob: '',
        gender: '',
    });

    // If the profile is already complete, route the user out immediately.
    useEffect(() => {
        if (!profile) return;
        const complete = profile.isProfileComplete ?? profile.is_profile_complete;
        if (complete) navigate(next, { replace: true });
    }, [profile, next, navigate]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate each missing field
        for (const field of missing) {
            if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
                const human: Record<FieldKey, string> = {
                    first_name: 'First name',
                    last_name: 'Last name',
                    phone: 'Phone number',
                    dob: 'Date of birth',
                    gender: 'Gender',
                };
                toast.error(`${human[field]} is required`);
                return;
            }
        }

        try {
            const payload: Record<string, string> = {};
            for (const field of missing) {
                payload[field] =
                    field === 'phone' ? formData.phone.trim() : formData[field];
            }
            await patchProfile(payload).unwrap();
            toast.success('Profile updated.');
            await refetch();
            navigate(next, { replace: true });
        } catch (err: unknown) {
            const errObj = err as { data?: { detail?: string; message?: string } };
            const msg =
                errObj?.data?.detail || errObj?.data?.message || 'Failed to update profile';
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <p className="text-zinc-600">Loading…</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                <p className="text-zinc-600">Please log in to continue.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
            <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl text-zinc-900">
                <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
                <p className="mb-6 text-zinc-600 text-sm">
                    A few more details are needed before you can continue. This information helps
                    us keep your account secure and personalise your bookings.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {missing.includes('first_name') && (
                        <FormInput
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                        />
                    )}
                    {missing.includes('last_name') && (
                        <FormInput
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                        />
                    )}
                    {missing.includes('phone') && (
                        <FormInput
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+234 801 234 5678"
                        />
                    )}
                    {missing.includes('dob') && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent"
                            />
                        </div>
                    )}
                    {missing.includes('gender') && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent bg-white"
                            >
                                <option value="">Select…</option>
                                {GENDER_OPTIONS.map((g) => (
                                    <option key={g} value={g}>
                                        {g.charAt(0) + g.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#028090] text-white py-3 rounded-md hover:bg-[#026f7d] transition-colors font-medium disabled:bg-zinc-300 mt-2"
                    >
                        {isSaving ? 'Saving…' : 'Save & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
