// src/components/Footer.js

import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        backgroundColor: "#1e1e1e",
        color: "#ffffff",
        padding: "1rem 0",
        textAlign: "center",
        marginTop: "2rem",
      }}
    >
      <p style={{ margin: "0.5rem 0" }}>
        Contactez-moi :{" "}
        <a
          href="mailto:rebiichokri@gmail.com"
          style={{ color: "#61dafb", textDecoration: "none" }}
        >
          rebiichokri@gmail.com
        </a>
      </p>
      <p style={{ margin: "0.5rem 0" }}>© 2025 Chokri Rebii. Tous droits réservés.</p>
    </motion.footer>
  );
};

export default Footer;
