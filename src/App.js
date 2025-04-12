import React, { useCallback, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";

import Users from "./user/pages/Users";
import NewPlace from "./places/pages/NewPlace";
import UserPlaces from "./places/pages/UserPlaces";
import UpdatePlace from "./places/pages/UpdatePlace";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import Auth from "./user/pages/Auth";
import { AuthContext } from "./shared/context/auth-context";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, []);
  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: isLoggedIn, login: login, logout: logout }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Switch>
            {" "}
            {/* Ensures that only the first matching route is rendered */}
            <Route path="/" exact>
              <Users />
            </Route>
            <Route path="/:userId/places" exact>
              <UserPlaces />
            </Route>
            <Route path="/places/new" exact>
              <NewPlace />
            </Route>
            <Route path="/places/:placeId">
              <UpdatePlace />
            </Route>
            <Route path="/auth">
              <Auth />
            </Route>
            <Redirect to="/" />{" "}
            {/* Ensures that only the first matching route is rendered */}
          </Switch>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;

/**
 * 1/    *** to replace  <Redirect to="/" /> in in React Router v6  ***

  import { Navigate } from 'react-router-dom';
  // Redirects to the home page ("/") in React Router v6
  <Navigate to="/" replace />

   2/    *** <Switch> is deprecated in React Router v6. ***

    Use <Routes> instead


 */
