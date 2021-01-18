import Mathf from "./Mathf";
import Mathk from "./Mathk";
import Vector2Util from "./Vector2Util";

export default class MeshUtil{
	
	public static meshTransform:Laya.Transform3D;
	public static cube:Laya.Transform3D;
	public static sphere:Laya.Transform3D;
	
	/**
	 * 创建网格
	 * @param vertexDeclaration 顶点声明，如：let vertexDeclaration = Laya.VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
	 * @param vertices 顶点列表
	 * @param indices 三角形索引列表
	 * @param subMeshIndexRangeList 各子网格的起始索引和计数,长度必须是2的倍数且大于等于2，如：[0,3, 3,3]
	 */
	public static createMesh(vertexDeclaration:Laya.VertexDeclaration, vertices:Float32Array, indices:Uint16Array,subMeshIndexRangeList:number[]=null):Laya.Mesh{
		let gl = Laya["LayaGL"].instance;
		let mesh = new Laya.Mesh();
		
		let vertexBuffer = new Laya.VertexBuffer3D(vertices.length * 4, gl.STATIC_DRAW, true);
		vertexBuffer.vertexDeclaration = vertexDeclaration;
		vertexBuffer.setData(vertices.buffer);
		mesh["_vertexBuffer"] = vertexBuffer;
		mesh["_vertexCount"] = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
		
		let indexBuffer = new Laya.IndexBuffer3D(Laya.IndexFormat.UInt16, indices.length, gl.STATIC_DRAW, true);
		indexBuffer.setData(indices);
		mesh["_indexBuffer"] = indexBuffer;
		mesh["_setBuffer"](vertexBuffer, indexBuffer);
		
		mesh["_setInstanceBuffer"](mesh["_instanceBufferStateType"]);
		
		let subMeshes = [];
		if(subMeshIndexRangeList && subMeshIndexRangeList.length>0){
			for(let i=0,len=subMeshIndexRangeList.length/2;i<len;i++){
				let subMeshIndexStart=subMeshIndexRangeList[i*2+0];
				let subMeshIndexCount=subMeshIndexRangeList[i*2+1];
				
				let subMesh = new Laya.SubMesh(mesh);
				subMesh["_vertexBuffer"] = vertexBuffer;
				subMesh["_indexBuffer"] = indexBuffer;
				subMesh["_setIndexRange"](subMeshIndexStart, subMeshIndexCount);
				let subIndexBufferStart = subMesh["_subIndexBufferStart"];
				let subIndexBufferCount = subMesh["_subIndexBufferCount"];
				let boneIndicesList = subMesh["_boneIndicesList"];
				subIndexBufferStart.length = 1;
				subIndexBufferCount.length = 1;
				boneIndicesList.length = 1;
				subIndexBufferStart[0] = subMeshIndexStart;
				subIndexBufferCount[0] = subMeshIndexCount;
				subMeshes.push(subMesh);
			}
		}else{
			let subMesh = new Laya.SubMesh(mesh);
			subMesh["_vertexBuffer"] = vertexBuffer;
			subMesh["_indexBuffer"] = indexBuffer;
			subMesh["_setIndexRange"](0, indexBuffer.indexCount);
			let subIndexBufferStart = subMesh["_subIndexBufferStart"];
			let subIndexBufferCount = subMesh["_subIndexBufferCount"];
			let boneIndicesList = subMesh["_boneIndicesList"];
			subIndexBufferStart.length = 1;
			subIndexBufferCount.length = 1;
			boneIndicesList.length = 1;
			subIndexBufferStart[0] = 0;
			subIndexBufferCount[0] = indexBuffer.indexCount;
			subMeshes.push(subMesh);
		}
		mesh["_setSubMeshes"](subMeshes);
		
		mesh.calculateBounds();
		let memorySize = vertexBuffer._byteLength + indexBuffer._byteLength;
		mesh["_setCPUMemory"](memorySize);
		mesh["_setGPUMemory"](memorySize);
		return mesh;
	}
		
