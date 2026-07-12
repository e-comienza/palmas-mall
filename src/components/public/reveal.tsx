"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Scroll reveal sutil: el contenido siempre es visible por defecto en
 * renderizadores sin JS (initial solo aplica con JS activo).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  items,
  className,
  itemClassName,
}: {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          className={itemClassName}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}
