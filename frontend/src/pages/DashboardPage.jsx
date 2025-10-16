import React, { useState, useEffect } from 'react';
import groupService from '../services/groupService';
import expenseService from '../services/expenseService';
import CategoryPieChart from '../components/CategoryPieChart';
import settlementService from '../services/settlementService';
import { Link } from 'react-router-dom';



function DashboardPage() {
    
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newGroupName, setNewGroupName] = useState('');


    const [selectedGroup, setSelectedGroup] = useState(null); 
    const [expenses, setExpenses] = useState([]); 
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('FOOD');
    const [settlements, setSettlements] = useState([]); 

    const [categorySpending, setCategorySpending] = useState([]);

    const [addMemberEmail, setAddMemberEmail] = useState('');

  
    const [splitType, setSplitType] = useState('EQUAL'); 
    const [customSplits, setCustomSplits] = useState([]); 
    const [isEditing, setIsEditing] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    
useEffect(() => {
    if (selectedGroup && selectedGroup.members) { 
        const initialSplits = selectedGroup.members.map(member => ({
            userId: member.id, 
            value: 0,
        }));
        setCustomSplits(initialSplits);
    }
}, [selectedGroup]);

    
    const fetchGroups = async () => {
        try {
            const response = await groupService.getGroups();
            setGroups(response.data);
        } catch (err) {
            setError('Failed to fetch groups. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchExpenses = async (groupId) => {
        try {
            const response = await expenseService.getExpensesByGroup(groupId);
            setExpenses(response.data);
        } catch (err) {
            console.error('Failed to fetch expenses', err);
            }
    };
        const fetchSettlements = async (groupId) => { 
         try {
        console.log("Attempting to fetch settlements for group:", groupId); 
        const response = await settlementService.getSettlements(groupId);
        
        console.log("API Response for settlements:", response.data); 

        setSettlements(response.data); 
    } catch (err) {
        console.error('Failed to fetch settlements', err);
    }
    };
    const fetchInsights = async (groupId) => {
    try {
        const response = await expenseService.getSpendingByCategory(groupId);
        setCategorySpending(response.data);
    } catch (err) {
        console.error("Failed to fetch insights", err);
    }
    };
    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!addMemberEmail.trim() || !selectedGroup) return;

        try {
            const response = await groupService.addMember(selectedGroup.id, addMemberEmail);
           
            setAddMemberEmail(''); 
            alert('Member added successfully!');
        
        } catch (err) {
            alert('Failed to add member. Check the email or they may already be in the group.');
            console.error(err);
        }
    };
    
    
    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        try {
            await groupService.createGroup(newGroupName);
            setNewGroupName('');
            fetchGroups(); 
        } catch (err) {
            alert('Failed to create group.');
        }
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setExpenses([]);
        setSettlements([]);
        setCategorySpending([]); 
        fetchExpenses(group.id);
        fetchSettlements(group.id);
        fetchInsights(group.id);
    };
    const handleCustomSplitChange = (userId, value) => {
        const updatedSplits = customSplits.map(split => 
            split.userId === userId ? { ...split, value: value } : split
        );
        setCustomSplits(updatedSplits);
    };

    const handleDeleteExpense = async (expenseId) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await expenseService.deleteExpense(expenseId);
                fetchExpenses(selectedGroup.id);
                fetchSettlements(selectedGroup.id);
                fetchInsights(selectedGroup.id);
            } catch (err) {
                alert('Failed to delete expense. You may not be the owner.');
                console.error(err);
            }
        }
    };
    const handleStartEdit = (expense) => {
        setIsEditing(true);
        setEditingExpense(expense);

        setExpenseDescription(expense.description);
        setExpenseAmount(expense.amount.toFixed(2));
        setExpenseCategory(expense.category);
        setSplitType(expense.splitType);
        if (expense.splitType !== 'EQUAL') {
            const initialSplits = selectedGroup.members.map(member => {
                const existingSplit = expense.splits.find(s => s.userId === member.id);
                return {
                    userId: member.id,
                    value: existingSplit ? (expense.splitType === 'BY_AMOUNT' ? existingSplit.amountOwed : (existingSplit.amountOwed / expense.amount) * 100) : 0
                };
            });
            setCustomSplits(initialSplits);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingExpense(null);
        setExpenseDescription('');
        setExpenseAmount('');
        setSplitType('EQUAL');
    };


const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !expenseDescription.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0) {
        alert("Please fill out all expense fields with a valid amount.");
        return;
    }

    const expenseData = {
        description: expenseDescription,
        amount: parseFloat(expenseAmount),
        groupId: selectedGroup.id,
        category: expenseCategory,
        splitType: splitType, 
        splits: splitType === 'EQUAL' ? [] : customSplits.map(s => ({ userId: s.userId, value: parseFloat(s.value || 0) })),
    };

    
    
    if (splitType === 'BY_AMOUNT') {
        const totalSplit = expenseData.splits.reduce((sum, s) => sum + s.value, 0);
        if (totalSplit.toFixed(2) !== expenseData.amount.toFixed(2)) {
            alert(`The split amounts must add up to the total amount of ₹${expenseData.amount}. Current total: ₹${totalSplit.toFixed(2)}`);
            return;
        }
    }
    if (splitType === 'BY_PERCENTAGE') {
        const totalPercent = expenseData.splits.reduce((sum, s) => sum + s.value, 0);
        if (totalPercent !== 100) {
            alert(`The percentages must add up to 100%. Current total: ${totalPercent}%`);
            return;
        }
    }
    
    try {
        if (isEditing) {
            await expenseService.editExpense(editingExpense.id, expenseData);
        } else {
            await expenseService.createExpense(expenseData);
        }


        handleCancelEdit();
        fetchExpenses(selectedGroup.id);
        fetchSettlements(selectedGroup.id);
        fetchInsights(selectedGroup.id);

    } catch (err) {
        const errorMsg = err.response?.data?.message || err.response?.data || `Failed to ${isEditing ? 'update' : 'add'} expense.`;
        alert(errorMsg);
        console.error(err);
    }
    
    };
    
