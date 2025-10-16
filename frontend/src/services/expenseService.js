import axios from 'axios';
import authHeader from './authHeader';


const API_URL = 'http://localhost:8080/api/expenses';

const getExpensesByGroup = (groupId) => {
    return axios.get(`${API_URL}/group/${groupId}`, { headers: authHeader() });
};

const createExpense = (expenseData) => {
    
    return axios.post(API_URL, expenseData, { headers: authHeader() });
};
const getSpendingByCategory = (groupId) => {
    return axios.get(`${API_URL}/group/${groupId}/insights/by-category`, { headers: authHeader() });
};

const deleteExpense = (expenseId) => {
    return axios.delete(`${API_URL}/${expenseId}`, { headers: authHeader() });
};

const editExpense = (expenseId, expenseData) => {
    return axios.put(`${API_URL}/${expenseId}`, expenseData, { headers: authHeader() });
};

export default {
    getExpensesByGroup,
    createExpense,
    getSpendingByCategory,
    deleteExpense,
    editExpense,
};