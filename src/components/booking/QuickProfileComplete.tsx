import React, { useState } from 'react';
import { useUpdateProfileMutation } from '../../api/profileApi';
import { toast } from 'react-toastify';
import FormInput from '../inputs/FormInput';
import { extractErrorMessage } from '../../utils/errorHandler';

interface QuickProfileCompleteProps {
    onComplete: () => void;
    initialData: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        dob?: string;
    };
}

const QuickProfileComplete: React.FC<QuickProfileCompleteProps> = ({ onComplete, initialData }) => {
    const [formData, setFormData] = useState({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phone: initialData.phone || '',
        dob: initialData.dob || '',
    });

    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.dob) {
            toast.error("All fields are required");
            return;
        }

        // Age Validation
        const birthDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            toast.error("You must be at least 18 years old to make a booking.");
            return;
        }

        try {
            const data = new FormData();
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('phone', formData.phone);
            data.append('dob', formData.dob);

            await updateProfile(data).unwrap();
            toast.success("Profile updated!");
            onComplete();
        } catch (err: any) {
            console.error("Profile update failed", err);
            const errorMessage = extractErrorMessage(err, "Failed to update profile");
            toast.error(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-2">Complete your Profile</h2>
                <p className="mb-6 text-gray-600 text-sm">Please provide missing details to continue your booking seamlessly.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <FormInput name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
                        </div>
                        <div className="w-1/2">
                            <FormInput name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
                        </div>
                    </div>
                    <div>
                        <FormInput name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                        <p className="text-xs text-gray-500 mt-1 ml-1">
                            Input correct details as they'd be used to verify your identity.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Date of Birth</label>
                        <FormInput name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder="Date of Birth" />
                        <p className="text-xs text-gray-500 mt-1 ml-1">
                            Input correct details as they'd be used to verify your identity.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#028090] text-white py-3 rounded-md hover:bg-[#026f7d] transition-colors font-medium mt-2"
                    >
                        {isLoading ? 'Updating...' : 'Continue Booking'}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                        By clicking "Continue Booking", you confirm that you are at least 18 years old.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default QuickProfileComplete;
