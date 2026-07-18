import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AttendeeTable.css";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";


function ClearanceTable() {
  const [clearanceRequests, setClearanceRequests] = useState([]);


  useEffect(() => {
    // Fetch data from the API endpoint
    axios
      .get("http://localhost:5000/api/clearance")
      .then((response) => {
        setClearanceRequests(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const handleStatusChange = async (request, newStatus) => {
    try {
      // Update the status of the clearance request in the backend
      await axios.patch(`http://localhost:5000/api/clearance/${request._id}/status`, {
        status: newStatus,
      });

  
     

      // Update the local state with the updated status
    setClearanceRequests((prevRequests) =>
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
  emailjs.send(
    "service_xwsires",
    "template_59lsl2r",
    {
      to_email: request.studentEmail,
      student_id: request.studentID,
      room_number: request.roomID,
      student_year: new Date(request.handOverDate).getFullYear(),
      duration: request.duration,
      handover_date: new Date(request.handOverDate).toLocaleDateString(),
      status: status,
  
    },
   
     "uYdKv3p4FGmpYfp88",

  )
     .then((result) => {
       console.log(result);
 
       Swal.fire({
         icon: "success",
         title: "Email Sent Successfully!",
         text: `Email sent to ${request.studentEmail}`,
       });
     })
     .catch((error) => {
       console.error(error);
 
       Swal.fire({
         icon: "error",
         title: "Email Failed",
         text: error.text,
       });
     });
 };
 

  return (
    <div className="table">
      <h1>Clearance Requests Table</h1>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Room ID</th>
            <th>Student Year</th>
            <th>Duration</th>
            <th>Hand Over Date</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clearanceRequests.map((request) => (
            <tr key={request._id}>
              <td>{request.studentID}</td>
              <td>{request.roomID}</td>
              <td>{new Date(request.handOverDate).getFullYear()}</td>
              <td>{request.duration}</td>
              <td>{new Date(request.handOverDate).toLocaleDateString()}</td>
              <td>{request.studentEmail}</td>
              <td className="stats">{request.status}</td>
              <td>
                {request.status === "pending" && (
                  <>
                   <button
  className="accept"
  onClick={() => handleStatusChange(request, "accepted")}
>
  Accept
</button>

<button
  className="reject"
  onClick={() => handleStatusChange(request, "rejected")}
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

export default ClearanceTable;
