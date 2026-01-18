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
        const count = expense.participants.length;

        // Skip if no participants to avoid division by zero
        if (count === 0) {
            console.warn(`Expense "${expense.description}" has no participants - skipping split calculation`);
            return;
        }

        if (expense.splitMethod === 'equally') {
            // Divide equally among participants
            const splitAmount = expense.amount / count;
            expense.participants.forEach(p => {
                balances[p] = (balances[p] || 0) - splitAmount;
            });
        } else if (expense.splitMethod === 'percentage') {
            // Calculate based on percentage with proper rounding
            if (expense.splitDetails) {
                Object.entries(expense.splitDetails).forEach(([name, percentStr]) => {
                    const percent = Number(percentStr);
                    // Round to 2 decimals to prevent floating point errors
                    const amountKey = Math.round((expense.amount * percent)) / 100;
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

/**
 * Smart Debt Simplification (Greedy Algorithm)
 * Minimizes the number of transactions by greedy matching max debtor with max creditor.
 * @param expenses List of expenses
 * @param currentUserName Optional: Current user's name to normalize "You" aliasing
 */
export function calculateSmartDebts(expenses: Expense[], currentUserName?: string): Debt[] {
    const balances: Record<string, number> = {};

    const normalize = (name: string) => {
        if (!currentUserName) return name;
        if (name === "You") return currentUserName;
        if (name === currentUserName) return currentUserName;
        return name;
    }

    // 1. Calculate Balances
    expenses.forEach(expense => {
        let totalPaid = 0;
        if (expense.paidBy === 'multiple' && expense.payerDetails) {
            Object.entries(expense.payerDetails).forEach(([name, amount]) => {
                const val = Number(amount);
                const normalizedName = normalize(name);
                balances[normalizedName] = (balances[normalizedName] || 0) + val;
                totalPaid += val;
            });
        } else {
            const payer = normalize(expense.paidBy);
            const val = Number(expense.amount);
            balances[payer] = (balances[payer] || 0) + val;
            totalPaid = val;
        }

        const count = expense.participants.length;
        if (count === 0) return;

        if (expense.splitMethod === 'equally') {
            const splitAmount = expense.amount / count;
            expense.participants.forEach(p => {
                const normalizedP = normalize(p);
                balances[normalizedP] = (balances[normalizedP] || 0) - splitAmount;
            });
        } else if (expense.splitMethod === 'percentage' && expense.splitDetails) {
            Object.entries(expense.splitDetails).forEach(([name, percentStr]) => {
                const normalizedName = normalize(name);
                const amountKey = Math.round((expense.amount * Number(percentStr))) / 100;
                balances[normalizedName] = (balances[normalizedName] || 0) - amountKey;
            });
        } else if (expense.splitDetails) {
            Object.entries(expense.splitDetails).forEach(([name, amountStr]) => {
                const normalizedName = normalize(name);
                balances[normalizedName] = (balances[normalizedName] || 0) - Number(amountStr);
            });
        } else {
            const splitAmount = expense.amount / expense.participants.length;
            expense.participants.forEach(p => {
                const normalizedP = normalize(p);
                balances[normalizedP] = (balances[normalizedP] || 0) - splitAmount;
            });
        }
    });

    const debtors: { name: string, amount: number }[] = [];
    const creditors: { name: string, amount: number }[] = [];

    Object.entries(balances).forEach(([name, balance]) => {
        const net = Math.round(balance * 100) / 100;
        if (net < -0.01) debtors.push({ name, amount: -net });
        if (net > 0.01) creditors.push({ name, amount: net });
    });

    // Sort Descending - Key for Minimizing Transactions
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const smartDebts: Debt[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // Skip Dust
        if (debtor.amount < 0.01) { i++; continue; }
        if (creditor.amount < 0.01) { j++; continue; }

        const amount = Math.min(debtor.amount, creditor.amount);

        smartDebts.push({
            from: debtor.name,
            to: creditor.name,
            amount: Math.round(amount * 100) / 100
        });

        debtor.amount -= amount;
        creditor.amount -= amount;

        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return smartDebts;
}
