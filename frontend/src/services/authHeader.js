export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
        // For backend, the header is "Authorization: Bearer <token>"
        return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
}