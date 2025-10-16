import axios from 'axios';
import authHeader from './authHeader';
const API_URL = 'http://localhost:8080/api/groups';

const getGroups = () => {
    return axios.get(API_URL, { headers: authHeader() });
};
const createGroup = (groupName) => {
    return axios.post(API_URL, { name: groupName }, { headers: authHeader() });
};
const addMember = (groupId, email) => {
    return axios.post(`${API_URL}/${groupId}/members`, { email }, { headers: authHeader() });
};
const getGroupById = (groupId) => {
    return axios.get(`${API_URL}/${groupId}`, { headers: authHeader() });
};
export default {
    getGroups,
    createGroup,
    addMember,
    getGroupById,
};
