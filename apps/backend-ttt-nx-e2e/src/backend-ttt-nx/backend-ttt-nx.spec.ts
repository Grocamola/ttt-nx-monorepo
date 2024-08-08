// src/backend-ttt-nx/backend-ttt-nx.spec.ts
import axios from 'axios';

describe('GET /', () => {
  it('should return a message', async () => {
    try {
      const res = await axios.get(`http://localhost:3333/`); 

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ message: 'Welcome to backend-ttt-nx!' });
    } catch (error) {
      console.error('Error in test:', error);
      throw error;
    }
  });
});