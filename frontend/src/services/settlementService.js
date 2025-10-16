import axios from 'axios';
import authHeader from './authHeader';

const API_URL = 'http://localhost:8080/api/settlements';

const getSettlements = (groupId) => {
    return axios.get(`${API_URL}/group/${groupId}`, { headers: authHeader() });
};

export default {
    getSettlements,
};