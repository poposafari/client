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

export interface UiBox{
    bx:number,
    by:number,
    bw:number,
    bh:number,
    tx:number,
    ty:number,
    content:string
}

export interface UiLobbyTitle{
    bx:number,
    by:number,
    bw:number,
    bh:number,
}

export interface UiLobbyMenu{
    bx:number,
    by:number,
    bw:number,
    bh:number,
    tx:number,
    ty:number,
    content:string
}

export interface Message{
    type:string,
    content:string[]
}