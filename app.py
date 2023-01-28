from flask import *
from flask import Flask
from flask_caching import Cache


app=Flask(__name__)

# 加入cache 減少訪問RDS頻率，加快載入速度
cache = Cache(app,config={'CACHE_TYPE': 'SimpleCache'})

app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
from mysql.connector import pooling
import yaml
s3Id=""
s3Password=""
dbId=""
dbPassword=""
with open("data.yml","r") as stream:
    res = yaml.load(stream,Loader=yaml.FullLoader)
    s3Id=res["services"]["s3"]["id"]
    s3Password=res["services"]["s3"]["password"]
    dbId=res["services"]["db"]["id"]
    dbPassword=res["services"]["db"]["password"]





#載入&實例化jwt
from flask_jwt_extended import create_access_token, jwt_required,set_access_cookies,decode_token,get_jwt_identity,unset_jwt_cookies,JWTManager,create_refresh_token,set_refresh_cookies
jwt = JWTManager(app)
app.config["JWT_SECRET_KEY"] = "this-is-a-key-in-taipeidAttractionsProgram"  #設定jwt密鑰

mydbPool=pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=3,
    host="database-webber0971.ccvnmmc1xk8w.us-east-1.rds.amazonaws.com",
    user=dbId,
    password=dbPassword,
    buffered=True
)
print("連上資料庫")



@app.route("/")
@cache.cached(timeout=50)
def index():
	return render_template("index.html")

# 取得所有的 留言 及 image url
@app.get("/api/allMessage")
def getMessage():
    if(cache.get("nowAllMessage") is not None):
        return cache.get("nowAllMessage"),201

    connector=mydbPool.get_connection()
    mycursor=connector.cursor()
    mycursor.execute("use message")
    sql="select * from message_list order by message_id asc"
    try:
        mycursor.execute(sql)
        getInfoFromDatabase=mycursor.fetchall()
        getInfo=[]
        for i in getInfoFromDatabase:
            cellInfo={
                "id":i[0],
                "userName":i[1],
                "contentText":i[2],
                "imageUrl":i[3]
            }
            print(i)
            getInfo.append(cellInfo)

        print(getInfo)
        mycursor.close()
        connector.close()
        resp={"data":getInfo}
        cache.set("nowAllMessage",resp)
        return resp,200
    except:
        mycursor.close()
        connector.close()
        resp = {"error":True}
        return resp,400

# 上傳新加入的，留言及圖片url
@app.post("/api/allMessage")
def postMessage():
    imageUrl=request.form["imageUrl"]
    contentText=request.form["contentText"]
    print(imageUrl)
    print(contentText)
    res={
        "IMAGE":imageUrl,
        "TEXT":contentText
    }
    connector=mydbPool.get_connection()
    mycursor=connector.cursor()
    mycursor.execute("use message")
    try:
        sql="insert into message_list(user_name,content,picture_url) values (%s,%s,%s)"
        val=("ttt",contentText,imageUrl)
        mycursor.execute(sql,val)
        connector.commit()
        sql="select * from message_list order by message_id asc"
        mycursor.execute(sql)
        getInfoFromDatabase=mycursor.fetchall()
        getInfo=[]
        for i in getInfoFromDatabase:
            cellInfo={
                "id":i[0],
                "userName":i[1],
                "contentText":i[2],
                "imageUrl":i[3]
            }
            print(i)
            getInfo.append(cellInfo)
        resp={"data":getInfo}
        cache.set("nowAllMessage",resp)
        mycursor.close()
        connector.close()
        return res,200
    except:
        mycursor.close()
        connector.close()
        resp = {"error":True}
        return resp,400

# 取得 resigned url 使陌生ip可以上傳圖片
@app.get("/api/requestUploadToS3")
def requestUpload():
    import boto3
    from botocore.client import Config
    OBJECT_NAME_TO_UPLOAD = "testdata.txt"
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=s3Id,
        aws_secret_access_key=s3Password,
        config = Config(signature_version="s3v4"),
        region_name="ap-northeast-2"
    )
    bucket = "code-bear-awss"
    # 產生一個唯一的數字給圖片當作key值
    import uuid
    order_number= str(uuid.uuid1()).upper().replace('-','')
    print(order_number)
    key= order_number+".jpg" # "這邊輸入要在bucket裡面紀錄的檔案名稱"
    print (" Generating pre-signed url...")
    # 下方的url 就是 resigned url 可供任意陌生人上傳檔案，上傳的時候method 要用 put
    url=s3_client.generate_presigned_url('put_object', Params={'Bucket':bucket,'Key':key,"ContentType":"image/jpeg"}, ExpiresIn=3600)
    setUrl="https://d3ce9biuqz84nv.cloudfront.net/"+str(key)
    print(url)
    res={"url":url,"setUrl":setUrl}
    return res,200


app.run(host="0.0.0.0",port=8815)

    