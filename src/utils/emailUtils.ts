
import { Expense } from "@/context/ExpenseContext";
import { format } from "date-fns";

export const generateBillEmailBody = (expense: Expense, userName: string) => {
    const date = expense.date ? format(new Date(expense.date), "PPP") : "Unknown Date";

    return `
Hey!

Here are the details for the bill "${expense.description}" added by ${expense.createdBy === userName || expense.paidBy === "You" ? "me" : expense.paidBy}.

Amount: ₹${expense.amount}
Date: ${date}
Paid By: ${expense.paidBy}

Start tracking expenses with me on SplitWayy!
`.trim();
};

export const shareBillViaEmail = (expense: Expense, userName: string) => {
    const subject = encodeURIComponent(`Bill Details: ${expense.description}`);
    const body = encodeURIComponent(generateBillEmailBody(expense, userName));
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
};

export const sendInviteEmail = (friendName: string, myName: string) => {
    const subject = encodeURIComponent(`${myName} invited you to join SplitWayy`);
    const body = encodeURIComponent(`Hey ${friendName},\n\nJoin me on SplitWayy to share expenses and bills easily!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
};
