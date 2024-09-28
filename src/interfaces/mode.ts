import { MODE } from "../enums/mode";

export interface ModeSet{
    mode: MODE,
    isChain: boolean,
    data?:any
}