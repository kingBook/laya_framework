export default class App extends Laya.Script{
    
    public onAwake():void{
        console.log("App::onAwake();");
    }
    
    public onEnable():void{
        console.log("App::onEnable();");
    }
    
    public onStart():void{
        console.log("App::onStart();");
        setTimeout(() => {
            console.log("open level");
            Laya.Scene.open("level.scene");
            Laya.Scene.destroy("main.scene");
        }, 3000);
    }
    
    public onDestroy():void{
        console.log("App::onDestroy();");
    }
        
}