import React from 'react';
import ReactDOM from 'react-dom';
import {AppRouter} from "./app/router/app-router";
import {security} from "./app/security/secuiry-fe";

security.init().then(() => {
    ReactDOM.render(<AppRouter />, document.getElementById('root'));
});





