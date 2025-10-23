import { useEffect, useState } from "react";
import api from "../api/axios";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/users");
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div>
      <h2>Employees</h2>
      <ul>
        {employees.map((emp) => (
          <li key={emp._id}>
            {emp.name} - {emp.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