	//#region CutMesh
	/**
	 * 切割网格，并返回切割后新网格数组，没被切割时返回一个长度为0的网格数组。
	 * @param mesh 
	 * @param lineStart 局部坐标,不计算z
	 * @param lineEnd 局部坐标,不计算z
	 * @param reservedId 保留的部分，切割线宽度等于0时， -1:保留切割线左侧； 1/0:保留切割线右侧。  切割线宽度大于0时，-1:保留切割线左侧；0:保留有宽度切割线交叠的部分; 1:保留切割线右侧; 2:保留交叠以外的两部分。
	 * @param lineWidth 切割线宽度
	 * @returns 返回切割后的新网格数组，lineWidth!=0 && reservedId==2 时数组长度为：2，其他都为：1
	 */
	public static cutMesh(mesh:Laya.Mesh,lineStart:Laya.Vector3,lineEnd:Laya.Vector3,reservedId:number,lineWidth:number):Laya.Mesh[]{
		console.time("cutMeshTime");
		//忽略计算z
		lineStart.z=lineEnd.z=0;
		//顶点声明
		let vertexDeclaration=mesh.getVertexDeclaration();
		//一个顶点在顶点数组中占的元素个数
		let vertexStrideCount=vertexDeclaration.vertexStride/4;
		//顶点列表
		let vertices=new Float32Array(mesh.getVertices());
		//计算保留部分的新网格
		let result:Laya.Mesh[]=[];
		if(lineWidth===0){
			//计算在切割线左、右侧/共线的三角形索引列表，长度为2，[0]:左 [1]:右/共线
			let leftRightIndices=MeshUtil.getCutLineLeftRightIndices(vertexDeclaration,vertexStrideCount,vertices,lineStart,lineEnd);
			let sideIndices=leftRightIndices[reservedId>=0?1:0];//在保留的那一侧的索引列表
			let reservedNewMesh=this.getReservedNewMesh(mesh,vertexDeclaration,vertexStrideCount,vertices,sideIndices,lineStart,lineEnd);
			result[0]=reservedNewMesh;
		}else{//计算有宽度的切割线切割
			let doubleCutLine=this.getDoubleCutLine(lineStart,lineEnd,lineWidth);
			if(reservedId==2){//保留交叠以外的两部分
				//1.切割左边缘线，保留左边部分
				lineStart=doubleCutLine[0];
				lineEnd=doubleCutLine[1];
				//计算在切割线左、右侧/共线的三角形索引列表，长度为2，[0]:左 [1]:右/共线
				let leftRightIndices=MeshUtil.getCutLineLeftRightIndices(vertexDeclaration,vertexStrideCount,vertices,lineStart,lineEnd);
				let sideIndices=leftRightIndices[0];//在保留的那一侧的索引列表
				let reservedNewMesh=this.getReservedNewMesh(mesh,vertexDeclaration,vertexStrideCount,vertices,sideIndices,lineStart,lineEnd);
				result[0]=reservedNewMesh;
				//2.切割右边缘线，保留右边部分
				lineStart=doubleCutLine[2];
				lineEnd=doubleCutLine[3];
				//计算在切割线左、右侧/共线的三角形索引列表，长度为2，[0]:左 [1]:右/共线
				leftRightIndices=MeshUtil.getCutLineLeftRightIndices(vertexDeclaration,vertexStrideCount,vertices,lineStart,lineEnd);
				sideIndices=leftRightIndices[1];//在保留的那一侧的索引列表
				reservedNewMesh=this.getReservedNewMesh(mesh,vertexDeclaration,vertexStrideCount,vertices,sideIndices,lineStart,lineEnd);
				result[1]=reservedNewMesh;
				
			}else if(reservedId!=0){//保留左/右侧部分
				let lineStartIndex=reservedId<0?0:2;
				let lineEndIndex  =reservedId<0?1:3;
				lineStart=doubleCutLine[lineStartIndex];
				lineEnd=doubleCutLine[lineEndIndex];
				//console.log("line",lineStart,lineEnd);
				//计算在切割线左、右侧/共线的三角形索引列表，长度为2，[0]:左 [1]:右/共线
				let leftRightIndices=MeshUtil.getCutLineLeftRightIndices(vertexDeclaration,vertexStrideCount,vertices,lineStart,lineEnd);
				let sideIndices=leftRightIndices[reservedId>0?1:0];//在保留的那一侧的索引列表
				let reservedNewMesh=this.getReservedNewMesh(mesh,vertexDeclaration,vertexStrideCount,vertices,sideIndices,lineStart,lineEnd);
				result[0]=reservedNewMesh;
			}else{//reservedId==0 保留交叠部分
				//1.切割左边缘线，保留右边部分
				lineStart=doubleCutLine[0];
				lineEnd=doubleCutLine[1];
				//计算在切割线左、右侧/共线的三角形索引列表，长度为2，[0]:左 [1]:右/共线
				let leftRightIndices=MeshUtil.getCutLineLeftRightIndices(vertexDeclaration,vertexStrideCount,vertices,lineStart,lineEnd);
				let sideIndices=leftRightIndices[1];//在保留的那一侧的索引列表
				let reservedNewMesh=this.getReservedNewMesh(mesh,vertexDeclaration,vertexStrideCount,vertices,sideIndices,lineStart,lineEnd);
				//2.在保留的右边部分上再切割右边缘线且保留左边部分
				lineStart=doubleCutLine[2];
				lineEnd=doubleCutLine[3];
				vertices=new Float32Array(reservedNewMesh.getVertices());
				//计算在切割线左、右侧/共线的三角形索引列表，长度为2，[0]:左 [1]:右/共线
				leftRightIndices=MeshUtil.getCutLineLeftRightIndices(vertexDeclaration,vertexStrideCount,vertices,lineStart,lineEnd);
				sideIndices=leftRightIndices[0];//在保留的那一侧的索引列表
				reservedNewMesh=this.getReservedNewMesh(reservedNewMesh,vertexDeclaration,vertexStrideCount,vertices,sideIndices,lineStart,lineEnd);
				result[0]=reservedNewMesh;
			}
		}
		console.timeEnd("cutMeshTime");
		return result;
	}
	
