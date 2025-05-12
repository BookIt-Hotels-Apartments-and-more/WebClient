import React from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFakeLogin = () => {
    const fakeUser = {
      id: 1,
      name: 'Іван Іванов',
      email: 'ivan@example.com',
    };
    dispatch(login(fakeUser));
    navigate('/');
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">🔐 Увійти</h2>
      <p className="mb-6 text-gray-600">Це демонстрація фейкового входу без API.</p>
      <button
        onClick={handleFakeLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Увійти як Іван Іванов
      </button>
    </div>
  );
};

export default Login;
