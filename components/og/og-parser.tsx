"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function OgParser() {
  const [value, setValue] = useState("");

  const handleParser = async () => {
    const response = await fetch(`/api/og?url=${value}`);
    const data = await response.json();

    console.log(data)
  };

  return (
    <div>
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button onClick={handleParser}>Parse</Button>
    </div>
  );
}
