import React, { Component } from 'react';
import { useLocation } from "react-router-dom";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

export const MatchWait = (props) => {
    const query = useQuery();
    const requesterId = query.get("requesterId");
    const recieverId = query.get("recieverId");

    return (
        <div>
            <p>Requester ID: {requesterId}</p>
            <p>Receiver ID: {recieverId}</p>
        </div>
    );
}



export default MatchWait;
