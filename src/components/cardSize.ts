import { createContext, useContext } from "react";

/** "lg" = the large, image-led homepage size. Other pages keep "md". */
export type CardSize = "md" | "lg";
export const CardSizeContext = createContext<CardSize>("md");
export const useCardSize = () => useContext(CardSizeContext);
