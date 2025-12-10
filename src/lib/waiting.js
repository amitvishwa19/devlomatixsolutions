import { resolve } from "styled-jsx/css";

export function Wating(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}