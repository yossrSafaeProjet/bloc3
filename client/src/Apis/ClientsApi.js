import axios from "axios"
const BASE_URL="https://localhost:5173"
export async function getAllClients(){
   let response =await axios.get(`${BASE_URL}/api/dashboard/clients/AllClient`);
   return response; 
}