	/**
	 * 获取在切割线左、右侧/共线的三角形索引列表(索引表示第几组顶点)，列表长度为2，[0]左 [1]右/共线
	 * @param vertexDeclaration 顶点声明
	 * @param vertexStrideCount 一个顶点在顶点数组中占的元素个数
	 * @param vertices 顶点列表
	 * @param lineStart 切割线起始点
	 * @param lineEnd 切割线结束点
	 */
	private static getCutLineLeftRightIndices(vertexDeclaration:Laya.VertexDeclaration,vertexStrideCount:number,vertices:Float32Array,lineStart:Laya.Vector3,lineEnd:Laya.Vector3):number[][]{
		let result:number[][]=[];
		let leftList=[];
		let rightList=[];
		result[0]=leftList;
		result[1]=rightList;
		
		let vertex=new Laya.Vector3();
		let a=new Laya.Vector3();
		let b=new Laya.Vector3();
		let crossValue=new Laya.Vector3();
		for(let i=0,len=vertices.length;i<len;i+=vertexStrideCount){
			//获取顶点位置
			this.getVertex(vertexDeclaration,vertices,i,vertex,null,null);
			vertex.z=0;
			//求叉积
			Laya.Vector3.subtract(vertex,lineStart,a);
			Laya.Vector3.subtract(lineEnd,lineStart,b);
			Laya.Vector3.cross(a,b,crossValue);
			if(crossValue.z>=0){//在切割线的右侧/共线
				rightList.push(i/vertexStrideCount);
			}else{//在切割线的左侧
				leftList.push(i/vertexStrideCount);
			}
		}
		return result;
	}
	
