// api.js
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });
export const createUser = (data) => API.post("/users/create", data);
export const getSingleUser = (userId) => API.get(`/users/singleUser/${userId}`);
export const sendMessage = (data) => API.post("/conversation/message", data); // or your route name
export const adminReply = (data) => API.post("/admin/reply", data);
export const makeAdminActive = (data) => API.put("/admin/activity",data);
export const getConversation = (sessionId) =>
  API.get(`/conversation/singleConversation/${sessionId}`);
export const getAllConversation = () => API.get(`/conversation/get-allConversation`);
export const getAdminStatus = (adminId) => API.get(`/admin/status/${adminId}`);