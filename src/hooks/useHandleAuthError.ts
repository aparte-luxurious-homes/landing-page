import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

export const useHandleAuthError = (error: any) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const isAuthError =
            error?.status === 401 ||
            (error?.status === 400 && error?.data?.message === "Expired token");

        if (isAuthError) {
            toast.error("Session expired. Please log in again.");
            navigate(`/login?redirect=${location.pathname}`);
        }
    }, [error, navigate, location]);
};
