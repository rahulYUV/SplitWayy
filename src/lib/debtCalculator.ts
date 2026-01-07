import { Expense } from "@/services/expenseService";

export interface Debt {
    from: string;
    to: string;
    amount: number;
}

export function calculateDebts(expenses: Expense[]): Debt[] {
    const balances: Record<string, number> = {};

    expenses.forEach(expense => {
        // 1. Calculate Payer Credits (+)
        let totalPaid = 0;

        if (expense.paidBy === 'multiple' && expense.payerDetails) {
            Object.entries(expense.payerDetails).forEach(([name, amount]) => {
                const val = Number(amount);
                balances[name] = (balances[name] || 0) + val;
                totalPaid += val;
            });
        } else {
            const payer = expense.paidBy;
            const val = Number(expense.amount);
            balances[payer] = (balances[payer] || 0) + val;
            totalPaid = val;
        }

        // 2. Calculate Borrower Debits (-)
        if (expense.splitMethod === 'equally') {
            // Divide equally among participants
            const count = expense.participants.length;
            if (count > 0) {
                const splitAmount = expense.amount / count;
                expense.participants.forEach(p => {
                    balances[p] = (balances[p] || 0) - splitAmount;
                });
            }
        } else if (expense.splitMethod === 'percentage') {
            // Calculate based on percentage
            if (expense.splitDetails) {
                Object.entries(expense.splitDetails).forEach(([name, percentStr]) => {
                    const percent = Number(percentStr);
                    const amountKey = (expense.amount * percent) / 100;
                    balances[name] = (balances[name] || 0) - amountKey;
                });
            }
        } else {
            // Exact amounts (default fallback for 'exact' or undefined)
            if (expense.splitDetails) {
                Object.entries(expense.splitDetails).forEach(([name, amountStr]) => {
                    const val = Number(amountStr);
                    balances[name] = (balances[name] || 0) - val;
                });
            } else if (expense.participants.length > 0) {
                // Fallback if splitDetails missing but 'exact' -> assume equal? Or skip.
                // Better to assume equal for legacy data robustness
                const splitAmount = expense.amount / expense.participants.length;
                expense.participants.forEach(p => {
                    balances[p] = (balances[p] || 0) - splitAmount;
                });
            }
        }
    });

    // 3. Separate Creditors and Debtors
    const debtors: { name: string, amount: number }[] = [];
    const creditors: { name: string, amount: number }[] = [];

    Object.entries(balances).forEach(([name, balance]) => {
        // Round to 2 decimals to avoid floating point errors
        const net = Math.round(balance * 100) / 100;
        if (net < -0.01) debtors.push({ name, amount: -net }); // Store positive debt amount
        if (net > 0.01) creditors.push({ name, amount: net });
    });

    // Sort to optimize matching (optional, but sorting by amount descending helps minimize dust)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    // 4. Match Debts
    const debts: Debt[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // Ensure we don't get stuck with infinite tiny fractions
        if (debtor.amount < 0.01) { i++; continue; }
        if (creditor.amount < 0.01) { j++; continue; }

        const amount = Math.min(debtor.amount, creditor.amount);

        if (amount > 0) {
            debts.push({
                from: debtor.name,
                to: creditor.name,
                amount: Math.round(amount * 100) / 100
            });
        }

        debtor.amount -= amount;
        creditor.amount -= amount;

        // Move to next if exhausted (using small epsilon for float comparison)
        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return debts;
}
