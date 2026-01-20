
import emailjs from '@emailjs/browser';
import { toast } from "sonner";

export const sendExpenseNotification = async (
    toEmail: string,
    toName: string,
    fromName: string,
    expenseDescription: string,
    amount: number,
    splitAmount: number
) => {
    try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            console.error("EmailJS credentials MISSING in .env:", { serviceId, templateId, publicKey });
            toast.error("Email Configuration Missing");
            return;
        }

        const templateParams = {
            to_email: toEmail,
            to_name: toName,
            from_name: fromName,
            expense_description: expenseDescription,
            amount: amount, // Total expense amount
            split_amount: splitAmount, // The user's share
            message: `You've been added to a new expense: ${expenseDescription}. Your share is ₹${splitAmount}.`,
        };

        // Initialize implicitly handles it, but passing publicKey to send calls is the recommended modern way
        const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

        if (response.status === 200) {
            console.log(`Email sent successfully to ${toEmail}`);
            // Optional: Don't spam toasts if sending to many people, but for now we keep it
            // toast.success(`Notification sent to ${toName}`);
        } else {
            console.error("EmailJS Response Error:", response);
            toast.error(`Failed to send email to ${toName}`);
        }

    } catch (error) {
        console.error('Failed to send email:', error);

        // Using toast.error might be too noisy if called in a loop, rely on console for bulk operations
    }
};

export const sendWelcomeEmail = async (toEmail: string, toName: string) => {
    try {
        const serviceId = import.meta.env.VITE_EMAILJS_WELCOME_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            console.error("EmailJS credentials MISSING for WELCOME EMAIL:", { serviceId, templateId, publicKey });
            return; // Silent fail to not disrupt auth flow
        }

        const templateParams = {
            to_email: toEmail,
            to_name: toName || "Friend", // Fallback
        };

        const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

        if (response.status === 200) {
            console.log(`Welcome Email sent to ${toEmail}`);
            // toast.success("Welcome email sent!"); // Optional
        } else {
            console.error("Welcome Email Failed:", response);
        }

    } catch (error) {
        console.error('Failed to send welcome email:', error);
    }
};

export const sendSettlementNotification = async (
    toEmail: string,
    toName: string,
    fromName: string,
    amount: number,
    paymentMethod: 'cash' | 'online',
    date: Date,
    notes?: string
) => {
    try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_SETTLEMENT_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            console.error("EmailJS credentials MISSING for SETTLEMENT EMAIL:", { serviceId, templateId, publicKey });
            return; // Silent fail to not disrupt settlement flow
        }

        const templateParams = {
            to_email: toEmail,
            to_name: toName || "Friend",
            from_name: fromName,
            amount: `₹${amount.toFixed(2)}`,
            payment_method: paymentMethod === 'cash' ? 'Cash' : 'Online Payment',
            date: date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            notes: notes || 'No notes added',
        };

        const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

        if (response.status === 200) {
            console.log(`Settlement Email sent to ${toEmail}`);
            toast.success(`Settlement notification sent to ${toName}`);
        } else {
            console.error("Settlement Email Failed:", response);
            toast.error(`Failed to send notification to ${toName}`);
        }

    } catch (error) {
        console.error('Failed to send settlement email:', error);
        toast.error('Failed to send settlement notification');
    }
};
