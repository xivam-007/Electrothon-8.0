import apiClient from "../utils/axiosUtils";

export const connectToBackendServices = {

    checkPhone: async (phoneNumber: string) => {
        try {
            const response = await apiClient.post("/auth/check-phone", {
                phone: `+91${phoneNumber}`,
            });
            return response.data as { success: boolean; exists: boolean };
        } catch (error) {
            console.error('Error checking phone:', error);
            throw error;
        }
    },

    otpRequest: async ({ flow, phoneNumber }: { flow: string; phoneNumber: string }) => {
        try {
            const response = await apiClient.post("/auth/request-otp", {
                phone: `+91${phoneNumber}`,
                flow,
            });
            return response.data;
        } catch (error) {
            console.error('Error OTP Request:', error);
            throw error;
        }
    },

    verifyOTPLogin: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
        try {
            const response = await apiClient.post("/auth/verify-otp-login", {
                phone: `+91${phoneNumber}`,
                otp,
            });
            return response.data;
        } catch (error) {
            console.error('Error Verifying the OTP for LOGIN:', error);
            throw error;
        }
    },

    verifyOTPSignup: async ({ name, phoneNumber, otp }: { name: string; phoneNumber: string; otp: string }) => {
        try {
            const response = await apiClient.post("/auth/verify-otp-signup", {
                name: name.trim(),
                phone: `+91${phoneNumber}`,
                otp,
            });
            return response.data;
        } catch (error) {
            console.error('Error verifying the OTP for SignUp:', error);
            throw error;
        }
    },

    getUserDetails: async () => {
        try {
            const response = await apiClient.get("/auth/me");
            return response.data;
        } catch (error) {
            console.error('Error getting the userDetails:', error);
            throw error;
        }
    },

    updateUserProfile: async ({ name, imageUrl }: { name: string; imageUrl: string }) => {
        try {
            const response = await apiClient.put("/auth/update-profile", {
                name,
                imageUrl,
            });
            console.log('Profile update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error Updating the profile:', error);
            throw error;
        }
    },

    getUserOrders: async () => {
        try {
            const response = await apiClient.get("/moves/orders");
            return response.data;
        } catch (error) {
            console.error('Error getting the all orders:', error);
            throw error;
        }
    },

    getUserOrderById: async (orderId: string) => {
        try {
            const response = await apiClient.get(`/moves/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error while fetching the order detail:', error);
            throw error;
        }
    },

    createOrder: async (orderData: {
        vehicleId: string; weight: string; pickupLocation: string; dropoffLocation: string; pickupDate: string; pickupTime: string;
    }) => {
        try {
            const response = await apiClient.post("/moves/request", orderData);
            return response.data;
        } catch (error) {
            console.error('Error while creating the new order:', error);
            throw error;
        }
    },

    getPdfDetails: async (orderId: string) => {
        try {
            const response = await apiClient.get(`/moves/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error while fetchind pdf details', error);
            throw error;
        }
    },
    getProcessPayment: async (moveId: string) => {
        try {
            const response = await apiClient.post("/payment/create-intent", { moveId });
            return response.data;
        } catch (error) {
            console.error('Error while processing the payment', error);
            throw error;
        }
    },

    getStatusOfPayment: async (paymentStatus: string) => {
        try {
            const response = await apiClient.post("/payment/confirm", { paymentStatus });
            return response.data;
        } catch (error) {
            console.error('Error while confirming the payment', error);
            throw error;
        }
    },

    getConfirmPayment: async (paymentIntentId: string) => {
        try {
            const response = await apiClient.post("/payment/confirm", { paymentIntentId });
            return response.data;
        } catch (error) {
            console.error('Error while confirming the payment', error);
            throw error;
        }
    },



};



