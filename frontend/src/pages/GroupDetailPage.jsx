import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import groupService from '../services/groupService';
import expenseService from '../services/expenseService';
import settlementService from '../services/settlementService';
import CategoryPieChart from '../components/CategoryPieChart';

function GroupDetailPage() {
    const { groupId } = useParams();

    
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [categorySpending, setCategorySpending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    
    const [addMemberEmail, setAddMemberEmail] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('FOOD');
    const [splitType, setSplitType] = useState('EQUAL');
    const [customSplits, setCustomSplits] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const fetchGroupData = async () => {
        setLoading(true);
        try {
            const [groupRes, expensesRes, settlementsRes, insightsRes] = await Promise.all([
                groupService.getGroupById(groupId),
                expenseService.getExpensesByGroup(groupId),
                settlementService.getSettlements(groupId),
                expenseService.getSpendingByCategory(groupId),
            ]);
            setGroup(groupRes.data);
            setExpenses(expensesRes.data);
            setSettlements(settlementsRes.data);
            setCategorySpending(insightsRes.data);
        } catch (err) {
            setError('Failed to load group data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchGroupData();
    }, [groupId]);

    useEffect(() => {
        if (group) {
            const initialSplits = group.members.map(member => ({
                userId: member.id,
                value: 0,
            }));
            setCustomSplits(initialSplits);
        }
    }, [group]);



    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!addMemberEmail.trim()) return;
        try {
            const response = await groupService.addMember(groupId, addMemberEmail);
            setGroup(response.data); 
            setAddMemberEmail('');
            alert('Member added successfully!');
        } catch (err) {
            alert('Failed to add member.');
            console.error(err);
        }
    };
    
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!expenseDescription.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0) {
            alert("Please fill out all expense fields.");
            return;
        }
        const expenseData = {
            description: expenseDescription,
            amount: parseFloat(expenseAmount),
            groupId: groupId,
            category: expenseCategory,
            splitType: splitType,
            splits: splitType === 'EQUAL' ? [] : customSplits.map(s => ({ userId: s.userId, value: parseFloat(s.value || 0) })),
        };
        
        try {
            if (isEditing) {
                await expenseService.editExpense(editingExpense.id, expenseData);
            } else {
                await expenseService.createExpense(expenseData);
            }
            handleCancelEdit(); 
            fetchGroupData(); 
        } catch (err) {
            alert(`Failed to ${isEditing ? 'update' : 'add'} expense.`);
            console.error(err);
        }
    };
    
    const handleDeleteExpense = async (expenseId) => {
        if (window.confirm('Are you sure?')) {
            try {
                await expenseService.deleteExpense(expenseId);
                fetchGroupData();
            } catch (err) {
                alert('Failed to delete expense.');
            }
        }
    };

    const handleStartEdit = (expense) => {};
    const handleCancelEdit = () => { };
    const handleCustomSplitChange = (userId, value) => { };

    if (loading) return <div>Loading group details...</div>;
    if (error) return <div>{error} <Link to="/">Go back</Link></div>;
    if (!group) return <div>Group not found.</div>;

    return (
        <div style={{ padding: '20px' }}>
            <Link to="/">&larr; Back to Dashboard</Link>
            <h2>Details for: {group.name}</h2>
            
            
            <h3>Members</h3>
            <ul>{group.members.map(m => <li key={m.id}>{m.name}</li>)}</ul>
            <form onSubmit={handleAddMember}>
                <input type="email" value={addMemberEmail} onChange={e => setAddMemberEmail(e.target.value)} placeholder="Member's email" />
                <button type="submit">Add Member</button>
            </form>
            <hr/>
            
            <div style={{ background: '#f9f9f9', padding: '15px' }}>
                <h3>{isEditing ? 'Edit Expense' : 'Add New Expense'}</h3>
                <form onSubmit={handleExpenseSubmit}>{/* ... form JSX is the same ... */}</form>
            </div>
            <hr/>

            <h3>Expenses</h3>
            <ul>{expenses.map(exp => <li key={exp.id}>{/* ... expense details and buttons ... */}</li>)}</ul>
            <hr/>
            
            <h3>Settle Up</h3>
            <ul>{settlements.map((s, i) => <li key={i}>{/* ... settlement details ... */}</li>)}</ul>
            <hr/>
            
            <h3>Spending by Category</h3>
            <CategoryPieChart data={categorySpending} />
        </div>
    );
}

export default GroupDetailPage;