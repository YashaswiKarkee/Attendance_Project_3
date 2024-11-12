// components/Loading.tsx
import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
