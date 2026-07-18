import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AttendeeTable.css";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";

function MedicalServiceTable() {
  const [medicalServiceRequests, setMedicalServiceRequests] = useState([]);
  const [studentEmail, setStudentEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");

  useEffect(() => {
    // Fetch data from the API endpoint
    axios
      .get("http://localhost:5000/api/medical")
      .then((response) => {
        setMedicalServiceRequests(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const handleStatusChange = async (id, newStatus) => {
  try {
    await axios.patch(`http://localhost:5000/api/medical/${id}/status`, {
      status: newStatus,
    });

    const updatedRequest = medicalServiceRequests.find(
      (request) => request._id === id
    );

    setMedicalServiceRequests((prevRequests) =>
      prevRequests.map((request) =>
        request._id === id
          ? { ...request, status: newStatus }
          : request
      )
    );

    sendEmail(updatedRequest, newStatus);
  } catch (error) {
    console.error(error);
  }
};

  const handleEmailSend = () => {
    let emailSubject = "";
    let emailDescription = "";

    if (requestStatus === "accepted") {
      emailSubject = "Medical Service Request Accepted";
      emailDescription = "Your Medical Service request has been accepted.";
    } else if (requestStatus === "rejected") {
      emailSubject = "Medical Service Request Rejected";
      emailDescription = "Your Medical Service request has been rejected.";
    }

    // Send email with the specific status message
    sendEmail(studentEmail, emailSubject, emailDescription);

    // Close the modal after sending the email
    setIsModalOpen(false);
  };

 const sendEmail = (request, status) => {
  const serviceID = "service_xwsires";
  const templateID = "template_dkqrhwo";
  const publicKey = "uYdKv3p4FGmpYfp88";

  emailjs
    .send(
      serviceID,
      templateID,
      {
        to_email: request.email,
        student_id: request.studentID,
        room_number: request.roomID,
        service_type: request.serviceType,
        treatment_level: request.treatmentLevel,
        illness: request.illness,
        appointment_date: new Date(
          request.appointmentTime
        ).toLocaleString(),
        status: status,
      },
      {
        publicKey: publicKey,
      }
    )
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "Success",
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
      <h1>Medical Service Requests Table</h1>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Room ID</th>
            <th>Medical Service Type</th>
            <th>Treatment Level</th>
            <th>Disease</th>
            <th>Date</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicalServiceRequests.map((request) => (
            <tr key={request._id}>
              <td>{request.studentID}</td>
              <td>{request.roomID}</td>
              <td>{request.serviceType}</td>
              <td>{request.treatmentLevel}</td>
              <td>{request.illness}</td>
             
              <td>{new Date(request.appointmentTime).toLocaleString()}</td>
               <td>{request.email}</td>

              <td className="stats">{request.status}</td>
              <td>
                {request.status === "pending" && (
                  <>
                    <button
                      className="accept"
                      onClick={() =>
                        handleStatusChange(request._id, "accepted")
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="reject"
                      onClick={() =>
                        handleStatusChange(request._id, "rejected")
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

export default MedicalServiceTable;
