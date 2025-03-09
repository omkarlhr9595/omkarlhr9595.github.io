import { motion } from "framer-motion";
import React, { JSX } from "react";

interface TransitionProps {
  children: JSX.Element;
}

const Transition: React.FC<TransitionProps> = ({ children }) => {
  return (
    <>
      {children}
      <motion.div
        className="fixed top-0 left-0 w-full h-screen bg-[#222] z-50 transform origin-right"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 0 }}
        exit={{ scaleX: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="fixed top-0 right-0 w-full h-screen bg-[#222] z-50 transform origin-left"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        exit={{ scaleX: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  );
};

export default Transition;
