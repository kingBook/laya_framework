using UnityEngine;
using UnityEngine.UI;

public class Test:MonoBehaviour{
	
	public RawImage rawImage;
	public Camera cam;

	private RenderTexture m_renderTexture;
	
	private void Start(){
		m_renderTexture=new RenderTexture(512,512,16,RenderTextureFormat.ARGB32);

		rawImage.texture=m_renderTexture;
		cam.targetTexture=m_renderTexture;
		//必须为 CameraClearFlags.Depth ，CameraClearFlags.Nothing时会不显示
		cam.clearFlags=CameraClearFlags.Depth;
	}
}