	private static getReservedNewMesh(mesh:Laya.Mesh,vertexDeclaration:Laya.VertexDeclaration,vertexStrideCount:number,vertices:Float32Array,sideIndices:number[],lineStart:Laya.Vector3,lineEnd:Laya.Vector3):Laya.Mesh{
		console.time("getReservedNewMeshTime");
		//新的顶点列表
		let resultVertices:number[]=Array.from(vertices);
		//新的子网格索引列表
		let resultSubMeshIndices:number[][]=[];
		let isCut=false;//用于表示是否应用切割，当与切割线没有交点时不切割
		let trianglePoints=[new Laya.Vector3(),new Laya.Vector3(),new Laya.Vector3()];
		let uv0Arr=        [new Laya.Vector2(),new Laya.Vector2(),new Laya.Vector2()];
		let triangleIndices=[-1,-1,-1];
		let hasList=[false,false,false];
		let intersection01=new Laya.Vector3();
		let intersection20=new Laya.Vector3();
		let intersection01UV0=new Laya.Vector2();
		let intersection20UV0=new Laya.Vector2();
		
		//计算子网格
		for(let i=0;i<mesh.subMeshCount;i++){
			let subMesh=mesh.getSubMesh(i);
			let subMeshIndices=subMesh.getIndices();
			let newSubMeshIndices=[];
			for(let j=0,indexCount=subMeshIndices.length;j<indexCount;j+=3){
				//三角形三个顶点的索引（索引表示第几组顶点）
				triangleIndices[0]=subMeshIndices[j];
				triangleIndices[1]=subMeshIndices[j+1];
				triangleIndices[2]=subMeshIndices[j+2];
				//计算位于保留侧的点数
				let hasCount=0;
				for(let k=0;k<3;k++){
					//点是否在保留侧
					hasList[k]=sideIndices.indexOf(triangleIndices[k])>-1;
					if(hasList[k])hasCount++;
				}
				if(hasCount>=3){//三角形的三个点都位于保留侧
					//console.log("三角形的三个点都位于保留侧");
					newSubMeshIndices.push(triangleIndices[0],triangleIndices[1],triangleIndices[2]);
				}else if(hasCount<=0){//三角形的三个点都不位于保留侧
					//console.log("三角形的三个点都不位于保留侧");
				}else{//三角形的三个点分布在两侧，会出现的左右分布: 一点在右或两点在左[AB,C]、[BC,A]、[CA,B]; 两点在右或一点在左[A,BC]、[B,CA]、[C,AB];
					this.getVertex(vertexDeclaration,vertices,triangleIndices[0]*vertexStrideCount,trianglePoints[0],null,uv0Arr[0]);
					this.getVertex(vertexDeclaration,vertices,triangleIndices[1]*vertexStrideCount,trianglePoints[1],null,uv0Arr[1]);
					this.getVertex(vertexDeclaration,vertices,triangleIndices[2]*vertexStrideCount,trianglePoints[2],null,uv0Arr[2]);
					//计算三角形开始id，保留侧一个点时以保留侧的点开始，保留侧两个点时以不在保留侧的点开始
					let triangleStartId=hasList.indexOf(hasCount<=1?true:false);
					//三角形起始顶点组在 vertices 中的起始索引（索引表示从第几个开始之后的 vertexStrideCount 个元素为一个顶点组）
					let verticesTrianglesStartIndex=triangleIndices[triangleStartId]*vertexStrideCount;
					
					let point0=trianglePoints[triangleStartId];
					let point1=trianglePoints[(triangleStartId+1)%3];
					let point2=trianglePoints[(triangleStartId+2)%3];
					
					let uv0_0=uv0Arr[triangleStartId];
					let uv0_1=uv0Arr[(triangleStartId+1)%3];
					let uv0_2=uv0Arr[(triangleStartId+2)%3];
					//在xy平面上计算交点
					let point0Z=point0.z, point1Z=point1.z, point2Z=point2.z;
					point0.z=0, point1.z=0, point2.z=0;//z设置为0，计算出交点后再恢复
					let isInsect01=Mathk.getTwoLineSegmentsIntersection(lineStart,lineEnd,point0,point1,intersection01);
					let isInsect20=Mathk.getTwoLineSegmentsIntersection(lineStart,lineEnd,point2,point0,intersection20);
					//计算交点的z
					let dx=intersection01.x-point0.x;
					let dy=intersection01.y-point0.y;
					let t01=Math.sqrt(dx*dx+dy*dy)/Laya.Vector3.distance(point0,point1);
					dx=intersection20.x-point2.x;
					dy=intersection20.y-point2.y;
					
					let t20=Math.sqrt(dx*dx+dy*dy)/Laya.Vector3.distance(point2,point0);
					intersection01.z=point0Z+(point1Z-point0Z)*t01;
					intersection20.z=point2Z+(point0Z-point2Z)*t20;
					point0.z=point0Z, point1.z=point1Z, point2.z=point2Z;//恢复z
					
					if(isInsect01 && isInsect20){
						isCut=true;
						//计算交点01的UV0
						let intersection01T=Mathf.clamp01(Laya.Vector3.distance(intersection01,point0)/Laya.Vector3.distance(point0,point1));
						Vector2Util.subtract(uv0_1,uv0_0,intersection01UV0);
						Vector2Util.scale(intersection01UV0,intersection01T,intersection01UV0);
						Vector2Util.add(uv0_0,intersection01UV0,intersection01UV0);
						//计算交点20的UV0
						let intersection20T=Mathf.clamp01(Laya.Vector3.distance(intersection20,point2)/Laya.Vector3.distance(point2,point0));
						Vector2Util.subtract(uv0_0,uv0_2,intersection20UV0);
						Vector2Util.scale(intersection20UV0,intersection20T,intersection20UV0);
						Vector2Util.add(uv0_2,intersection20UV0,intersection20UV0);
						//下一步添加的两个交点在 resultVertices 中顶点组索引（索引表示第几组索引）
						let intersection01Index=resultVertices.length/vertexStrideCount;
						let intersection20Index=intersection01Index+1;
						//添加切割的两组顶点
						for(let n=0;n<2;n++){
							for(let m=0;m<vertexStrideCount;m++){
								//先复制两组'三角起始顶点'并添加到尾部，再更改
								resultVertices.push(vertices[verticesTrianglesStartIndex+m]);
							}
						}
						//修改两组顶点的位置、UV0
						this.setVertex(vertexDeclaration,resultVertices,intersection01Index*vertexStrideCount,intersection01,null,intersection01UV0);
						this.setVertex(vertexDeclaration,resultVertices,intersection20Index*vertexStrideCount,intersection20,null,intersection20UV0);
						
						if(hasCount<=1){//保留侧一个点
							//添加切割后的三角形,顺序为：三角形开始索引、交点01索引，交点20索引
							newSubMeshIndices.push(triangleIndices[triangleStartId],intersection01Index,intersection20Index);
							//从 resutVertices 中移除丢弃的两个顶点组
						}else{//保留侧两个点
							newSubMeshIndices.push(intersection01Index,triangleIndices[(triangleStartId+1)%3],intersection20Index);
							newSubMeshIndices.push(triangleIndices[(triangleStartId+1)%3],triangleIndices[(triangleStartId+2)%3],intersection20Index);
							//从 resutVertices 中移除丢弃的一个顶点组
						}
					}
				}
			}//end for j
			if(newSubMeshIndices.length>0){
				resultSubMeshIndices.push(newSubMeshIndices);
			}
		}//end for i
		
		let result:Laya.Mesh=null;
		//如果被切割到，则创建保留侧网格
		if(isCut){
			result=this.createMeshWithCutResult(vertexDeclaration,resultVertices,resultSubMeshIndices);
		}
		console.timeEnd("getReservedNewMeshTime");
		return result;
	}
	
