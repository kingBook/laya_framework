export default class Tool{
	private static transVertex0=new Laya.Vector3();
	private static transVertex1=new Laya.Vector3();
	private static transVertex2=new Laya.Vector3();
	public static linearModel(sprite3D:Laya.Sprite3D, lineSprite3D:Laya.PixelLineSprite3D, color:Laya.Color){
		if (sprite3D instanceof Laya.MeshSprite3D) {
			let meshSprite3D = sprite3D;
			let mesh = meshSprite3D.meshFilter.sharedMesh;
			let positions = [];
			mesh.getPositions(positions);
			for(let i=0;i<mesh.subMeshCount;i++){
				let indices = mesh.getSubMesh(i).getIndices();
				for (var j = 0; j < indices.length; j += 3) {
					var vertex0 = positions[indices[j]];
					var vertex1 = positions[indices[j + 1]];
					var vertex2 = positions[indices[j + 2]];
					Laya.Vector3.transformCoordinate(vertex0, meshSprite3D.transform.worldMatrix, this.transVertex0);
					Laya.Vector3.transformCoordinate(vertex1, meshSprite3D.transform.worldMatrix, this.transVertex1);
					Laya.Vector3.transformCoordinate(vertex2, meshSprite3D.transform.worldMatrix, this.transVertex2);
					lineSprite3D.addLine(this.transVertex0, this.transVertex1, color, color);
					lineSprite3D.addLine(this.transVertex1, this.transVertex2, color, color);
					lineSprite3D.addLine(this.transVertex2, this.transVertex0, color, color);
				}
			}
		}

		for (var i = 0, n = sprite3D.numChildren; i < n; i++)
			Tool.linearModel((sprite3D.getChildAt(i)) as Laya.Sprite3D, lineSprite3D, color);
    }

}