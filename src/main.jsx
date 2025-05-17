import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import { store } from './store';
import { LanguageProvider } from "./context/LanguageContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <GoogleOAuthProvider clientId="42679577316-k976kecs12c4pi97g3b2ovo3klu8u9o0.apps.googleusercontent.com">
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
    </LanguageProvider>    
  </React.StrictMode>
);
