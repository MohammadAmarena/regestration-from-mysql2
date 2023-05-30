import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react';
import axios from "axios";

const Home = () => {
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  
  axios.defaults.withCredentials = true;

  useEffect(() => {
      axios.get('http://localhost:3111').then(res => {

        if (res.data.Status === "Success") {
          setAuth(true)
          setName(res.data.name)
        } else {
          setAuth(false)
          setMessage(res.data.Error)
        }
      })
  })

  const handleDeleteCookie = () => {
    axios.get('http://localhost:3111/logout')
    .then(res => {
      location.reload();
    }).catch(err => console.log((err))
    )
  }
  
  return (
    <div className="container mt-4">
      {
        auth ?
          <div>
            <h3>You Are Authorized</h3>
            <button className="btn btn-danger" onClick={handleDeleteCookie}>LogOut</button>
          </div>
          :
          <div>
            <h3>{ }</h3>
            <h3>logIn Now</h3>
            <Link to='/login' className='btn btn-primary'>LogIn</Link>
          </div>
      }
    </div>
  )
}

export default Home
