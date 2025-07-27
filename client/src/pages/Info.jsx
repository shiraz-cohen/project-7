import "../App.css";
import { useEffect, useState } from "react";
import React from "react";

const Info = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    setUser(currentUser);
  }, []);

  return (
    <div className="info-container">
      {/* <h1 className="info-header">Info</h1> */}
      {user && (
        <div className="background">
          <div className="info-details">
            <h3 className="info-item">ID: {user.id}</h3>
            <h3 className="info-item">Name: {user.name}</h3>
            <h3 className="info-item">Username: {user.username}</h3>
            <h3 className="info-item">Rank: {user.userRank}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Info;
