import axios from 'axios';

export async function getContent() {
    const response = await axios.get('http://localhost:8000');
    return response.data;
}

