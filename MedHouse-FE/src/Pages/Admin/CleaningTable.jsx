import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AttendeeTable.css";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";

function CleaningTable() {
  console.log("CleaningTable Loaded");

  const [cleaningRequests, setCleaningRequests] = useState([]);
  const [studentEmail, setStudentEmail] = useState("");
const [isModalOpen, setIsModalOpen] = useState(false);
const [requestStatus, setRequestStatus] = useState("");

  useEffect(() => {
    // Fetch data from the API endpoint
    axios
      .get("http://localhost:5000/api/cleaning")
      .then((response) => {
        console.log(response.data);
        setCleaningRequests(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

const handleStatusChange = async (request, newStatus) => {
  try {
    await axios.patch(
      `http://localhost:5000/api/cleaning/${request._id}/status`,
      {
        status: newStatus,
      }
    );

    setCleaningRequests((prevRequests) =>
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
        to_email: request.email,
        student_id: request.studentID,
        room_number: request.roomID,
        cleaning_level: request.cleaningLevel,
        request_date: new Date(request.requestDate).toLocaleString(),
        status: status,
      },
      "uYdKv3p4FGmpYfp88"
    )
    .then((result) => {
      console.log(result);

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
        text: error.text,
      });
    });
};



  return (
    <div className="table">
      <h1>Cleaning Requests Table</h1>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Room ID</th>
            <th>Cleaning Level</th>
            <th>Request Date</th>
            <th>email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cleaningRequests.map((request) => (
            <tr key={request._id}>
              <td>{request.studentID}</td>
              <td>{request.roomID}</td>
              <td>{request.cleaningLevel}</td>
              <td>{new Date(request.requestDate).toLocaleString()}</td>
              <td>{request.email}</td>
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

      {/* Modal for entering student email */}
      {isModalOpen && (
        <div className="modal-container">
          <h2>Enter Student Email</h2>
          <br />
          <input
            className="modal-input"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            placeholder="Enter student email"
          />
          <div className="modal-buttons">
            <button className="send-btn" onClick={handleEmailSend}>
              Send Email
            </button>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CleaningTable;
