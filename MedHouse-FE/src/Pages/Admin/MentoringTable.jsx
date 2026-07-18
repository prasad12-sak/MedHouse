import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AttendeeTable.css";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";

function MentoringTable() {
  const [mentoringRequests, setMentoringRequests] = useState([]);

  useEffect(() => {
    // Fetch data from the API endpoint
    axios
      .get("http://localhost:5000/api/mentoring")
      .then((response) => {
        setMentoringRequests(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const handleStatusChange = async (request, newStatus) => {
    try {
      // Update the status of the mentoring request in the backend
      await axios.patch(`http://localhost:5000/api/mentoring/${request._id}/status`, {
        status: newStatus,
      });

      

      // Update the local state with the updated status
      setMentoringRequests((prevRequests) =>
  prevRequests.map((item) =>
    item._id === request._id
      ? { ...item, status: newStatus }
      : item
  )
);

    sendEmail(request, newStatus);

  } catch (error) {
    console.error(error);
  }
};





const sendEmail = (request, status) => {

  emailjs
    .send(
      "service_xwsires",
    "template_59lsl2r", 
      {
        to_email: request.studentEmail,
        student_id: request.studentID,
        academic_year: request.academicYear,
        room_number: request.roomID,
        mentoring_type: request.mentoringType,
        reason: request.reason,
        request_time: new Date(request.requestTime).toLocaleString(),
        status: status,
       
      },
      
       "uYdKv3p4FGmpYfp88",
      
    )
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "Email Sent Successfully!",
        text: `Email sent to ${request.email}`,
      });
    })
    .catch((error) => {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Email Failed",
        text: error.text || "Unknown Error",
      });
    });
};
 
  return (
    <div className="table">
      <h1>Mentoring Requests Table</h1>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Room ID</th>
            <th>Mentoring Type</th>
            <th>Reason</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mentoringRequests.map((request) => (
            <tr key={request._id}>
              <td>{request.studentID}</td>
             
              <td>{request.roomID}</td>
              <td>{request.mentoringType}</td>
           
              
              <td>{request.reason}</td>
              <td>{request.studentEmail}</td>
              <td className="stats">{request.status}</td>
              <td>
                {request.status === "pending" && (
                  <>
                    <button
                      className="accept"
                      onClick={() =>
                        handleStatusChange(request, "accepted")
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="reject"
                      onClick={() =>
                        handleStatusChange(request, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

     
    
    </div>
  );
}

export default MentoringTable;
