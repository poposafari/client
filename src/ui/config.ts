import i18next from "i18next";
import { UiBtn, UiInput } from "../interfaces/input";

export const loginInputsConfig:UiInput[] = [
    {x:0,y:-60,w:240,h:36,type:'text',placeholder:i18next.t("menu:username")},
    {x:0,y:-10,w:240,h:36,type:'password',placeholder:i18next.t("menu:password")}
];

export const loginBtnsConfig: UiBtn[] = [
    {x:0,y:40,w:240,h:38,content:i18next.t("menu:login")},
    {x:-62,y:85,w:115,h:36,content:i18next.t("menu:register")},
    {x:62,y:85,w:115,h:36,content:i18next.t("menu:findAccount")},
];