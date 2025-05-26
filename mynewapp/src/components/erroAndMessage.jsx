import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

function Error(props) {
  const { message, duration = 3000 } = props; // Default duration is 3 seconds
  const [open, setOpen] = useState(true);

  // Automatically close the error message after the specified duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, duration);

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [duration]);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={() => setOpen(false)}
    >
        <Alert onClose={() => setOpen(false)} severity="error" variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Error;