if (loading) {
        return <div>Loading your groups...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '10px' }}>

            {/* Left Column */}
            <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '20px' }}>
                <h3>Create a New Group</h3>
                <form onSubmit={handleCreateGroup}>
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Group Name"
                        required
                    />
                    <button type="submit">Create Group</button>
                </form>
                <hr />
                
                <h2>Your Groups</h2>
                {groups.length > 0 ? (
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {groups.map((group) => (
                            <li 
                                key={group.id} 
                                onClick={() => handleSelectGroup(group)} 
                                style={{ 
                                    cursor: 'pointer', 
                                    padding: '8px',
                                    backgroundColor: selectedGroup?.id === group.id ? '#e0f7fa' : 'transparent',
                                    fontWeight: selectedGroup?.id === group.id ? 'bold' : 'normal',
                                    borderRadius: '4px'
                                }}
                            >
                                {group.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You are not a member of any groups yet. Create one!</p>
                )}
            </div>

            {/* Right Column */}
            <div style={{ flex: 2 }}>
                {selectedGroup ? (
                    <div>
                        <h2>Details for: {selectedGroup.name}</h2>
                        
                        {}
                        <div>
                            <h3>Members</h3>
                            <ul>
                                {selectedGroup.members.map(member => (
                                    <li key={member.id}>User: {member.name} (ID: {member.id})</li>
                                ))}
                            </ul>
                            <form onSubmit={handleAddMember}>
                                <input 
                                    type="email"
                                    value={addMemberEmail}
                                    onChange={(e) => setAddMemberEmail(e.target.value)}
                                    placeholder="Member's email to add"
                                    required
                                />
                                <button type="submit">Add Member</button>
                            </form>
                        </div>
                        <hr />

                        {/* Expense Form*/}
                        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                            <h3>{isEditing ? `Editing: ${editingExpense.description}` : 'Add New Expense'}</h3>
                            <form onSubmit={handleExpenseSubmit}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    <input type="text" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} placeholder="Description" required />
                                    <input type="number" step="0.01" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Total Amount" required />
                                    <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
                                        <option value="FOOD">Food</option>
                                        <option value="TRAVEL">Travel</option>
                                        <option value="RENT">Rent</option>
                                        <option value="SHOPPING">Shopping</option>
                                        <option value="UTILITIES">Utilities</option>
                                        <option value="ENTERTAINMENT">Entertainment</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Split Type: </label>
                                    <select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
                                        <option value="EQUAL">Equally</option>
                                        <option value="BY_AMOUNT">By Amount</option>
                                        <option value="BY_PERCENTAGE">By Percentage</option>
                                    </select>
                                </div>

                                {splitType !== 'EQUAL' && (
                                    <div style={{ marginTop: '10px' }}>
                                        {customSplits.map((split) => (
                                            <div key={split.userId} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                                                <label>{selectedGroup.members.find(m => m.id === split.userId)?.name}:</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={split.value}
                                                    onChange={(e) => handleCustomSplitChange(split.userId, e.target.value)}
                                                    placeholder={splitType === 'BY_AMOUNT' ? 'Amount' : 'Percentage %'}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <button type="submit" style={{ marginTop: '10px' }}>
                                    {isEditing ? 'Update Expense' : 'Add Expense'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={handleCancelEdit} style={{ marginTop: '10px', marginLeft: '10px' }}>
                                        Cancel Edit
                                    </button>
                                )}
                            </form>
                        </div>
                        <hr />

                        {/*Expense List*/}
                        <h3>Expenses</h3>
                        {expenses.length > 0 ? (
                            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                {expenses.map(exp => (
                                    <li key={exp.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            {exp.date.split('T')[0]} - <strong>{exp.description}</strong> - ₹{exp.amount.toFixed(2)} 
                                            <span style={{ fontSize: '0.9em', color: '#555' }}> (Paid by {exp.paidByUserName})</span>
                                        </div>
                                        <div>
                                            <button onClick={() => handleStartEdit(exp)} style={{ marginRight: '5px' }}>Edit</button>
                                            <button onClick={() => handleDeleteExpense(exp.id)}>Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No expenses yet for this group.</p>
                        )}
                        <hr />

                        {/*Settlements Section */}
                        <h3>Settle Up</h3>
                        {settlements.length > 0 ? (
                            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                {settlements.map((settlement, index) => (
                                    <li key={index} style={{ background: '#d1ecf1', padding: '10px', borderRadius: '4px' }}>
                                        <strong>{settlement.fromUserName}</strong> should pay <strong>{settlement.toUserName}</strong> ₹{settlement.amount.toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>All debts are settled!</p>
                        )}
                        <hr />
                        <h3>Spending by Category</h3>
                        <CategoryPieChart data={categorySpending} />
                    </div>
                ) : (
                    <h2>Select a group to see details, add expenses, and settle up.</h2>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;