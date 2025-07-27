import "./App.css";
import React from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import UserList from "./pages/UserList.jsx";
import CamerasList from "./pages/CamerasList.jsx";
import Users from "./pages/Users.jsx";
import Info from "./pages/Info.jsx";
import CamerasAdmin from "./pages/CamerasAdmin.jsx";
import CamerasUser from "./pages/CamerasUser.jsx";
import Admin from "./pages/Admin.jsx";
import CamerasAccess from "./pages/CamerasAccess.jsx";
import UserAccess from "./pages/UserAccess";
import VideoAnalysis from "./pages/VideoAnalysis.jsx";
import UnusualEvents from "./pages/UnusualEvents";

function App() {
  return (
     <BrowserRouter>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/Admin" element={<Admin />}>
          <Route path=":id/Info" element={<Info />} />
          <Route path=":id/Register" element={<Register />} />
          <Route path=":id/UserList" element={<UserList />} />
          <Route path=":id/CamerasList" element={<CamerasList />} />
          <Route path=":id/UnusualEvents" element={<UnusualEvents />} />
          <Route path=":id/CamerasAccess" element={<CamerasAccess />} />
          <Route path=":id/UserAccess" element={<UserAccess />} />
          <Route path=":id/CamerasAdmin" element={<CamerasAdmin />}  />
          <Route path=":id/CamerasAdmin/:cameraID/VideoAnalysis" element={<VideoAnalysis />} /> 
          
        </Route>
        <Route path="/Users" element={<Users />}>
          <Route path=":id/Info" element={<Info />} />
          <Route path=":id/UnusualEvents" element={<UnusualEvents />} />
          <Route path=":id/CamerasUser" element={<CamerasUser />} />
          <Route path=":id/CamerasUser/:cameraID/VideoAnalysis" element={<VideoAnalysis />} />
        </Route>
      </Routes>
     </BrowserRouter>
  );
}

export default App;
