import { useState } from "react";

interface CustomizeProps {
  ready: boolean;
}

export default function Customize({ready}: CustomizeProps) {
  return (
    <div className="w-full h-full p-10 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Customize Your Experience
        </h1>
        <p className="text-muted-foreground">
          Let's personalize your cooking journey
        </p>
      </div>
    </div>
  );
}
