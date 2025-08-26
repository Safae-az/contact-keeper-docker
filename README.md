Parfait Safae ! Voici un **README complet et professionnel en anglais**, qui combine **React refactor, Postman routes, Docker/Nginx, et déploiement automatisé**. Tu pourras le mettre directement sur GitHub ou LinkedIn :

---

# Contact Keeper

**Full-stack MERN Contact Manager** with React Hooks, Context API, and JWT authentication. Originally part of a React Udemy course, this project has been refactored for modern React patterns and upgraded to React Router v6.

It demonstrates a full MERN stack application with secure authentication, scalable state management, and automated deployment using Docker and Nginx.

---

## Features

* User registration and login with JWT authentication
* Add, update, delete, and list contacts
* Filter contacts dynamically
* Context API for state management
* Fully refactored for React hooks (no lifecycle methods)
* Modern React Router v6 routing
* Dockerized frontend and backend with Nginx reverse proxy
* Automated deployment script for fast, repeatable updates

---

## Technical Details

### React Hooks Refactor

Early implementations of hooks tried to mimic lifecycle methods. Now the app uses a **hook-first approach**:

* **Pure action functions**: All data-fetching methods are outside of context to avoid unnecessary re-renders.
* **Custom hooks for state**:

```javascript
export const useContacts = () => {
  const { state, dispatch } = useContext(ContactContext);
  return [state, dispatch];
};
```

* Example usage in a component:

```javascript
const [contactState, contactDispatch] = useContacts();
const { contacts, filtered } = contactState;

useEffect(() => {
  getContacts(contactDispatch);
}, [contactDispatch]);
```

* Only `dispatch` is provided through context because it is guaranteed to be stable by React.

### Sample Action Creator

```javascript
export const getContacts = async (dispatch) => {
  try {
    const res = await axios.get('/api/contacts');
    dispatch({ type: GET_CONTACTS, payload: res.data });
  } catch (err) {
    dispatch({ type: CONTACT_ERROR, payload: err.response.msg });
  }
};
```

This ensures the function is stable across renders, avoiding `useEffect` dependency issues.

---

## API Endpoints (Testable via Postman)

### Users & Authentication

* **Register a new user**
  `POST /api/users`

```json
{
  "name": "Sam Smith",
  "email": "sam@gmail.com",
  "password": "123456"
}
```

* **Login a user**
  `POST /api/auth`

```json
{
  "email": "sam@gmail.com",
  "password": "123456"
}
```

* **Get logged-in user**
  `GET /api/auth`
  Headers: `x-auth-token: <VALID_TOKEN>`

### Contacts

* **Get all contacts**
  `GET /api/contacts`
  Headers: `x-auth-token: <VALID_TOKEN>`

* **Add a new contact**
  `POST /api/contacts`

```json
{
  "name": "William Williams",
  "email": "william@gmail.com",
  "phone": "77575894"
}
```

* **Update a contact**
  `PUT /api/contacts/<CONTACT_ID>`

```json
{
  "phone": "555555"
}
```

* **Delete a contact**
  `DELETE /api/contacts/<CONTACT_ID>`

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Safae-az/contact-keeper-docker.git
cd contact-keeper-docker
```

2. Install dependencies:

```bash
npm install
cd client
npm install
```

3. Configure MongoDB connection:
   Edit `/config/default.json` with your MongoDB URI.

---

## Running the Application

* **Full stack (Express + React)**

```bash
npm run dev
```

* **Backend only**

```bash
npm run server
```

* **Frontend only**

```bash
npm run client
```

---

## Docker & Deployment Automation

This project is **containerized** for production with Docker and Nginx.

### Docker Setup

* Multi-stage build:

  * Stage 1: Builds React frontend
  * Stage 2: Serves frontend via Nginx and connects to backend container
* Frontend and backend run in separate containers.
* Build and run commands:

```bash
docker build -t contact-keeper .
docker run -p 80:80 contact-keeper
```

### Nginx Configuration

* Serves static React build
* Proxies `/api/*` requests to backend
* Supports React Router v6 routing
* Example `nginx.conf`:

```nginx
server {
  listen 80;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```





---




