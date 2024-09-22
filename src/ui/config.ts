import i18next from "i18next";
import { UiBox, UiBtn, UiInput, UiLobbyMenu, UiLobbyTitle, UiMessage } from "../interfaces/ui";

export let loginInputsConfig: UiInput[] = [];
export let loginBtnsConfig: UiBtn[] = [];

export let registerInputsConfig: UiInput[]=[];
export let registerBtnsConfig: UiBtn[] = [];

export let messageBoxConfig:UiMessage;

export let waitBoxConfig:UiBox;

export let lobbyTitleConfig:UiLobbyTitle;
export let lobbyMenuConfig:UiLobbyMenu[]=[];

i18next.on('initialized', () => {
    loginInputsConfig = [
        {x: 0, y: -60, w: 240, h: 36, type: 'text', placeholder: i18next.t("menu:username")},
        {x: 0, y: -10, w: 240, h: 36, type: 'password', placeholder: i18next.t("menu:password")}
    ];
    loginBtnsConfig = [
        {x: 0, y: 40, w: 240, h: 38, content: i18next.t("menu:login")},
        {x: -62, y: 85, w: 115, h: 36, content: i18next.t("menu:register")},
        {x: 62, y: 85, w: 115, h: 36, content: i18next.t("menu:findAccount")}
    ];

    registerInputsConfig = [
        {x: 0, y: -100, w: 240, h: 36, type: 'text', placeholder: i18next.t("menu:username"), label:i18next.t("menu:username"),labelX:-95,labelY:-30},
        {x: 0, y: -30, w: 240, h: 36, type: 'password', placeholder: i18next.t("menu:password"), label:i18next.t("menu:password"),labelX:-89,labelY:-30},
        {x: 0, y: 40, w: 240, h: 36, type: 'password', placeholder: i18next.t("menu:repassword"), label:i18next.t("menu:repassword"),labelX:-63,labelY:-30}
    ];
    registerBtnsConfig = [
        {x: 0, y: 100, w: 240, h: 38, content: i18next.t("menu:login")},
        {x: 0, y: 150, w: 240, h: 36, content: i18next.t("menu:register")},
    ];

    messageBoxConfig = {bx:0,by:200,bw:800,bh:100,tx:-380,ty:170,ex:370,ey:230,ew:20,eh:20};

    waitBoxConfig = {bx:0,by:0,bw:130,bh:90,tx:0,ty:0,content:i18next.t("menu:waiting")};

    lobbyTitleConfig={bx:0,by:-200,bw:100,bh:100};

    lobbyMenuConfig=[
        {bx:0,by:-50,bw:300,bh:42,tx:0,ty:-50,content:i18next.t("menu:startGame")},
        {bx:0,by:0,bw:300,bh:42,tx:0,ty:0,content:i18next.t("menu:startNewGame")},
        {bx:0,by:50,bw:300,bh:42,tx:0,ty:50,content:i18next.t("menu:setting")},
        {bx:0,by:100,bw:300,bh:42,tx:0,ty:100,content:i18next.t("menu:logout")},
    ];
});