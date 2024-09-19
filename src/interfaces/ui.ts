export interface UiInput{
    x: number;
    y: number;
    w: number;
    h: number;
    type: string;
    placeholder: string;
    label?:string;
    labelX?:number;
    labelY?:number;
}

export interface UiBtn{
    x: number;
    y: number;
    w: number;
    h: number;
    content:string;
}

export interface UiMessage{
    bx:number,
    by:number,
    bw:number,
    bh:number,
    tx:number,
    ty:number,
    ex:number,
    ey:number,
    ew:number,
    eh:number,
}