window.addEventListener('beforeunload', () => {
  localStorage.removeItem('bookingForm');
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store';
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>  
      <Provider store={store}>
        <App />
      </Provider>     
  </React.StrictMode>
);
