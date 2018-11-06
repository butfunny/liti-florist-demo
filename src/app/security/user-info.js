let user = null;
let listeners = [];

export let userInfo = {
    getUser: () => user,
    setUser: (_user) => {
        user = _user;
        listeners.forEach(f => f());
    },
    onChange: (func) => listeners.push(func)
}
;