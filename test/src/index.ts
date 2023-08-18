import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Test } from './Test';


console.log('Start Up');

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(createElement(Test));
}
