// centralizar solicitudes http
import axios from "axios";
const api =axios.create({
baseURL:import.meta.env.VITE_API_URL || "http://localhost:8000",//direccion fastapi
withCredentials:true,//recibe cookies de inicio de sesion
headers:{
    "Content-Type":"application/json",
}
});

export default api;