
import emailjs from '@emailjs/browser';
import { toast } from "sonner";

// These should be in your .env file
// VITE_EMAILJS_SERVICE_ID=...
// VITE_EMAILJS_TEMPLATE_ID=...
// VITE_EMAILJS_PUBLIC_KEY=...

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
            console.error("EmailJS credentials MISSING in .env is:", { serviceId, templateId, publicKey });
            toast.error("Email Failed: Missing API Keys in .env");
            return;
        }

        const templateParams = {
            to_email: toEmail,
            to_name: toName,
            from_name: fromName,
            expense_description: expenseDescription,
            amount: amount,
            split_amount: splitAmount,
            message: `You've been added to a new expense: ${expenseDescription}. Your share is ₹${splitAmount}.`,
        };

        toast.loading("Sending email...", { id: "email-send" });
        const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

        toast.dismiss("email-send");
        if (response.status === 200) {
            toast.success(`Email sent to ${toEmail}!`);

        } else {
            toast.error(`Email failed: ${response.text}`);
        }

    } catch (error) {
        toast.dismiss("email-send");
        console.error('Failed to send email:', error);
        toast.error("Email failed to send. Check console.");
    }
};
