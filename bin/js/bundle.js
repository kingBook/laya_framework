(function () {
    'use strict';

    class BaseGame extends Laya.Script {
    }

    class PlayerPrefs {
        static deleteAll() {
            Laya.LocalStorage.clear();
        }
        static deleteKey(key) {
            Laya.LocalStorage.removeItem(key);
        }
        static getFloat(key, defaultValue = 0) {
            let value = Laya.LocalStorage.getItem(key);
            let n = parseFloat(value);
            return isNaN(n) ? defaultValue : n;
        }
        static getInt(key, defaultValue = 0) {
            if (defaultValue !== (defaultValue | 0))
                console.warn("defaultValue:" + defaultValue + "不是整数将自动取整");
            let value = Laya.LocalStorage.getItem(key);
            let n = parseInt(value);
            return isNaN(n) ? (defaultValue | 0) : (n | 0);
        }
        static getString(key, defaultValue = "") {
            let value = Laya.LocalStorage.getItem(key);
            if (value)
                return value;
            return defaultValue;
        }
        static hasKey(key) {
            if (Laya.LocalStorage.getItem(key))
                return true;
            return false;
        }
        static setFloat(key, value) {
            Laya.LocalStorage.setItem(key, value.toString());
        }
        static setInt(key, value) {
            if (value !== (value | 0))
                console.warn("value:" + value + "不是整数将自动取整");
            value = value | 0;
            Laya.LocalStorage.setItem(key, value.toString());
        }
        static setString(key, value) {
            Laya.LocalStorage.setItem(key, value);
        }
    }

    var Language;
    (function (Language) {
        Language[Language["AUTO"] = 0] = "AUTO";
        Language[Language["CN"] = 1] = "CN";
        Language[Language["EN"] = 2] = "EN";
    })(Language || (Language = {}));
    class App extends Laya.Script {
        constructor() {
            super(...arguments);
            this._language = Language.AUTO;
        }
        static get instance() {
            return App.s_instance;
        }
        static set instance(value) {
            App.s_instance = value;
        }
        get language() {
            return this._language;
        }
        get openCount() {
            return this._openCount;
        }
        onAwake() {
            App.s_instance = this;
            this.addOpenCount();
            if (this._language == Language.AUTO) {
                this.initLanguage();
            }
        }
        onEnable() {
        }
        onStart() {
        }
        onUpdate() {
        }
        onDestroy() {
        }
        getGame(index = 0) {
            return this.gameNodes[index].getComponent(BaseGame);
        }
        addOpenCount() {
            const key = "ApplicationOpenCount";
            this._openCount = PlayerPrefs.getInt(key, 0) + 1;
            PlayerPrefs.setInt(key, this._openCount);
        }
        initLanguage() {
            let isCN = navigator.language == "zh-CN";
            this._language = isCN ? Language.CN : Language.EN;
        }
    }

    class Game extends BaseGame {
        onAwake() {
        }
        onEnable() {
        }
        onStart() {
            Laya.Scene3D.load('res/LayaScene_Level/Conventional/Level.ls', Laya.Handler.create(null, function (scene) {
                Laya.stage.addChild(scene);
            }));
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("framework/core/App.ts", App);
            reg("scripts/Game.ts", Game);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "main.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
