import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import RequestRow from "./RequestRow";

const RequestTable = ({ requests, chapters }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>שם</TableCell>
            <TableCell>מטרה</TableCell>
            <TableCell>הערות</TableCell>
            <TableCell>התקדמות</TableCell>
            <TableCell align="center">סבבים שהושלמו</TableCell>{" "}
            {/* <- UPDATED */}
            <TableCell align="center">פעולה</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {requests.map((req) => (
            <RequestRow key={req.id} request={req} chapters={chapters} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RequestTable;
