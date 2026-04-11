import React, { useState } from 'react';
import { useUpdateProfileMutation } from '../../../api/profileApi';
import FormContainer from '../../../components/forms/FormContainer';
import FormInput from '../../../components/inputs/FormInput';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { extractErrorMessage } from '../../../utils/errorHandler';

interface GuestProfileFormProps {
    onSuccess?: () => void;
}

const GuestProfileForm: React.FC<GuestProfileFormProps> = ({ onSuccess }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [updateProfile] = useUpdateProfileMutation();
    const navigate = useNavigate();

    const calculateAge = (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!firstName || !lastName || !phone || !dob) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        const age = calculateAge(dob);
        if (age < 18) {
            setError('You must be at least 18 years old to complete your profile.');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('phone', phone);
            formData.append('dob', dob);

            await updateProfile(formData).unwrap();
            toast.success('Profile updated successfully! Welcome to Aparte.');

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setLoading(false);
            const errorMessage = extractErrorMessage(err, 'Failed to update profile. Please try again.');
            setError(errorMessage);
        }
    };

    return (
        <FormContainer
            title="Complete Your Profile"
            onSubmit={handleSubmit}
            error={error}
            loading={loading}
            submitText="Complete Onboarding"
        >
            <div className="space-y-4">
                <Typography variant="body2" className="text-gray-600 mb-4 text-center">
                    Just a few more details to get you started
                </Typography>

                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        required
                    />
                    <FormInput
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        required
                    />
                </div>

                <FormInput
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number (e.g. 08012345678)"
                    type="tel"
                    required
                />

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 px-4">Date of Birth</label>
                    <FormInput
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        type="date"
                        required
                    />
                </div>

                <p className="text-[10px] text-gray-500 px-4 text-center my-2">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </FormContainer>
    );
};

// Helper component for label-less styling
const Typography = ({ children, variant: _variant, className }: any) => (
    <p className={className}>{children}</p>
);

export default GuestProfileForm;
