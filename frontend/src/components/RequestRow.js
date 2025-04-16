import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  LinearProgress,
  Button,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const RequestRow = ({ request, chapters }) => {
  const navigate = useNavigate();

  const selected = request.chapterIndices.map((i) => chapters[i]);
  const completed = selected.filter((ch) =>
    request.progress?.includes(ch.id),
  ).length;

  const percent = (completed / selected.length) * 100;
  const isComplete = completed === selected.length;

  return (
    <TableRow>
      <TableCell>{request.name}</TableCell>
      <TableCell>{request.purpose}</TableCell>
      <TableCell>{request.notes || "—"}</TableCell>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: "100%", transform: "scaleX(-1)" }}>
            <LinearProgress
              variant="determinate"
              value={percent}
              color={isComplete ? "success" : "primary"}
            />
          </Box>
          <Typography variant="body2">
            {completed}/{selected.length}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="center">{request.cycleCount || 0}</TableCell>
      <TableCell align="center">
        <Button
          variant="outlined"
          onClick={() => navigate(`/read/${request.id}`)}
        >
          מעבר לקריאה
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default RequestRow;
