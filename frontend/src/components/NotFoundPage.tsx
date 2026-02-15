import React from 'react';
import { Link } from 'react-router-dom';

import { tr } from '../i18n';

function NotFoundPage() {
  return (
    <div className="container text-center" style={{ marginTop: '100px' }}>
      <h1>404</h1>
      <p>{tr('Page not found.', 'ページが見つかりません。')}</p>
      <Link to="/">{tr('Go to Home', 'ホームへ戻る')}</Link>
    </div>
  );
}

export default NotFoundPage;
