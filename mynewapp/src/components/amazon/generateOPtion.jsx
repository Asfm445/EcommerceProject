import React, { memo } from "react";

function GenerateOption() {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return arr.map((i) => (
    <option value={i} key={i}>
      {i}
    </option>
  ));
}
export default memo(GenerateOption);
