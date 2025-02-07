import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const useHandleAuthError = (error: any) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (error?.status === 401) {
            toast.error("Unauthorized access. Please log in.");

            setTimeout(() => {
                navigate("/login");
            }, 3000);
        }
    }, [error, navigate]);
};
