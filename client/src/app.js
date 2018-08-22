import React from 'react';
import { Route, Switch } from 'react-router-dom';

import HomePage  from '@pages/HomePage';
import AboutPage from '@pages/AboutPage';
import LoginPage from '@pages/LoginPage';
import ContentPageWrapper from '@pages/ContentPageWrapper';
import FourOhFourPage from '@pages/FourOhFourPage';
import MultisitePage from '@pages/MultisitePage';
import EditPage from '@pages/EditPage';

const App = () => {
  return (
    <Switch>
      <Route exact path='/' component={HomePage} />
      <Route exact path='/about' component={AboutPage} />
      <Route exact path='/login' component={LoginPage} />
      <Route exact path='/multisite' component={MultisitePage} />
      <Route exact path='/edit/:identifier/:claim' component={EditPage} />
      <Route exact path='/:identifier/:claim' component={ContentPageWrapper} />
      <Route exact path='/:claim' component={ContentPageWrapper} />
      <Route component={FourOhFourPage} />
    </Switch>
  );
};

export default App;
