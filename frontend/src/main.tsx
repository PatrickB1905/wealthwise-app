import ReactDOM from 'react-dom/client';

import App from './App';
import { AppProviders } from '@app/providers/AppProviders';

import './index.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>,
);