	private static createMeshWithCutResult(vertexDeclaration:Laya.VertexDeclaration,resultVertices:number[],resultSubMeshIndices:number[][]):Laya.Mesh{
		let vertices=new Float32Array(resultVertices);
		let indices:number[]=[];
		let subMeshInedxRangeList:number[]=[];
		
		for(let i=0,len=resultSubMeshIndices.length;i<len;i++){
			let subMeshIndices=resultSubMeshIndices[i];
			subMeshInedxRangeList.push(indices.length,subMeshIndices.length);//子网格起始索引，索引计数
			for(let j=0,l=subMeshIndices.length;j<l;j++){
				indices.push(subMeshIndices[j]);
			}
		}
		return this.createMesh(vertexDeclaration,vertices,new Uint16Array(indices),subMeshInedxRangeList);
	}
	
	/**
	 * 设置一个顶点组的信息
	 * @param vertexDeclaration 
	 * @param resultVertices 
	 * @param startIndex 表示顶点组在 vertices 中的起始索引号
	 * @param position 
	 * @param uv0 
	 */
	private static setVertex(vertexDeclaration:Laya.VertexDeclaration,resultVertices:number[],startIndex:number,position:Laya.Vector3=null,normal:Laya.Vector3=null,uv0:Laya.Vector2=null):void{
		for(let i=0,len=vertexDeclaration.vertexElementCount;i<len;i++){
			let element=vertexDeclaration.getVertexElementByIndex(i);
			let elementUsage=element.elementUsage;
			let index=startIndex+element.offset/4;
			if(elementUsage===Laya.VertexMesh.MESH_POSITION0){
				if(position){
					resultVertices[index]  =position.x;
					resultVertices[index+1]=position.y;
					resultVertices[index+2]=position.z;
				}
			}else if(elementUsage===Laya.VertexMesh.MESH_NORMAL0){
				if(normal){
					resultVertices[index]  =normal.x;
					resultVertices[index+1]=normal.y;
					resultVertices[index+2]=normal.z;
				}
			}else if(elementUsage===Laya.VertexMesh.MESH_TEXTURECOORDINATE0){
				if(uv0){
					resultVertices[index]  =uv0.x;
					resultVertices[index+1]=uv0.y;
				}
			}
		}
	}
	
