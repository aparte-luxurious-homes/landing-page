import React, { useState } from 'react';
import { usePatchProfileMutation, useGetProfileQuery } from '../../api/profileApi';
import { toast } from 'react-toastify';
import FormInput from '../inputs/FormInput';

interface QuickProfileCompleteProps {
    onComplete: () => void;
    onClose?: () => void;
    initialData?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        dob?: string;
    };
}

const QuickProfileComplete: React.FC<QuickProfileCompleteProps> = ({ onComplete, onClose, initialData }) => {
    const [patchProfile, { isLoading: isSaving }] = usePatchProfileMutation();
    const { refetch: refetchProfile } = useGetProfileQuery();

    // Only show fields that are missing
    const missingFirstName = !initialData?.firstName;
    const missingLastName = !initialData?.lastName;
    const missingPhone = !initialData?.phone;
    const missingDob = !initialData?.dob;

    const [formData, setFormData] = useState({
        first_name: initialData?.firstName || '',
        last_name: initialData?.lastName || '',
        phone: initialData?.phone || '',
        dob: initialData?.dob || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate only the missing fields
        if (missingFirstName && !formData.first_name.trim()) {
            toast.error('First name is required');
            return;
        }
        if (missingLastName && !formData.last_name.trim()) {
            toast.error('Last name is required');
            return;
        }
        if (missingPhone && !formData.phone.trim()) {
            toast.error('Phone number is required');
            return;
        }
        if (missingDob && !formData.dob) {
            toast.error('Date of birth is required');
            return;
        }

        try {
            // Only send the fields that were missing
            const payload: Record<string, string> = {};
            if (missingFirstName) payload.first_name = formData.first_name.trim();
            if (missingLastName) payload.last_name = formData.last_name.trim();
            if (missingPhone) payload.phone = formData.phone.trim();
            if (missingDob) payload.dob = formData.dob;

            await patchProfile(payload).unwrap();
            toast.success('Profile updated!');
            await refetchProfile();
            onComplete();
        } catch (err: any) {
            const msg = err?.data?.detail || err?.data?.message || 'Failed to update profile';
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    const missingFields = [missingFirstName, missingLastName, missingPhone, missingDob].filter(Boolean).length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl text-zinc-900">
                <h2 className="text-xl font-bold mb-2">Complete Your Profile</h2>
                <p className="mb-6 text-zinc-600 text-sm">
                    Please fill in the missing {missingFields === 1 ? 'field' : 'fields'} below to continue.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {missingFirstName && (
                        <FormInput
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                        />
                    )}
                    {missingLastName && (
                        <FormInput
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                        />
                    )}
                    {missingPhone && (
                        <FormInput
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+234 801 234 5678"
                        />
                    )}
                    {missingDob && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent"
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-md border border-zinc-300 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 bg-[#028090] text-white py-3 rounded-md hover:bg-[#026f7d] transition-colors font-medium disabled:bg-zinc-300"
                        >
                            {isSaving ? 'Saving...' : 'Save & Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickProfileComplete;
