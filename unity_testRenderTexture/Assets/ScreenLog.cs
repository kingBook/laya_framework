using UnityEngine;
/// <summary>
/// 屏幕上打印Log信息
/// </summary>
public class ScreenLog:MonoBehaviour{
	
	public bool isStackTrace=false;

	private string m_output="";
	private Vector2 m_scrollPos;
	private bool m_isPause;
	private bool m_isMinimized;
	
	protected void OnEnable(){
		Application.logMessageReceivedThreaded+=LogHandler;
	}
	
	protected void OnGUI(){
		float buttonSize=Mathf.Min(Screen.width,Screen.height)*0.1f;
		if(m_isMinimized){ 
			if(GUILayout.Button(" > ",GUILayout.MinWidth(buttonSize),GUILayout.MinHeight(buttonSize))){
				m_isMinimized=false;
			}
		}else{
			float width=Screen.width*0.3f;
			float height=Screen.height;
			GUILayout.BeginVertical();
				//滚动的文本
				m_scrollPos=GUILayout.BeginScrollView(m_scrollPos);
				GUILayout.TextArea(m_output,GUILayout.MaxWidth(width),GUILayout.ExpandHeight(true));
				GUILayout.EndScrollView();
				
				GUILayout.BeginHorizontal();
					//最小化按钮
					if(GUILayout.Button(" < ",GUILayout.MinHeight(buttonSize))){
						m_isMinimized=true;
					}
					//暂停/恢复按钮
					string pauseResumeText=m_isPause?"Resume":"Pause";
					if(GUILayout.Button(pauseResumeText,GUILayout.MinHeight(buttonSize))){
						m_isPause=!m_isPause;
					}
					//清除按钮
					if(GUILayout.Button("Clear",GUILayout.MinHeight(buttonSize))){
						m_output="";
					}
				GUILayout.EndHorizontal();
			GUILayout.EndVertical();
		}
	}
	
	private void LogHandler(string logString, string stackTrace, LogType type){
		if(m_isPause)return;
		m_output+=logString+'\n';
		if(isStackTrace){
			m_output+=stackTrace+'\n';
		}
	}
	
	protected void OnDisable(){
		Application.logMessageReceivedThreaded-=LogHandler;
	}
	
}