	/**
	 * 获取一个顶点组的信息
	 * @param vertexDeclaration 
	 * @param vertices 
	 * @param startIndex 表示顶点组在 vertices 中的起始索引号
	 * @param outPosition 
	 * @param outNormal 
	 * @param outUV0 
	 */
	private static getVertex(vertexDeclaration:Laya.VertexDeclaration,vertices:Float32Array,startIndex:number,outPosition:Laya.Vector3=null,outNormal:Laya.Vector3=null,outUV0:Laya.Vector2=null):void{
		for(let i=0,len=vertexDeclaration.vertexElementCount;i<len;i++){
			let element=vertexDeclaration.getVertexElementByIndex(i);
			let elementUsage=element.elementUsage;
			let index=startIndex+element.offset/4;
			if(elementUsage===Laya.VertexMesh.MESH_POSITION0){
				if(outPosition){
					outPosition.x=vertices[index];
					outPosition.y=vertices[index+1];
					outPosition.z=vertices[index+2];
				}
			}else if(elementUsage===Laya.VertexMesh.MESH_NORMAL0){
				if(outNormal){
					outNormal.x=vertices[index];
					outNormal.y=vertices[index+1];
					outNormal.z=vertices[index+2];
				}
			}else if(elementUsage===Laya.VertexMesh.MESH_TEXTURECOORDINATE0){
				if(outUV0){
					outUV0.x=vertices[index];
					outUV0.y=vertices[index+1];
				}
			}
		}
	}
	
	/**
	 * 返回具体宽度的切割线的左右边缘两条切割线（忽略计算z），[0,1]:左边缘线；[2,3]:右边缘线。
	 * @param lineStart 忽略计算z
	 * @param lineEnd 忽略计算z
	 * @param lineWidth 
	 */
	private static getDoubleCutLine(lineStart:Laya.Vector3,lineEnd:Laya.Vector3,lineWidth:number):Laya.Vector3[]{
		let raletive=new Laya.Vector3();
		Laya.Vector3.subtract(lineEnd,lineStart,raletive);
		
		let angle=Math.atan2(raletive.y,raletive.x);
		let angleLeft=angle+Math.PI*0.5;
		let angleRight=angle-Math.PI*0.5;
		
		let lineStartLeft=new Laya.Vector3();
		lineStartLeft.x=lineStart.x+Math.cos(angleLeft)*lineWidth*0.5;
		lineStartLeft.y=lineStart.y+Math.sin(angleLeft)*lineWidth*0.5;
		
		let lineStartRight=new Laya.Vector3();
		lineStartRight.x=lineStart.x+Math.cos(angleRight)*lineWidth*0.5;
		lineStartRight.y=lineStart.y+Math.sin(angleRight)*lineWidth*0.5;
		
		let lineEndLeft=new Laya.Vector3();
		Laya.Vector3.add(lineStartLeft,raletive,lineEndLeft);
		
		let lineEndRight=new Laya.Vector3();
		Laya.Vector3.add(lineStartRight,raletive,lineEndRight);
		
		let result:Laya.Vector3[]=[
			lineStartLeft,lineEndLeft,
			lineStartRight,lineEndRight
		];
		return result;
	}
	//#endregion CutMesh
	
	
}